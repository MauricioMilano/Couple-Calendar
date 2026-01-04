import { getDb } from "../db/index.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export function createPartner(name, pinHash) {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO partners (name, pin_hash) VALUES (?, ?)`
  );
  const info = stmt.run(name, pinHash);
  return { id: info.lastInsertRowid, name };
}

export function partnersCount() {
  const db = getDb();
  const row = db.prepare(`SELECT COUNT(*) as cnt FROM partners`).get();
  return row ? row.cnt : 0;
}

export function getPartnerByName(name) {
  const db = getDb();
  return db.prepare(`SELECT id, name, pin_hash FROM partners WHERE name = ?`).get(name);
}

export function getPartnerById(id) {
  const db = getDb();
  return db.prepare(`SELECT id, name FROM partners WHERE id = ?`).get(id);
}

export async function hashPin(pin) {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function comparePin(pin, hash) {
  return bcrypt.compare(pin, hash);
}