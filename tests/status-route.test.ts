import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StatusResponse } from '@/app/api/status/route';
import type { ErrorResponse } from '@/lib/errors';
import { ConfigError, ConnectionError } from '@/lib/errors';

// Mock the server accessor so we control adapter behavior
const mockGetAdapterMode = vi.fn();
const mockConnectOpenClawAdapter = vi.fn();
const mockResetAdapterCache = vi.fn();

vi.mock('@/lib/server/openclaw', () => ({
  getAdapterMode: (...args: unknown[]) => mockGetAdapterMode(...args),
  connectOpenClawAdapter: (...args: unknown[]) =>
    mockConnectOpenClawAdapter(...args),
  _resetAdapterCache: (...args: unknown[]) => mockResetAdapterCache(...args),
}));

const { GET } = await import('@/app/api/status/route');

describe('GET /api/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return connected status in mock mode', async () => {
    mockGetAdapterMode.mockReturnValue('mock');
    mockConnectOpenClawAdapter.mockResolvedValue({
      getStatus: () => ({
        connected: true,
        lastSync: new Date('2026-03-07T12:00:00Z'),
        error: null,
      }),
    });

    const response = await GET();
    const body: StatusResponse = await response.json();

    expect(response.status).toBe(200);
    expect(body.connected).toBe(true);
    expect(body.mode).toBe('mock');
    expect(body.error).toBeNull();
    expect(body.lastSync).toBe('2026-03-07T12:00:00.000Z');
  });

  it('should return 500 with error body when config is invalid', async () => {
    mockGetAdapterMode.mockImplementation(() => {
      throw new ConfigError('OPENCLAW_GATEWAY_URL is required');
    });

    const response = await GET();
    const body: ErrorResponse = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('CONFIG_INVALID');
    expect(body.error.message).toBe('OPENCLAW_GATEWAY_URL is required');
  });

  it('should return 502 when connection fails', async () => {
    mockGetAdapterMode.mockReturnValue('http');
    mockConnectOpenClawAdapter.mockRejectedValue(
      new ConnectionError('Connection refused'),
    );

    const response = await GET();
    const body: ErrorResponse = await response.json();

    expect(response.status).toBe(502);
    expect(body.error.code).toBe('CONNECTION_FAILED');
    expect(body.error.message).toBe('Connection refused');
  });

  it('should return 502 for unexpected adapter errors', async () => {
    mockGetAdapterMode.mockReturnValue('mock');
    mockConnectOpenClawAdapter.mockRejectedValue(new Error('segfault'));

    const response = await GET();
    const body: ErrorResponse = await response.json();

    expect(response.status).toBe(502);
    expect(body.error.code).toBe('ADAPTER_ERROR');
    expect(body.error.message).toBe('Unexpected adapter failure');
  });

  it('should handle null lastSync', async () => {
    mockGetAdapterMode.mockReturnValue('mock');
    mockConnectOpenClawAdapter.mockResolvedValue({
      getStatus: () => ({
        connected: true,
        lastSync: null,
        error: null,
      }),
    });

    const response = await GET();
    const body: StatusResponse = await response.json();

    expect(response.status).toBe(200);
    expect(body.lastSync).toBeNull();
  });
});
