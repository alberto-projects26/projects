import { describe, it, expect, afterEach } from 'vitest';
import type Database from 'better-sqlite3';
import { getDb } from '@/lib/db';

describe('Database', () => {
  let db: Database.Database;

  afterEach(() => {
    db?.close();
  });

  it('should create an in-memory database', () => {
    db = getDb(':memory:');
    expect(db).toBeDefined();
    expect(db.open).toBe(true);
  });

  it('should request WAL journal mode (in-memory falls back to "memory")', () => {
    db = getDb(':memory:');
    const result = db.pragma('journal_mode') as { journal_mode: string }[];
    expect(['wal', 'memory']).toContain(result[0].journal_mode);
  });

  it('should create all required tables', () => {
    db = getDb(':memory:');
    const tables = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
      )
      .all() as { name: string }[];

    const names = tables.map(t => t.name);
    expect(names).toContain('agents');
    expect(names).toContain('runs');
    expect(names).toContain('events');
    expect(names).toContain('logs');
  });

  it('should create indexes', () => {
    db = getDb(':memory:');
    const indexes = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name`,
      )
      .all() as { name: string }[];

    const names = indexes.map(i => i.name);
    expect(names).toContain('idx_events_type');
    expect(names).toContain('idx_events_entity');
    expect(names).toContain('idx_logs_run_id');
    expect(names).toContain('idx_runs_agent_id');
    expect(names).toContain('idx_runs_status');
  });

  it('should use entity_type and entity_id columns in events table', () => {
    db = getDb(':memory:');
    const columns = db.pragma('table_info(events)') as { name: string }[];
    const names = columns.map(c => c.name);
    expect(names).toContain('entity_type');
    expect(names).toContain('entity_id');
    expect(names).not.toContain('ref_type');
    expect(names).not.toContain('ref_id');
  });

  it('should use status and last_heartbeat in agents table', () => {
    db = getDb(':memory:');
    const columns = db.pragma('table_info(agents)') as { name: string }[];
    const names = columns.map(c => c.name);
    expect(names).toContain('status');
    expect(names).toContain('last_heartbeat');
    // model/provider removed — those are volatile adapter-layer data
    expect(names).not.toContain('model');
    expect(names).not.toContain('provider');
  });

  it('should be idempotent on repeated calls', () => {
    db = getDb(':memory:');
    expect(() => getDb(':memory:')).not.toThrow();
  });
});
