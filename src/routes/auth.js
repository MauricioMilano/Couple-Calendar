import express from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getPartnerByName, comparePin, getPartnerById } from "../models/partners.js";

dotenv.config();
const SESSION_SECRET = process.env.SESSION_SECRET;
const SESSION_COOKIE = "session";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts, please try later", code: "ERR_RATE_LIMIT" },
});

router.post("/login", loginLimiter, async (req, res) => {
  const { name, pin, partnerId } = req.body || {};

  if ((!name && !partnerId) || !pin) {
    return res.status(422).json({ error: "Name (or partnerId) and PIN required", code: "ERR_INVALID_INPUT" });
  }

  let partner;
  if (partnerId) {
    partner = getPartnerById(partnerId);
  } else {
    partner = getPartnerByName(name);
  }

  if (!partner) {
    return res.status(401).json({ error: "Invalid credentials", code: "ERR_INVALID_CREDENTIALS" });
  }

  const ok = await comparePin(pin, partner.pin_hash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials", code: "ERR_INVALID_CREDENTIALS" });
  }

  const token = jwt.sign({ id: partner.id, name: partner.name }, SESSION_SECRET, { expiresIn: "7d" });

  const secure = process.env.NODE_ENV === "production";

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({ ok: true, partner: { id: partner.id, name: partner.name } });
});

router.post("/logout", (req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    return res.status(401).json({ error: "Not authenticated", code: "ERR_NOT_AUTH" });
  }
  try {
    const payload = jwt.verify(token, SESSION_SECRET);
    // payload has id and name
    return res.json({ id: payload.id, name: payload.name });
  } catch (err) {
    return res.status(401).json({ error: "Invalid session", code: "ERR_INVALID_SESSION" });
  }
});

export default router;