import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export function openDb(dataDir) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    throw new Error(
      `Cannot create data directory "${dataDir}". Check volume mount and permissions. ${err.message}`
    );
  }
  const dbPath = path.join(dataDir, "waitlist.db");
  try {
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("busy_timeout = 5000");
    db.exec(`
      CREATE TABLE IF NOT EXISTS signups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_signups_created ON signups(created_at DESC);
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    return db;
  } catch (err) {
    throw new Error(
      `Cannot open SQLite at "${dbPath}". Mount a writable volume at DATA_DIR. ${err.message}`
    );
  }
}

export function addSignup(db, email) {
  const normalized = email.trim().toLowerCase();
  const info = db
    .prepare("INSERT INTO signups (email) VALUES (?)")
    .run(normalized);
  return { id: Number(info.lastInsertRowid), email: normalized };
}

export function listSignups(db) {
  return db
    .prepare("SELECT id, email, created_at FROM signups ORDER BY created_at DESC")
    .all();
}

export function countSignups(db) {
  const row = db.prepare("SELECT COUNT(*) AS total FROM signups").get();
  return Number(row.total);
}

export function signupExists(db, email) {
  const row = db
    .prepare("SELECT 1 AS ok FROM signups WHERE email = ? COLLATE NOCASE")
    .get(email.trim().toLowerCase());
  return Boolean(row);
}

export function getSettings(db) {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  const out = {};
  for (const row of rows) {
    out[row.key] = row.value;
  }
  return out;
}

export function setSettings(db, values) {
  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  const tx = db.transaction((entries) => {
    for (const [key, value] of entries) {
      upsert.run(key, value);
    }
  });
  tx(Object.entries(values));
}
