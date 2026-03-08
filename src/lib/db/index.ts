/**
 * SQLite Database — Singleton Connection
 *
 * Local-first persistence using better-sqlite3 with WAL mode.
 * All tables are created on first access.
 */

import Database from 'better-sqlite3';
import path from 'path';

const DEFAULT_DB_PATH = path.join(
  process.cwd(),
  '.mission-control',
  'data.db',
);

let db: Database.Database | null = null;

/**
 * Schema applied on first connection. All migrations live here
 * for now — move to versioned migrations when the schema stabilises.
 */
function applySchema(db: Database.Database): void {
  db.exec(`
    -- Registered agents known to Mission Control.
    -- Tracks stable identity + last-known runtime state.
    -- Live volatile state (tokens, cost) stays in the adapter layer.
    CREATE TABLE IF NOT EXISTS agents (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      status          TEXT NOT NULL DEFAULT 'offline',
      last_heartbeat  TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- A run is a single execution lifecycle: pending → running → terminal.
    CREATE TABLE IF NOT EXISTS runs (
      id          TEXT PRIMARY KEY,
      agent_id    TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'pending',
      title       TEXT,
      started_at  TEXT,
      ended_at    TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Append-only event log. The canonical audit trail for all
    -- state changes in Mission Control.
    -- entity_type + entity_id reference the subject of the event.
    CREATE TABLE IF NOT EXISTS events (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      type          TEXT NOT NULL,
      entity_type   TEXT,
      entity_id     TEXT,
      data          TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Structured log entries attached to a specific run.
    CREATE TABLE IF NOT EXISTS logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id      TEXT NOT NULL,
      level       TEXT NOT NULL DEFAULT 'info',
      message     TEXT NOT NULL,
      data        TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- TODO: commands table deferred.
    -- A commands table (operator-issued directives to agents) is likely needed
    -- but the lifecycle is not yet well-defined: issuer identity, target
    -- resolution, acknowledgement semantics, retry/timeout behaviour.
    -- Introduce when the command execution path is designed end-to-end.

    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
    CREATE INDEX IF NOT EXISTS idx_events_entity ON events(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_logs_run_id ON logs(run_id);
    CREATE INDEX IF NOT EXISTS idx_runs_agent_id ON runs(agent_id);
    CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);
  `);
}

/**
 * Get the singleton database connection.
 *
 * Accepts an optional path override for testing (in-memory via ':memory:').
 * When a path is provided it bypasses the singleton — each call returns
 * a fresh connection. This keeps production simple and tests isolated.
 */
export function getDb(dbPath?: string): Database.Database {
  if (dbPath) {
    const testDb = new Database(dbPath);
    testDb.pragma('journal_mode = WAL');
    applySchema(testDb);
    return testDb;
  }

  if (db) {
    return db;
  }

  // Ensure the directory exists
  const dir = path.dirname(DEFAULT_DB_PATH);
  const fs = require('fs');
  fs.mkdirSync(dir, { recursive: true });

  db = new Database(DEFAULT_DB_PATH);
  db.pragma('journal_mode = WAL');
  applySchema(db);
  return db;
}

/**
 * Close the singleton connection. Used in tests and shutdown.
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
