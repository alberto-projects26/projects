'use client';

import { useState, useEffect } from 'react';

interface Node {
  id: string;
  name: string;
  type: 'iOS' | 'Android' | 'macOS' | 'Linux' | 'Pi';
  status: 'online' | 'offline' | 'busy';
  battery?: number;
  lastSeen: string;
  capabilities: string[];
  location?: { lat: number; lng: number; accuracy: number };
}

export function useNodes() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    async function fetchNodes() {
      try {
        const res = await fetch('/api/nodes');
        const data = await res.json();
        
        if (data.source === 'real' && data.nodes.length > 0) {
          setNodes(data.nodes);
          setUsingMockData(false);
        } else {
          // Fallback to mock data
          setNodes([
            {
              id: 'node-001',
              name: "Alberto's iPhone",
              type: 'iOS',
              status: 'online',
              battery: 78,
              lastSeen: '2 min ago',
              capabilities: ['camera', 'location', 'screen', 'notifications'],
              location: { lat: 37.453, lng: -122.181, accuracy: 5 },
            },
            {
              id: 'node-002',
              name: 'Pixel Tablet',
              type: 'Android',
              status: 'online',
              battery: 45,
              lastSeen: '5 min ago',
              capabilities: ['camera', 'location', 'screen', 'sms'],
            },
            {
              id: 'node-003',
              name: 'Mac mini Lab',
              type: 'macOS',
              status: 'busy',
              lastSeen: '1 min ago',
              capabilities: ['screen', 'exec', 'camera'],
            },
          ]);
          setUsingMockData(true);
        }
      } catch (err) {
        setError('Failed to fetch nodes');
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    }

    fetchNodes();
    const interval = setInterval(fetchNodes, 30000);
    return () => clearInterval(interval);
  }, []);

  const executeCommand = async (nodeId: string, command: string) => {
    try {
      const res = await fetch('/api/nodes/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, command }),
      });
      return await res.json();
    } catch (err) {
      return { error: 'Command execution failed' };
    }
  };

  return { nodes, loading, error, usingMockData, executeCommand };
}