// mission-control/src/data/mock.ts
import { Mission, Agent, Node } from '../types';

export const mockMissions: Mission[] = [
  {
    id: 'm1',
    title: 'Research AI Agents',
    description: 'Deep dive into autonomous agent architectures and frameworks',
    status: 'active',
    priority: 'high',
    assignedAgentId: 'a1',
    tasks: [
      { id: 't1', title: 'Survey LangChain agents', description: 'Review LangChain agent patterns' },
      { id: 't2', title: 'Compare AutoGPT vs BabyAGI', description: 'Analyze architecture differences' },
    ],
    actionPlans: [
      {
        id: 'ap1',
        missionId: 'm1',
        description: 'Execute web research on 5 top agent frameworks',
        steps: ['Search web for "autonomous agent frameworks 2026"', 'Compile findings into report', 'Present to human'],
        status: 'pending',
        createdAt: '2026-03-02T20:00:00Z'
      }
    ],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-02T20:00:00Z'
  },
  {
    id: 'm2',
    title: 'Setup Gmail Integration',
    description: 'Connect assistant email to send morning briefings',
    status: 'completed',
    priority: 'medium',
    assignedAgentId: 'a2',
    tasks: [
      { id: 't3', title: 'Generate app password', description: 'Get 16-char password from Google' },
      { id: 't4', title: 'Store in Keychain', description: 'Secure credential storage' },
      { id: 't5', title: 'Write send-email script', description: 'Python SMTP wrapper' },
    ],
    actionPlans: [],
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-03-02T21:00:00Z'
  },
  {
    id: 'm3',
    title: 'Build Mission Control UI',
    description: 'Create the command center for agent management',
    status: 'planning',
    priority: 'critical',
    assignedAgentId: 'a1',
    tasks: [
      { id: 't6', title: 'Design Kanban board', description: 'Drag-drop mission prioritization' },
      { id: 't7', title: 'Agent status cards', description: 'Show agent activity and burn rate' },
    ],
    actionPlans: [],
    createdAt: '2026-03-02T22:00:00Z',
    updatedAt: '2026-03-02T22:00:00Z'
  },
  {
    id: 'm4',
    title: 'Security Audit',
    description: 'Review OpenClaw deployment for vulnerabilities',
    status: 'backlog',
    priority: 'low',
    tasks: [],
    actionPlans: [],
    createdAt: '2026-03-02T18:00:00Z',
    updatedAt: '2026-03-02T18:00:00Z'
  },
];

export const mockAgents: Agent[] = [
  {
    id: 'a1',
    name: 'Research-1',
    role: 'Research & Analysis',
    status: 'active',
    currentMissionId: 'm1',
    tokenBurn24h: 45000,
    capabilities: ['web-search', 'web-fetch', 'reading-files'],
    createdAt: '2026-02-15T10:00:00Z'
  },
  {
    id: 'a2',
    name: 'Ops-1',
    role: 'Operations & Scheduling',
    status: 'active',
    currentMissionId: 'm2',
    tokenBurn24h: 12300,
    capabilities: ['cron', 'email', 'telegram'],
    createdAt: '2026-02-10T08:00:00Z'
  },
  {
    id: 'a3',
    name: 'Dev-1',
    role: 'Development',
    status: 'idle',
    tokenBurn24h: 0,
    capabilities: ['exec', 'write-files', 'git'],
    createdAt: '2026-02-20T14:00:00Z'
  },
  {
    id: 'a4',
    name: 'Monitor-1',
    role: 'System Monitoring',
    status: 'busy',
    tokenBurn24h: 8900,
    capabilities: ['health-check', 'logging'],
    createdAt: '2026-02-25T09:00:00Z'
  },
];

export const mockNodes: Node[] = [
  {
    id: 'n1',
    name: 'Mac Mini (Hub)',
    type: 'mac-mini',
    status: 'online',
    lastSeen: '2026-03-02T21:00:00Z',
    capabilities: ['exec', 'gateway', 'browser'],
    location: 'Home Office'
  },
  {
    id: 'n2',
    name: "Alberto's iPhone",
    type: 'iphone',
    status: 'online',
    lastSeen: '2026-03-02T20:45:00Z',
    capabilities: ['camera', 'location', 'screen'],
    location: 'Mobile'
  },
  {
    id: 'n3',
    name: 'Pi Gateway',
    type: 'pi',
    status: 'offline',
    lastSeen: '2026-03-01T18:00:00Z',
    capabilities: ['exec', 'relay'],
    location: 'Garage'
  },
];
