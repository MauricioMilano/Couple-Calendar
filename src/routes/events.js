import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getEventsBetween, getEventById, createEvent, updateEvent, deleteEvent } from "../models/events.js";
const router = express.Router();

// List events between start and end (inclusive)
// GET /api/events?start=ISO&end=ISO
router.get("/", (req, res) => {
  const { start, end } = req.query || {};
  if (!start || !end) {
    return res.status(422).json({ error: "start and end query params required", code: "ERR_INVALID_INPUT" });
  }
  const startIso = String(start);
  const endIso = String(end);
  // Basic validation: ISO-ish
  if (isNaN(Date.parse(startIso)) || isNaN(Date.parse(endIso))) {
    return res.status(422).json({ error: "Invalid date format", code: "ERR_INVALID_DATE" });
  }
  const events = getEventsBetween(startIso, endIso);
  return res.json({ events });
});

// Get specific event
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const ev = getEventById(id);
  if (!ev) {
    return res.status(404).json({ error: "Event not found", code: "ERR_EVENT_NOT_FOUND" });
  }
  return res.json({ event: ev });
});

// Create event (protected)
router.post("/", requireAuth, (req, res) => {
  const { title, description, start_iso, end_iso, all_day } = req.body || {};
  if (!title || !start_iso || !end_iso) {
    return res.status(422).json({ error: "title, start_iso and end_iso required", code: "ERR_INVALID_INPUT" });
  }
  if (isNaN(Date.parse(start_iso)) || isNaN(Date.parse(end_iso))) {
    return res.status(422).json({ error: "Invalid date format", code: "ERR_INVALID_DATE" });
  }
  const created = createEvent({
    title,
    description,
    start_iso,
    end_iso,
    all_day: all_day ? 1 : 0,
    created_by: req.partner.id,
  });
  return res.status(201).json({ event: created });
});

// Update event (protected)
router.put("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const ev = getEventById(id);
  if (!ev) {
    return res.status(404).json({ error: "Event not found", code: "ERR_EVENT_NOT_FOUND" });
  }

  const allowed = ["title", "description", "start_iso", "end_iso", "all_day"];
  const payload = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }

  if ((payload.start_iso && isNaN(Date.parse(payload.start_iso))) || (payload.end_iso && isNaN(Date.parse(payload.end_iso)))) {
    return res.status(422).json({ error: "Invalid date format", code: "ERR_INVALID_DATE" });
  }

  const updated = updateEvent(id, payload);
  return res.json({ event: updated });
});

// Delete event (protected)
router.delete("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const ev = getEventById(id);
  if (!ev) {
    return res.status(404).json({ error: "Event not found", code: "ERR_EVENT_NOT_FOUND" });
  }
  const ok = deleteEvent(id);
  if (!ok) {
    return res.status(500).json({ error: "Failed to delete", code: "ERR_DELETE_FAILED" });
  }
  return res.status(204).send();
});

export default router;