/**
 * Server-Side Configuration
 *
 * Loads and validates configuration from environment variables.
 * This module must only be imported in server-side code (API routes,
 * server components). It never exposes secrets to the client.
 */

import type { AdapterMode, OpenClawConfig } from '@/services/openclaw';
import { ConfigError } from './errors';

export interface AppConfig {
  adapterMode: AdapterMode;
  openclaw: OpenClawConfig | undefined;
}

/**
 * Resolve adapter mode from environment.
 *
 * If OPENCLAW_GATEWAY_URL is set, defaults to 'http'.
 * Otherwise defaults to 'mock'.
 * Can be overridden explicitly with OPENCLAW_ADAPTER_MODE.
 */
function resolveAdapterMode(env: Record<string, string | undefined>): AdapterMode {
  const explicit = env.OPENCLAW_ADAPTER_MODE;
  if (explicit === 'mock' || explicit === 'http') {
    return explicit;
  }
  return env.OPENCLAW_GATEWAY_URL ? 'http' : 'mock';
}

/**
 * Build OpenClawConfig from environment variables.
 * Returns undefined when mode is 'mock' (no config needed).
 *
 * Throws if mode is 'http' but required env vars are missing.
 */
function resolveOpenClawConfig(
  mode: AdapterMode,
  env: Record<string, string | undefined>,
): OpenClawConfig | undefined {
  if (mode === 'mock') {
    return undefined;
  }

  const gatewayUrl = env.OPENCLAW_GATEWAY_URL;
  if (!gatewayUrl) {
    throw new ConfigError(
      'OPENCLAW_GATEWAY_URL is required when adapter mode is "http"',
    );
  }

  const timeoutStr = env.OPENCLAW_TIMEOUT;
  const timeout = timeoutStr ? parseInt(timeoutStr, 10) : undefined;
  if (timeout !== undefined && (isNaN(timeout) || timeout <= 0)) {
    throw new ConfigError(
      `OPENCLAW_TIMEOUT must be a positive integer, got "${timeoutStr}"`,
    );
  }

  return {
    gatewayUrl,
    apiKey: env.OPENCLAW_API_KEY,
    timeout,
  };
}

/**
 * Load application config from the given environment object.
 *
 * Accepts an explicit env parameter so the function is pure and testable.
 * Production callers pass `process.env`.
 */
export function loadConfig(
  env: Record<string, string | undefined> = process.env,
): AppConfig {
  const adapterMode = resolveAdapterMode(env);
  const openclaw = resolveOpenClawConfig(adapterMode, env);
  return { adapterMode, openclaw };
}
