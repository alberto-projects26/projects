/**
 * Run Types
 *
 * A run is a single execution lifecycle — it starts, does work,
 * and ends with a terminal status. Runs belong to an agent.
 *
 * Status lifecycle:
 *   pending → running → completed | failed
 *   pending → cancelled
 *   running → cancelled
 *
 * Each transition writes a factual event (run.started, run.completed, etc.)
 */

export type RunStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export const TERMINAL_STATUSES: ReadonlySet<RunStatus> = new Set([
  'completed',
  'failed',
  'cancelled',
]);

/**
 * Valid transitions. Key is the current status, value is the set of
 * statuses it may transition to.
 */
export const VALID_TRANSITIONS: ReadonlyMap<RunStatus, ReadonlySet<RunStatus>> = new Map([
  ['pending', new Set<RunStatus>(['running', 'cancelled'])],
  ['running', new Set<RunStatus>(['completed', 'failed', 'cancelled'])],
  // Terminal states have no outbound transitions
]);

export interface Run {
  id: string;
  agentId: string;
  status: RunStatus;
  title: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRunInput {
  id?: string;
  agentId: string;
  title?: string;
}
