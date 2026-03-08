import { describe, it, expect, beforeEach } from 'vitest';
import {
  MockOpenClawAdapter,
  OpenClawHttpAdapter,
  createOpenClawAdapter,
} from '@/services/openclaw';
import type { IOpenClawAdapter } from '@/services/openclaw';

describe('OpenClaw Adapter', () => {
  let adapter: IOpenClawAdapter;

  beforeEach(() => {
    adapter = new MockOpenClawAdapter();
  });

  describe('Mock Adapter', () => {
    it('should create a mock adapter', () => {
      expect(adapter).toBeDefined();
    });

    it('should report disconnected status before connect', () => {
      const status = adapter.getStatus();
      expect(status.connected).toBe(false);
      expect(status.lastSync).toBeNull();
      expect(status.error).toBeNull();
    });

    it('should connect successfully', async () => {
      const result = await adapter.connect();
      expect(result).toBe(true);
    });

    it('should report connected status after connect', async () => {
      await adapter.connect();
      const status = adapter.getStatus();
      expect(status.connected).toBe(true);
      expect(status.lastSync).toBeInstanceOf(Date);
    });

    it('should disconnect successfully', async () => {
      await adapter.connect();
      adapter.disconnect();
      const status = adapter.getStatus();
      expect(status.connected).toBe(false);
    });

    it('should return agents', async () => {
      const agents = await adapter.getAgents();
      expect(agents).toBeDefined();
      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBeGreaterThan(0);
    });

    it('should get a specific agent by id', async () => {
      const agent = await adapter.getAgent('agent:main:main');
      expect(agent).toBeDefined();
      expect(agent?.name).toBe('Jarvis');
    });

    it('should return null for unknown agent', async () => {
      const agent = await adapter.getAgent('unknown');
      expect(agent).toBeNull();
    });

    it('should spawn a new agent', async () => {
      const newAgent = await adapter.spawnAgent({ name: 'TestBot' });
      expect(newAgent).toBeDefined();
      expect(newAgent.name).toBe('TestBot');
      expect(newAgent.id).toContain('agent:subagent:');
    });

    it('should include spawned agent in subsequent getAgents call', async () => {
      const before = await adapter.getAgents();
      await adapter.spawnAgent({ name: 'SpawnedBot' });
      const after = await adapter.getAgents();
      expect(after.length).toBe(before.length + 1);
      expect(after.find(a => a.name === 'SpawnedBot')).toBeDefined();
    });

    it('should return empty nodes array', async () => {
      const nodes = await adapter.getNodes();
      expect(nodes).toEqual([]);
    });

    it('should return null for unknown node', async () => {
      const node = await adapter.getNode('unknown');
      expect(node).toBeNull();
    });

    it('should return empty sessions array', async () => {
      const sessions = await adapter.getSessions();
      expect(sessions).toEqual([]);
    });

    it('should throw on sendMessage', async () => {
      await expect(adapter.sendMessage('s1', 'hello')).rejects.toThrow(
        'Not implemented in mock',
      );
    });
  });

  describe('Factory', () => {
    it('should create mock adapter by default', () => {
      const mock = createOpenClawAdapter('mock');
      expect(mock).toBeInstanceOf(MockOpenClawAdapter);
    });

    it('should create mock adapter when no mode specified', () => {
      const mock = createOpenClawAdapter();
      expect(mock).toBeInstanceOf(MockOpenClawAdapter);
    });

    it('should create HTTP adapter with valid config', () => {
      const http = createOpenClawAdapter('http', {
        gatewayUrl: 'http://localhost:8080',
      });
      expect(http).toBeInstanceOf(OpenClawHttpAdapter);
    });

    it('should throw error for HTTP adapter without config', () => {
      expect(() => createOpenClawAdapter('http')).toThrow('gatewayUrl required');
    });
  });
});
