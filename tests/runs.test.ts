import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type Database from 'better-sqlite3';
import { getDb } from '@/lib/db';
import { createRun } from '@/lib/runs/createRun';
import { updateRunStatus } from '@/lib/runs/updateRunStatus';
import { NotFoundError } from '@/lib/errors';

describe('Run Service', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = getDb(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  describe('createRun', () => {
    it('should create a run with pending status', () => {
      const run = createRun(db, { agentId: 'agent:1', title: 'Test run' });

      expect(run.id).toMatch(/^run:/);
      expect(run.agentId).toBe('agent:1');
      expect(run.status).toBe('pending');
      expect(run.title).toBe('Test run');
      expect(run.startedAt).toBeNull();
      expect(run.endedAt).toBeNull();
      expect(run.createdAt).toBeDefined();
    });

    it('should accept a custom run id', () => {
      const run = createRun(db, { id: 'run:custom', agentId: 'agent:1' });
      expect(run.id).toBe('run:custom');
    });

    it('should write a run.created event', () => {
      const run = createRun(db, { agentId: 'agent:1', title: 'T' });

      const events = db
        .prepare('SELECT * FROM events WHERE entity_id = ?')
        .all(run.id) as { type: string; data: string }[];

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('run.created');
      const data = JSON.parse(events[0].data);
      expect(data.agentId).toBe('agent:1');
      expect(data.title).toBe('T');
    });

    it('should handle null title', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      expect(run.title).toBeNull();
    });
  });

  describe('updateRunStatus', () => {
    it('should transition pending → running', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      const updated = updateRunStatus(db, run.id, 'running');

      expect(updated.status).toBe('running');
      expect(updated.startedAt).not.toBeNull();
      expect(updated.endedAt).toBeNull();
    });

    it('should transition running → completed', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      updateRunStatus(db, run.id, 'running');
      const completed = updateRunStatus(db, run.id, 'completed');

      expect(completed.status).toBe('completed');
      expect(completed.endedAt).not.toBeNull();
    });

    it('should transition running → failed', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      updateRunStatus(db, run.id, 'running');
      const failed = updateRunStatus(db, run.id, 'failed');

      expect(failed.status).toBe('failed');
      expect(failed.endedAt).not.toBeNull();
    });

    it('should transition pending → cancelled', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      const cancelled = updateRunStatus(db, run.id, 'cancelled');

      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.endedAt).not.toBeNull();
    });

    it('should transition running → cancelled', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      updateRunStatus(db, run.id, 'running');
      const cancelled = updateRunStatus(db, run.id, 'cancelled');

      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.endedAt).not.toBeNull();
    });

    it('should refuse to transition from completed', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      updateRunStatus(db, run.id, 'running');
      updateRunStatus(db, run.id, 'completed');

      expect(() => updateRunStatus(db, run.id, 'running')).toThrow(
        /Invalid transition/,
      );
    });

    it('should refuse to transition from failed', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      updateRunStatus(db, run.id, 'running');
      updateRunStatus(db, run.id, 'failed');

      expect(() => updateRunStatus(db, run.id, 'running')).toThrow(
        /Invalid transition/,
      );
    });

    it('should refuse invalid transition pending → completed', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      expect(() => updateRunStatus(db, run.id, 'completed')).toThrow(
        /Invalid transition.*"pending".*"completed"/,
      );
    });

    it('should refuse invalid transition pending → failed', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      expect(() => updateRunStatus(db, run.id, 'failed')).toThrow(
        /Invalid transition.*"pending".*"failed"/,
      );
    });

    it('should throw NotFoundError for unknown run', () => {
      expect(() => updateRunStatus(db, 'run:nope', 'running')).toThrow(
        NotFoundError,
      );
    });

    it('should write factual lifecycle events for each transition', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      updateRunStatus(db, run.id, 'running');
      updateRunStatus(db, run.id, 'completed');

      const events = db
        .prepare(
          'SELECT type, data FROM events WHERE entity_id = ? ORDER BY id',
        )
        .all(run.id) as { type: string; data: string }[];

      expect(events).toHaveLength(3);
      expect(events[0].type).toBe('run.created');
      expect(events[1].type).toBe('run.started');
      expect(events[2].type).toBe('run.completed');

      const startedData = JSON.parse(events[1].data);
      expect(startedData.from).toBe('pending');
      expect(startedData.to).toBe('running');

      const completedData = JSON.parse(events[2].data);
      expect(completedData.from).toBe('running');
      expect(completedData.to).toBe('completed');
    });

    it('should write run.failed event on failure', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      updateRunStatus(db, run.id, 'running');
      updateRunStatus(db, run.id, 'failed');

      const events = db
        .prepare(
          'SELECT type FROM events WHERE entity_id = ? ORDER BY id',
        )
        .all(run.id) as { type: string }[];

      expect(events.map(e => e.type)).toEqual([
        'run.created',
        'run.started',
        'run.failed',
      ]);
    });

    it('should write run.cancelled event on cancellation', () => {
      const run = createRun(db, { agentId: 'agent:1' });
      updateRunStatus(db, run.id, 'cancelled');

      const events = db
        .prepare(
          'SELECT type FROM events WHERE entity_id = ? ORDER BY id',
        )
        .all(run.id) as { type: string }[];

      expect(events.map(e => e.type)).toEqual([
        'run.created',
        'run.cancelled',
      ]);
    });
  });
});
