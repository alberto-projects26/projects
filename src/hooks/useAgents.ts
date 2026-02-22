'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'paused';
  model: string;
  provider: string;
  tokensIn: number;
  tokensOut: number;
  costToday: number;
  uptime: string;
  lastActivity: string;
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch('/api/agents');
        const data = await res.json();
        
        if (data.source === 'real' && data.agents.length > 0) {
          setAgents(data.agents);
          setUsingMockData(false);
        } else {
          // Fallback to mock data
          setAgents([
            {
              id: 'jarvis-main',
              name: 'Jarvis (Main)',
              status: 'active',
              model: 'GPT-4 Turbo',
              provider: 'OpenRouter',
              tokensIn: 45200,
              tokensOut: 18900,
              costToday: 2.34,
              uptime: '3h 42m',
              lastActivity: '2 min ago',
            },
            {
              id: 'research-bot',
              name: 'Research Bot',
              status: 'idle',
              model: 'Claude 3.5 Sonnet',
              provider: 'Anthropic',
              tokensIn: 12800,
              tokensOut: 5600,
              costToday: 0.89,
              uptime: '1h 15m',
              lastActivity: '15 min ago',
            },
          ]);
          setUsingMockData(true);
        }
      } catch (err) {
        setError('Failed to fetch agents');
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  return { agents, loading, error, usingMockData };
}