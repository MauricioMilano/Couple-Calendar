import express from "express";
import { hashPin, createPartner, partnersCount } from "../models/partners.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const count = partnersCount();
    if (count > 0) {
      return res.status(400).json({ error: "Already configured", code: "ERR_ALREADY_CONFIGURED" });
    }

    const { partner1Name, partner1Pin, partner2Name, partner2Pin } = req.body || {};

    if (!partner1Name || !partner2Name) {
      return res.status(422).json({ error: "Names are required", code: "ERR_INVALID_INPUT" });
    }

    if (!partner1Pin || !partner2Pin) {
      return res.status(422).json({ error: "Both PINs are required", code: "ERR_INVALID_INPUT" });
    }

    if (typeof partner1Pin !== "string" || partner1Pin.length < 4) {
      return res.status(422).json({ error: "partner1Pin must be at least 4 characters", code: "ERR_INVALID_PIN" });
    }

    if (typeof partner2Pin !== "string" || partner2Pin.length < 4) {
      return res.status(422).json({ error: "partner2Pin must be at least 4 characters", code: "ERR_INVALID_PIN" });
    }

    // Hash pins
    const [h1, h2] = await Promise.all([hashPin(partner1Pin), hashPin(partner2Pin)]);

    createPartner(partner1Name, h1);
    createPartner(partner2Name, h2);

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Setup error:", err);
    return res.status(500).json({ error: "Failed to setup", code: "ERR_SETUP_FAILED" });
  }
});

export default router;