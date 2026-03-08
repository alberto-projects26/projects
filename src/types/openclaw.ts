/**
 * OpenClaw Type Definitions
 * 
 * Centralized types for OpenClaw Gateway entities.
 * These types mirror the OpenClaw API responses.
 */

// ============================================================================
// Agent Types
// ============================================================================

export type AgentStatus = 'idle' | 'active' | 'busy' | 'retired';
export type AgentProvider = 'openrouter' | 'anthropic' | 'openai' | 'google';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  model: string;
  provider: AgentProvider;
  tokensIn: number;
  tokensOut: number;
  costToday: number;
  uptime: string;
  lastActivity: string;
  role?: string;
  capabilities?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
}

// ============================================================================
// Node Types
// ============================================================================

export type NodeStatus = 'online' | 'offline' | 'busy';
export type NodeType = 'mac-mini' | 'iphone' | 'android' | 'pi' | 'server';

export interface ClawNode {
  id: string;
  name: string;
  type: NodeType;
  status: NodeStatus;
  lastSeen: string;
  capabilities: string[];
  location?: string;
  ipAddress?: string;
  systemMetrics?: NodeMetrics;
}

export interface NodeMetrics {
  cpuPercent: number;
  memoryUsedGB: number;
  memoryTotalGB: number;
  diskUsedGB: number;
  diskTotalGB: number;
  uptime: string;
}

// ============================================================================
// Mission Types (for future use)
// ============================================================================

export type MissionStatus = 'planning' | 'active' | 'completed' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  missionId: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
}

// ============================================================================
// Session Types
// ============================================================================

export interface Session {
  id: string;
  agentId: string;
  channel: string;
  peerId: string;
  peerName: string;
  startedAt: string;
  lastActivity: string;
  messageCount: number;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface SystemStats {
  totalAgents: number;
  activeAgents: number;
  totalNodes: number;
  onlineNodes: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostToday: number;
  uptime: string;
}
