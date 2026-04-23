const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.SYNTRA_DB_PATH || path.resolve(__dirname, "../../data/syntra-pro.db");

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let _db = null;

function getDb(dbPath) {
  const resolvedPath = dbPath || DB_PATH;
  if (_db) return _db;
  ensureDir(resolvedPath);
  _db = new Database(resolvedPath);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initSchema(_db);
  return _db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      energy_level INTEGER NOT NULL CHECK(energy_level BETWEEN 1 AND 10),
      mood INTEGER NOT NULL CHECK(mood BETWEEN 1 AND 10),
      stress_level INTEGER NOT NULL CHECK(stress_level BETWEEN 1 AND 10),
      overall_score REAL,
      notes TEXT DEFAULT '',
      sleep_hours REAL DEFAULT 0,
      hydration_ml INTEGER DEFAULT 0,
      exercise_minutes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS symptoms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      name TEXT NOT NULL,
      severity INTEGER DEFAULT 5 CHECK(severity BETWEEN 1 AND 10),
      FOREIGN KEY (log_id) REFERENCES daily_logs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS diet_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      description TEXT NOT NULL,
      health_score INTEGER DEFAULT 3 CHECK(health_score BETWEEN 1 AND 5),
      calories INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      FOREIGN KEY (log_id) REFERENCES daily_logs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
    CREATE INDEX IF NOT EXISTS idx_symptoms_log_id ON symptoms(log_id);
    CREATE INDEX IF NOT EXISTS idx_symptoms_date ON symptoms(date);
    CREATE INDEX IF NOT EXISTS idx_diet_logs_log_id ON diet_logs(log_id);
    CREATE INDEX IF NOT EXISTS idx_diet_logs_date ON diet_logs(date);
  `);
}

function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

function resetDb() {
  _db = null;
}

module.exports = { getDb, closeDb, resetDb, DB_PATH };
