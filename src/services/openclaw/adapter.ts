/**
 * OpenClaw Adapter - Local-First Design
 * 
 * This adapter provides a clean abstraction layer between Mission Control
 * and the OpenClaw Gateway. It handles all OpenClaw integration through
 * well-defined interfaces, making the app testable and independent of
 * OpenClaw's internal details.
 * 
 * Architecture Principles:
 * - Local-first: Works without OpenClaw (uses mock data)
 * - Adapter pattern: Clean separation between app and external service
 * - Type-safe: Full TypeScript interfaces
 * - Testable: Can swap implementations for testing
 */

import type { Agent, Node, Session, Message } from '@/types/openclaw';

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Adapter Interface
// ============================================================================

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
  getNodes(): Promise<Node[]>;
  getNode(id: string): Promise<Node | null>;
  
  // Sessions
  getSessions(): Promise<Session[]>;
  
  // Messages
  sendMessage(sessionId: string, content: string): Promise<Message>;
}

export interface AgentSpawnConfig {
  name: string;
  model?: string;
  instructions?: string;
  tools?: string[];
}

// ============================================================================
// Mock Adapter (for local-first development)
// ============================================================================

export class MockOpenClawAdapter implements IOpenClawAdapter {
  private status: AdapterStatus = {
    connected: false,
    lastSync: null,
    error: null,
  };

  private agents: Agent[] = [
    {
      id: 'agent:main:main',
      name: 'Jarvis',
      status: 'active',
      model: 'minimax/minimax-m2.5',
      provider: 'openrouter',
      tokensIn: 68113,
      tokensOut: 2176,
      costToday: 0,
      uptime: '0m',
      lastActivity: new Date().toISOString(),
    },
  ];

  private nodes: Node[] = [];

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

  async getNodes(): Promise<Node[]> {
    return [...this.nodes];
  }

  async getNode(id: string): Promise<Node | null> {
    return this.nodes.find(n => n.id === id) || null;
  }

  async getSessions(): Promise<Session[]> {
    return [];
  }

  async sendMessage(_sessionId: string, _content: string): Promise<Message> {
    throw new Error('Not implemented in mock');
  }
}

// ============================================================================
// HTTP Adapter (for production)
// ============================================================================

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

  async getNodes(): Promise<Node[]> {
    const response = await fetch(`${this.config.gatewayUrl}/api/nodes`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch nodes: ${response.statusText}`);
    }

    const data = await response.json();
    return data.nodes || [];
  }

  async getNode(id: string): Promise<Node | null> {
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

// ============================================================================
// Factory
// ============================================================================

export type AdapterMode = 'mock' | 'http';

export function createOpenClawAdapter(mode: AdapterMode = 'mock', config?: OpenClawConfig): IOpenClawAdapter {
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
