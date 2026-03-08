/**
 * Event Types
 *
 * Events are the append-only audit trail for everything that
 * happens in Mission Control. They reference a subject via
 * entity_type + entity_id.
 *
 * Convention: event types are factual lifecycle names.
 * Each type describes what happened, not a generic "status changed".
 * Transition metadata (from/to) is carried in the event data payload
 * where useful, but the type itself is always readable on its own.
 */

export type EventType =
  // Run lifecycle — one event per transition
  | 'run.created'
  | 'run.dispatched'
  | 'run.started'
  | 'run.completed'
  | 'run.failed'
  | 'run.cancelled'
  // Agent lifecycle
  | 'agent.registered'
  | 'agent.connected'
  | 'agent.disconnected';

export interface Event {
  id: number;
  type: EventType;
  entityType: string | null;
  entityId: string | null;
  data: Record<string, unknown> | null;
  createdAt: string;
}

export interface WriteEventInput {
  type: EventType;
  entityType?: string;
  entityId?: string;
  data?: Record<string, unknown>;
}
