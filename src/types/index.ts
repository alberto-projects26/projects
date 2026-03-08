// mission-control/src/types/index.ts

export type MissionStatus = 'backlog' | 'planning' | 'active' | 'review' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
}

export interface ActionPlan {
  id: string;
  missionId: string;
  description: string;
  steps: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgentId?: string;
  tasks: Task[];
  actionPlans: ActionPlan[];
  createdAt: string;
  updatedAt: string;
}

export type AgentStatus = 'idle' | 'active' | 'busy' | 'retired';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  currentMissionId?: string;
  tokenBurn24h: number;
  capabilities: string[];
  createdAt: string;
}

export type NodeStatus = 'online' | 'offline' | 'busy';

export interface Node {
  id: string;
  name: string;
  type: 'mac-mini' | 'iphone' | 'android' | 'pi';
  status: NodeStatus;
  lastSeen: string;
  capabilities: string[];
  location?: string;
}
