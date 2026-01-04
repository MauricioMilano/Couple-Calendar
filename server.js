import express from "express";
import path from "path";
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

// Serve manifest and service-worker and other assets from /public automatically
const publicDir = path.join(process.cwd(), "public");
app.use(express.static(publicDir));

// Root handling: if no partners exist, serve setup.html, else serve index.html
import { partnersCount } from "./src/models/partners.js";

app.get("/", async (req, res, next) => {
  try {
    const count = partnersCount();
    if (count === 0) {
      return res.sendFile(path.join(publicDir, "setup.html"));
    } else {
      return res.sendFile(path.join(publicDir, "index.html"));
    }
  } catch (err) {
    next(err);
  }
});

// SPA fallback for non-API routes -> serve index.html (when app configured)
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found", code: "ERR_NOT_FOUND" });
  }
  const indexFile =
    partnersCount() === 0
      ? path.join(publicDir, "setup.html")
      : path.join(publicDir, "index.html");
  res.sendFile(indexFile);
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