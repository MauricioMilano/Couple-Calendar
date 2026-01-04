import { getDb } from "../db/index.js";

export function createEvent({ title, description, start_iso, end_iso, all_day = 0, created_by = null }) {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO events (title, description, start_iso, end_iso, all_day, created_by) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const info = stmt.run(title, description || null, start_iso, end_iso, all_day ? 1 : 0, created_by);
  const id = info.lastInsertRowid;
  return getEventById(id);
}

export function getEventById(id) {
  const db = getDb();
  return db.prepare(`SELECT id, title, description, start_iso, end_iso, all_day, created_by FROM events WHERE id = ?`).get(id);
}

export function updateEvent(id, data) {
  const db = getDb();

  const fields = [];
  const values = [];

  if (data.title !== undefined) {
    fields.push("title = ?");
    values.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description);
  }
  if (data.start_iso !== undefined) {
    fields.push("start_iso = ?");
    values.push(data.start_iso);
  }
  if (data.end_iso !== undefined) {
    fields.push("end_iso = ?");
    values.push(data.end_iso);
  }
  if (data.all_day !== undefined) {
    fields.push("all_day = ?");
    values.push(data.all_day ? 1 : 0);
  }

  if (fields.length === 0) {
    return getEventById(id);
  }

  fields.push("updated_at = CURRENT_TIMESTAMP");

  const stmt = db.prepare(`UPDATE events SET ${fields.join(", ")} WHERE id = ?`);
  stmt.run(...values, id);

  return getEventById(id);
}

export function deleteEvent(id) {
  const db = getDb();
  const stmt = db.prepare(`DELETE FROM events WHERE id = ?`);
  const info = stmt.run(id);
  return info.changes > 0;
}

export function getEventsBetween(startIso, endIso) {
  const db = getDb();
  // Overlapping intervals: event.start <= end AND event.end >= start
  const stmt = db.prepare(
    `SELECT id, title, description, start_iso, end_iso, all_day, created_by FROM events
     WHERE start_iso <= ? AND end_iso >= ?
     ORDER BY start_iso ASC`
  );
  return stmt.all(endIso, startIso);
}