/**
 * OpenClaw Adapter Types
 *
 * Configuration and status types used by all adapter implementations.
 */

export interface OpenClawConfig {
  gatewayUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface AdapterStatus {
  connected: boolean;
  lastSync: Date | null;
  error: string | null;
}

export interface AgentStats {
  total: number;
  active: number;
  idle: number;
}

export interface NodeStats {
  total: number;
  online: number;
  offline: number;
}

export interface AgentSpawnConfig {
  name: string;
  model?: string;
  instructions?: string;
  tools?: string[];
}
