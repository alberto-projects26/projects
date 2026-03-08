/**
 * Update Run Status
 *
 * Transitions a run to a new status and writes the corresponding
 * factual lifecycle event. Enforces the valid transition graph.
 */

import type Database from 'better-sqlite3';
import { writeEvent } from '@/lib/events/writeEvent';
import { NotFoundError } from '@/lib/errors';
import type { Run, RunStatus } from './types';
import { TERMINAL_STATUSES, VALID_TRANSITIONS } from './types';
import type { EventType } from '@/lib/events/types';

/**
 * Map a target RunStatus to its factual event type.
 */
const STATUS_EVENT_MAP: Record<RunStatus, EventType> = {
  pending: 'run.created',    // should not occur in transitions
  running: 'run.started',
  completed: 'run.completed',
  failed: 'run.failed',
  cancelled: 'run.cancelled',
};

export function updateRunStatus(
  db: Database.Database,
  runId: string,
  newStatus: RunStatus,
): Run {
  const run = db.transaction(() => {
    const current = db
      .prepare('SELECT status FROM runs WHERE id = ?')
      .get(runId) as { status: string } | undefined;

    if (!current) {
      throw new NotFoundError('Run', runId);
    }

    const currentStatus = current.status as RunStatus;
    const allowed = VALID_TRANSITIONS.get(currentStatus);

    if (!allowed || !allowed.has(newStatus)) {
      throw new Error(
        `Invalid transition: cannot move run "${runId}" from "${currentStatus}" to "${newStatus}"`,
      );
    }

    const now = new Date().toISOString();
    const isTerminal = TERMINAL_STATUSES.has(newStatus);
    const isStarting = newStatus === 'running';

    const stmt = db.prepare(`
      UPDATE runs
      SET status = ?,
          started_at = CASE WHEN ? THEN COALESCE(started_at, ?) ELSE started_at END,
          ended_at = CASE WHEN ? THEN ? ELSE ended_at END,
          updated_at = ?
      WHERE id = ?
      RETURNING id, agent_id, status, title, started_at, ended_at, created_at, updated_at
    `);

    const row = stmt.get(
      newStatus,
      isStarting ? 1 : 0,
      now,
      isTerminal ? 1 : 0,
      now,
      now,
      runId,
    ) as {
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
      type: STATUS_EVENT_MAP[newStatus],
      entityType: 'run',
      entityId: runId,
      data: {
        from: currentStatus,
        to: newStatus,
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
