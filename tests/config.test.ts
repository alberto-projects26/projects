import { describe, it, expect } from 'vitest';
import { loadConfig } from '@/lib/config';

describe('loadConfig', () => {
  it('should default to mock mode when no env vars set', () => {
    const config = loadConfig({});
    expect(config.adapterMode).toBe('mock');
    expect(config.openclaw).toBeUndefined();
  });

  it('should select http mode when OPENCLAW_GATEWAY_URL is set', () => {
    const config = loadConfig({
      OPENCLAW_GATEWAY_URL: 'http://localhost:8080',
    });
    expect(config.adapterMode).toBe('http');
    expect(config.openclaw).toBeDefined();
    expect(config.openclaw!.gatewayUrl).toBe('http://localhost:8080');
  });

  it('should respect explicit OPENCLAW_ADAPTER_MODE=mock even with URL', () => {
    const config = loadConfig({
      OPENCLAW_ADAPTER_MODE: 'mock',
      OPENCLAW_GATEWAY_URL: 'http://localhost:8080',
    });
    expect(config.adapterMode).toBe('mock');
    expect(config.openclaw).toBeUndefined();
  });

  it('should throw when mode is http but no gateway URL', () => {
    expect(() =>
      loadConfig({ OPENCLAW_ADAPTER_MODE: 'http' }),
    ).toThrow('OPENCLAW_GATEWAY_URL is required');
  });

  it('should pass API key from env', () => {
    const config = loadConfig({
      OPENCLAW_GATEWAY_URL: 'http://localhost:8080',
      OPENCLAW_API_KEY: 'secret-key',
    });
    expect(config.openclaw!.apiKey).toBe('secret-key');
  });

  it('should parse valid OPENCLAW_TIMEOUT', () => {
    const config = loadConfig({
      OPENCLAW_GATEWAY_URL: 'http://localhost:8080',
      OPENCLAW_TIMEOUT: '5000',
    });
    expect(config.openclaw!.timeout).toBe(5000);
  });

  it('should throw for non-numeric OPENCLAW_TIMEOUT', () => {
    expect(() =>
      loadConfig({
        OPENCLAW_GATEWAY_URL: 'http://localhost:8080',
        OPENCLAW_TIMEOUT: 'abc',
      }),
    ).toThrow('OPENCLAW_TIMEOUT must be a positive integer');
  });

  it('should throw for zero OPENCLAW_TIMEOUT', () => {
    expect(() =>
      loadConfig({
        OPENCLAW_GATEWAY_URL: 'http://localhost:8080',
        OPENCLAW_TIMEOUT: '0',
      }),
    ).toThrow('OPENCLAW_TIMEOUT must be a positive integer');
  });

  it('should throw for negative OPENCLAW_TIMEOUT', () => {
    expect(() =>
      loadConfig({
        OPENCLAW_GATEWAY_URL: 'http://localhost:8080',
        OPENCLAW_TIMEOUT: '-100',
      }),
    ).toThrow('OPENCLAW_TIMEOUT must be a positive integer');
  });

  it('should ignore unknown OPENCLAW_ADAPTER_MODE values and infer from URL', () => {
    const config = loadConfig({
      OPENCLAW_ADAPTER_MODE: 'grpc',
      OPENCLAW_GATEWAY_URL: 'http://localhost:8080',
    });
    // 'grpc' is not 'mock' or 'http', so it falls through to URL-based inference
    expect(config.adapterMode).toBe('http');
  });

  it('should default to mock when unknown mode and no URL', () => {
    const config = loadConfig({
      OPENCLAW_ADAPTER_MODE: 'grpc',
    });
    expect(config.adapterMode).toBe('mock');
  });

  it('should omit timeout when OPENCLAW_TIMEOUT is not set', () => {
    const config = loadConfig({
      OPENCLAW_GATEWAY_URL: 'http://localhost:8080',
    });
    expect(config.openclaw!.timeout).toBeUndefined();
  });

  it('should omit apiKey when OPENCLAW_API_KEY is not set', () => {
    const config = loadConfig({
      OPENCLAW_GATEWAY_URL: 'http://localhost:8080',
    });
    expect(config.openclaw!.apiKey).toBeUndefined();
  });
});
