/**
 * Mock OpenClaw Adapter
 *
 * Local-first implementation that works without an OpenClaw Gateway.
 * Uses in-memory state seeded from fixtures.
 */

import type { Agent, ClawNode, Session, Message } from '@/types/openclaw';
import type { AdapterStatus, AgentSpawnConfig } from './types';
import type { IOpenClawAdapter } from './interface';
import { createDefaultAgents, createDefaultNodes } from './fixtures';

export class MockOpenClawAdapter implements IOpenClawAdapter {
  private status: AdapterStatus = {
    connected: false,
    lastSync: null,
    error: null,
  };

  private agents: Agent[] = createDefaultAgents();
  private nodes: ClawNode[] = createDefaultNodes();

  async connect(): Promise<boolean> {
    this.status = {
      connected: true,
      lastSync: new Date(),
      error: null,
    };
    return true;
  }

  disconnect(): void {
    this.status = {
      connected: false,
      lastSync: null,
      error: null,
    };
  }

  getStatus(): AdapterStatus {
    return { ...this.status };
  }

  async getAgents(): Promise<Agent[]> {
    return [...this.agents];
  }

  async getAgent(id: string): Promise<Agent | null> {
    return this.agents.find(a => a.id === id) || null;
  }

  async spawnAgent(config: AgentSpawnConfig): Promise<Agent> {
    const newAgent: Agent = {
      id: `agent:subagent:${crypto.randomUUID()}`,
      name: config.name,
      status: 'idle',
      model: config.model || 'auto',
      provider: 'openrouter',
      tokensIn: 0,
      tokensOut: 0,
      costToday: 0,
      uptime: '0m',
      lastActivity: new Date().toISOString(),
    };
    this.agents.push(newAgent);
    return newAgent;
  }

  async getNodes(): Promise<ClawNode[]> {
    return [...this.nodes];
  }

  async getNode(id: string): Promise<ClawNode | null> {
    return this.nodes.find(n => n.id === id) || null;
  }

  async getSessions(): Promise<Session[]> {
    return [];
  }

  async sendMessage(_sessionId: string, _content: string): Promise<Message> {
    throw new Error('Not implemented in mock');
  }
}
