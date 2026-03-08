'use client';

import { useState, useEffect } from 'react';

// Central store for mission-agent assignments
// In a real app, this would be in a DB
let assignments: Record<string, string> = {}; // { agentId: missionId }

export function getAgentMission(agentId: string) {
  return assignments[agentId];
}

export function assignAgentToMission(agentId: string, missionId: string | null) {
  if (missionId) {
    assignments[agentId] = missionId;
  } else {
    delete assignments[agentId];
  }
}

export function useAssignments() {
  const [data, setData] = useState<Record<string, string>>(assignments);

  useEffect(() => {
    const interval = setInterval(() => {
      setData({ ...assignments });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return data;
}
