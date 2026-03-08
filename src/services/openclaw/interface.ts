/**
 * OpenClaw Adapter Interface
 *
 * Contract that all adapter implementations (mock, HTTP) must fulfill.
 */

import type { Agent, ClawNode, Session, Message } from '@/types/openclaw';
import type { AdapterStatus, AgentSpawnConfig } from './types';

export interface IOpenClawAdapter {
  // Connection
  connect(): Promise<boolean>;
  disconnect(): void;
  getStatus(): AdapterStatus;

  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | null>;
  spawnAgent(config: AgentSpawnConfig): Promise<Agent>;

  // Nodes
  getNodes(): Promise<ClawNode[]>;
  getNode(id: string): Promise<ClawNode | null>;

  // Sessions
  getSessions(): Promise<Session[]>;

  // Messages
  sendMessage(sessionId: string, content: string): Promise<Message>;
}
