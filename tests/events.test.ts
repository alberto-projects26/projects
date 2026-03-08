import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type Database from 'better-sqlite3';
import { getDb } from '@/lib/db';
import { writeEvent } from '@/lib/events/writeEvent';

describe('Event Writer', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = getDb(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('should insert an event and return it with an id', () => {
    const event = writeEvent(db, {
      type: 'run.created',
      entityType: 'run',
      entityId: 'run:123',
      data: { agentId: 'agent:1' },
    });

    expect(event.id).toBeGreaterThan(0);
    expect(event.type).toBe('run.created');
    expect(event.entityType).toBe('run');
    expect(event.entityId).toBe('run:123');
    expect(event.data).toEqual({ agentId: 'agent:1' });
    expect(event.createdAt).toBeDefined();
  });

  it('should auto-increment event ids', () => {
    const e1 = writeEvent(db, { type: 'run.created' });
    const e2 = writeEvent(db, { type: 'run.created' });
    expect(e2.id).toBe(e1.id + 1);
  });

  it('should handle null entity and data', () => {
    const event = writeEvent(db, { type: 'agent.registered' });
    expect(event.entityType).toBeNull();
    expect(event.entityId).toBeNull();
    expect(event.data).toBeNull();
  });

  it('should persist events (append-only)', () => {
    writeEvent(db, { type: 'run.created', entityType: 'run', entityId: 'r1' });
    writeEvent(db, { type: 'run.started', entityType: 'run', entityId: 'r1' });

    const rows = db.prepare('SELECT * FROM events ORDER BY id').all();
    expect(rows).toHaveLength(2);
  });
});
