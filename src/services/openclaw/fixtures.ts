/**
 * Mock Data Fixtures
 *
 * Extracted from MockOpenClawAdapter so tests and dev can use
 * different datasets without modifying adapter logic.
 */

import type { Agent, ClawNode } from '@/types/openclaw';

export function createDefaultAgents(): Agent[] {
  return [
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
}

export function createDefaultNodes(): ClawNode[] {
  return [];
}
