import { describe, it, expect, beforeEach } from 'vitest';
import { MockOpenClawAdapter, createOpenClawAdapter } from '@/services/openclaw/adapter';

describe('OpenClaw Adapter', () => {
  let adapter: MockOpenClawAdapter;

  beforeEach(() => {
    adapter = new MockOpenClawAdapter();
  });

  describe('Mock Adapter', () => {
    it('should create a mock adapter', () => {
      expect(adapter).toBeDefined();
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

    it('should return agents after connect', async () => {
      await adapter.connect();
      const agents = await adapter.getAgents();
      expect(agents).toBeDefined();
      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBeGreaterThan(0);
    });

    it('should get a specific agent by id', async () => {
      await adapter.connect();
      const agent = await adapter.getAgent('agent:main:main');
      expect(agent).toBeDefined();
      expect(agent?.name).toBe('Jarvis');
    });

    it('should return null for unknown agent', async () => {
      await adapter.connect();
      const agent = await adapter.getAgent('unknown');
      expect(agent).toBeNull();
    });

    it('should spawn a new agent', async () => {
      await adapter.connect();
      const newAgent = await adapter.spawnAgent({ name: 'TestBot' });
      expect(newAgent).toBeDefined();
      expect(newAgent.name).toBe('TestBot');
      expect(newAgent.id).toContain('agent:subagent:');
    });

    it('should return empty nodes array', async () => {
      await adapter.connect();
      const nodes = await adapter.getNodes();
      expect(nodes).toEqual([]);
    });
  });

  describe('Factory', () => {
    it('should create mock adapter by default', () => {
      const adapter = createOpenClawAdapter('mock');
      expect(adapter).toBeInstanceOf(MockOpenClawAdapter);
    });

    it('should throw error for HTTP adapter without config', () => {
      expect(() => createOpenClawAdapter('http')).toThrow('gatewayUrl required');
    });
  });
});
