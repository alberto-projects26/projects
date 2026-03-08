/**
 * Create Run
 *
 * Inserts a run record and writes a run.created event,
 * both inside a single transaction.
 */

import type Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { writeEvent } from '@/lib/events/writeEvent';
import type { CreateRunInput, Run } from './types';

export function createRun(db: Database.Database, input: CreateRunInput): Run {
  const id = input.id ?? `run:${randomUUID()}`;

  const run = db.transaction(() => {
    const stmt = db.prepare(`
      INSERT INTO runs (id, agent_id, status, title)
      VALUES (?, ?, 'pending', ?)
      RETURNING id, agent_id, status, title, started_at, ended_at, created_at, updated_at
    `);

    const row = stmt.get(id, input.agentId, input.title ?? null) as {
      id: string;
      agent_id: string;
      status: string;
      title: string | null;
      started_at: string | null;
      ended_at: string | null;
      created_at: string;
      updated_at: string;
    };

    writeEvent(db, {
      type: 'run.created',
      entityType: 'run',
      entityId: row.id,
      data: {
        agentId: input.agentId,
        title: input.title ?? null,
      },
    });

    return {
      id: row.id,
      agentId: row.agent_id,
      status: row.status as Run['status'],
      title: row.title,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  })();

  return run;
}
