import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  console.error("SESSION_SECRET is required. Set it in your environment.");
  process.exit(1);
}

import { initDb, getDb } from "./src/db/index.js";
import setupRouter from "./src/routes/setup.js";
import authRouter from "./src/routes/auth.js";
import eventsRouter from "./src/routes/events.js";

await initDb();

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// API routes prefix
app.use("/api/setup", setupRouter);
app.use("/api/auth", authRouter);
app.use("/api/events", eventsRouter);

// Serve built assets from /dist
const distDir = path.join(process.cwd(), "dist");
app.use(express.static(distDir, { path : "/" }));

// Also serve top-level PWA assets from /public so the service-worker and manifest are
// available at the application root (required for SW scope and proper PWA behavior).
const publicDir = path.join(process.cwd(), "public");

// Serve service worker at the root and ensure it is not aggressively cached.
app.get('/service-worker.js', (req, res, next) => {
  const swPath = path.join(publicDir, 'service-worker.js');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  // Allow the service worker to control the entire origin if desired
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(swPath, (err) => {
    if (err) next(err);
  });
});

// Serve manifest.json from /manifest.json
app.get('/manifest.json', (req, res, next) => {
  const manifestPath = path.join(publicDir, 'manifest.json');
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(manifestPath, (err) => {
    if (err) next(err);
  });
});

// Serve favicon from public if present
app.get('/favicon.ico', (req, res, next) => {
  const fav = path.join(publicDir, 'favicon.ico');
  res.sendFile(fav, (err) => {
    if (err) next(err);
  });
});

// Additionally, serve any other static files inside /public at the root when not
// shadowed by /dist assets.
app.use(express.static(publicDir));


// Root handling: if no partners exist prefer serving a dedicated setup page when present.
// If the static `public/setup.html` is not present (many installs use the React SPA for setup),
// fall back to serving the SPA `index.html` so client-side routes like /setup work.
import { partnersCount } from "./src/models/partners.js";

app.get("/", async (req, res, next) => {
  try {
    const count = partnersCount();
    const setupPath = path.join(publicDir, "setup.html");
    const publicIndexPath = path.join(publicDir, "index.html");
    const distIndexPath = path.join(distDir, "index.html");

    if (count === 0 && fs.existsSync(setupPath)) {
      return res.sendFile(setupPath);
    }

    // Prefer built SPA in /dist when available (this happens when running the production build).
    // Otherwise fall back to public/index.html which is used during development without build.
    if (fs.existsSync(distIndexPath)) {
      return res.sendFile(distIndexPath);
    }

    return res.sendFile(publicIndexPath);
  } catch (err) {
    next(err);
  }
});

// SPA fallback for non-API routes -> serve index.html (when app configured)
app.use((req, res, next) => {
  // only handle GET requests here (let API routes and others pass through)
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api/")) return next();

  const setupPath = path.join(publicDir, "setup.html");
  const indexPath = path.join(publicDir, "index.html");

  // If there is a static setup.html and the app is unconfigured, prefer that. Otherwise
  // always serve the SPA index.html so client-side routes (e.g. /setup) work.
  if (partnersCount() === 0 && fs.existsSync(setupPath)) {
    return res.sendFile(setupPath);
  }

  // Prefer dist index when available (built SPA). Otherwise serve public index.html.
  const distIndexPath = path.join(distDir, "index.html");
  const publicIndexPath = path.join(publicDir, "index.html");
  if (fs.existsSync(distIndexPath)) {
    return res.sendFile(distIndexPath);
  }

  return res.sendFile(publicIndexPath);
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ error: "Internal server error", code: "ERR_INTERNAL_SERVER" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
