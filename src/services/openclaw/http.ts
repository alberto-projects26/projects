/**
 * HTTP OpenClaw Adapter
 *
 * Production implementation that communicates with the OpenClaw Gateway
 * over HTTP.
 */

import type { Agent, ClawNode, Session, Message } from '@/types/openclaw';
import type { AdapterStatus, AgentSpawnConfig, OpenClawConfig } from './types';
import type { IOpenClawAdapter } from './interface';

export class OpenClawHttpAdapter implements IOpenClawAdapter {
  private config: OpenClawConfig;
  private status: AdapterStatus = {
    connected: false,
    lastSync: null,
    error: null,
  };

  constructor(config: OpenClawConfig) {
    this.config = {
      timeout: 10000,
      ...config,
    };
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.gatewayUrl}/api/status`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.config.timeout || 10000),
      });

      if (response.ok) {
        this.status = {
          connected: true,
          lastSync: new Date(),
          error: null,
        };
        return true;
      }

      throw new Error(`Gateway returned ${response.status}`);
    } catch (error) {
      this.status = {
        connected: false,
        lastSync: null,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
      return false;
    }
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
    const response = await fetch(`${this.config.gatewayUrl}/api/agents`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.statusText}`);
    }

    const data = await response.json();
    return data.agents || [];
  }

  async getAgent(id: string): Promise<Agent | null> {
    const agents = await this.getAgents();
    return agents.find(a => a.id === id) || null;
  }

  async spawnAgent(config: AgentSpawnConfig): Promise<Agent> {
    const response = await fetch(`${this.config.gatewayUrl}/api/agents/spawn`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Failed to spawn agent: ${response.statusText}`);
    }

    return response.json();
  }

  async getNodes(): Promise<ClawNode[]> {
    const response = await fetch(`${this.config.gatewayUrl}/api/nodes`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch nodes: ${response.statusText}`);
    }

    const data = await response.json();
    return data.nodes || [];
  }

  async getNode(id: string): Promise<ClawNode | null> {
    const nodes = await this.getNodes();
    return nodes.find(n => n.id === id) || null;
  }

  async getSessions(): Promise<Session[]> {
    const response = await fetch(`${this.config.gatewayUrl}/api/sessions`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sessions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.sessions || [];
  }

  async sendMessage(sessionId: string, content: string): Promise<Message> {
    const response = await fetch(`${this.config.gatewayUrl}/api/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ sessionId, content }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }
}
