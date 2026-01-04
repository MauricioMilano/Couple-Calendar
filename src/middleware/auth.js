import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getPartnerById, getPartnerByName } from "../models/partners.js";
dotenv.config();

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  console.error("SESSION_SECRET is required in middleware.");
  process.exit(1);
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.session;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated", code: "ERR_NOT_AUTH" });
  }
  try {
    const payload = jwt.verify(token, SESSION_SECRET);
    // payload should contain partnerId
    req.partner = {
      id: payload.id,
      name: payload.name,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid session", code: "ERR_INVALID_SESSION" });
  }
}