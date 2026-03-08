import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigError, ConnectionError } from '@/lib/errors';

// Mock config so we control what loadConfig returns
const mockLoadConfig = vi.fn();
vi.mock('@/lib/config', () => ({
  loadConfig: (...args: unknown[]) => mockLoadConfig(...args),
}));

// Import after mocks
const {
  getOpenClawAdapter,
  getAdapterMode,
  connectOpenClawAdapter,
  _resetAdapterCache,
} = await import('@/lib/server/openclaw');

describe('Server OpenClaw accessor', () => {
  beforeEach(() => {
    _resetAdapterCache();
    vi.clearAllMocks();
  });

  describe('getOpenClawAdapter', () => {
    it('returns a mock adapter when config says mock', () => {
      mockLoadConfig.mockReturnValue({
        adapterMode: 'mock',
        openclaw: undefined,
      });

      const adapter = getOpenClawAdapter();
      expect(adapter).toBeDefined();
      expect(adapter.getStatus().connected).toBe(false);
    });

    it('returns the same instance on subsequent calls', () => {
      mockLoadConfig.mockReturnValue({
        adapterMode: 'mock',
        openclaw: undefined,
      });

      const a = getOpenClawAdapter();
      const b = getOpenClawAdapter();
      expect(a).toBe(b);
      // loadConfig should only be called once
      expect(mockLoadConfig).toHaveBeenCalledTimes(1);
    });

    it('throws ConfigError when loadConfig throws ConfigError', () => {
      mockLoadConfig.mockImplementation(() => {
        throw new ConfigError('OPENCLAW_GATEWAY_URL is required');
      });

      expect(() => getOpenClawAdapter()).toThrow(ConfigError);
    });
  });

  describe('getAdapterMode', () => {
    it('returns mock when configured for mock', () => {
      mockLoadConfig.mockReturnValue({
        adapterMode: 'mock',
        openclaw: undefined,
      });

      expect(getAdapterMode()).toBe('mock');
    });

    it('returns http when configured for http', () => {
      mockLoadConfig.mockReturnValue({
        adapterMode: 'http',
        openclaw: { gatewayUrl: 'http://localhost:8080' },
      });

      expect(getAdapterMode()).toBe('http');
    });
  });

  describe('connectOpenClawAdapter', () => {
    it('returns connected adapter in mock mode', async () => {
      mockLoadConfig.mockReturnValue({
        adapterMode: 'mock',
        openclaw: undefined,
      });

      const adapter = await connectOpenClawAdapter();
      expect(adapter.getStatus().connected).toBe(true);
    });

    it('throws ConnectionError when connect returns false', async () => {
      // Use http mode with a bad URL — the adapter's connect() will fail
      // because fetch won't resolve. We mock at a higher level instead.
      mockLoadConfig.mockReturnValue({
        adapterMode: 'mock',
        openclaw: undefined,
      });

      const adapter = getOpenClawAdapter();
      // Override connect to simulate failure
      adapter.connect = async () => false;
      adapter.getStatus = () => ({
        connected: false,
        lastSync: null,
        error: 'Connection refused',
      });

      await expect(connectOpenClawAdapter()).rejects.toThrow(ConnectionError);
      await expect(connectOpenClawAdapter()).rejects.toThrow('Connection refused');
    });
  });
});
