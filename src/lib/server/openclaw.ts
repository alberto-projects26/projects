/**
 * Server-Side Adapter Accessor
 *
 * Centralizes config loading and adapter creation for route handlers.
 * Provides a single entry point so routes don't repeat boilerplate.
 *
 * The adapter is cached at module level for the lifetime of the
 * server process. This avoids re-creating the adapter on every
 * request while keeping the implementation trivial — no connection
 * pooling, no lifecycle management, just a lazy singleton.
 */

import {
  createOpenClawAdapter,
  type IOpenClawAdapter,
  type AdapterMode,
} from '@/services/openclaw';
import { loadConfig, type AppConfig } from '@/lib/config';
import { ConfigError, ConnectionError } from '@/lib/errors';

let cachedAdapter: IOpenClawAdapter | null = null;
let cachedConfig: AppConfig | null = null;

/**
 * Get the shared OpenClaw adapter instance.
 *
 * On first call, loads config from environment and creates the adapter.
 * Subsequent calls return the same instance.
 *
 * Throws ConfigError if environment is misconfigured.
 */
export function getOpenClawAdapter(): IOpenClawAdapter {
  if (cachedAdapter) {
    return cachedAdapter;
  }

  cachedConfig = loadConfig();
  cachedAdapter = createOpenClawAdapter(
    cachedConfig.adapterMode,
    cachedConfig.openclaw,
  );
  return cachedAdapter;
}

/**
 * Get the resolved adapter mode ('mock' or 'http').
 *
 * Calls getOpenClawAdapter() to ensure config is loaded.
 */
export function getAdapterMode(): AdapterMode {
  getOpenClawAdapter();
  return cachedConfig!.adapterMode;
}

/**
 * Connect the shared adapter and return it.
 *
 * Convenience for routes that need an active connection.
 * Throws ConnectionError if connection fails.
 */
export async function connectOpenClawAdapter(): Promise<IOpenClawAdapter> {
  const adapter = getOpenClawAdapter();
  const connected = await adapter.connect();
  if (!connected) {
    const status = adapter.getStatus();
    throw new ConnectionError(status.error ?? 'Failed to connect to OpenClaw gateway');
  }
  return adapter;
}

/**
 * Reset cached adapter. Used in tests only.
 */
export function _resetAdapterCache(): void {
  cachedAdapter = null;
  cachedConfig = null;
}
