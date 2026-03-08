/**
 * Event Writer
 *
 * Inserts a single event into the append-only events table.
 */

import type Database from 'better-sqlite3';
import type { WriteEventInput, Event } from './types';

export function writeEvent(db: Database.Database, input: WriteEventInput): Event {
  const stmt = db.prepare(`
    INSERT INTO events (type, entity_type, entity_id, data)
    VALUES (?, ?, ?, ?)
    RETURNING id, type, entity_type, entity_id, data, created_at
  `);

  const row = stmt.get(
    input.type,
    input.entityType ?? null,
    input.entityId ?? null,
    input.data ? JSON.stringify(input.data) : null,
  ) as {
    id: number;
    type: string;
    entity_type: string | null;
    entity_id: string | null;
    data: string | null;
    created_at: string;
  };

  return {
    id: row.id,
    type: row.type as Event['type'],
    entityType: row.entity_type,
    entityId: row.entity_id,
    data: row.data ? JSON.parse(row.data) : null,
    createdAt: row.created_at,
  };
}
