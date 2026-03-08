/**
 * OpenClaw Service — Public API
 *
 * All consumer code should import from this file, never from
 * individual implementation modules.
 */

export type { IOpenClawAdapter } from './interface';
export type {
  OpenClawConfig,
  AdapterStatus,
  AgentStats,
  NodeStats,
  AgentSpawnConfig,
} from './types';

export { MockOpenClawAdapter } from './mock';
export { OpenClawHttpAdapter } from './http';

import type { OpenClawConfig } from './types';
import type { IOpenClawAdapter } from './interface';
import { MockOpenClawAdapter } from './mock';
import { OpenClawHttpAdapter } from './http';

export type AdapterMode = 'mock' | 'http';

export function createOpenClawAdapter(
  mode: AdapterMode = 'mock',
  config?: OpenClawConfig,
): IOpenClawAdapter {
  switch (mode) {
    case 'mock':
      return new MockOpenClawAdapter();
    case 'http':
      if (!config?.gatewayUrl) {
        throw new Error('gatewayUrl required for HTTP adapter');
      }
      return new OpenClawHttpAdapter(config);
    default:
      throw new Error(`Unknown adapter mode: ${mode}`);
  }
}
