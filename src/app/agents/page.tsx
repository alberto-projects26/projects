'use client';

import { useState } from 'react';
import { useAgents } from '@/hooks/useAgents';
import { useAssignments, assignAgentToMission } from '@/utils/assignmentStore';

export default function AgentsPage() {
  const { agents, loading, error, usingMockData } = useAgents();
  const assignments = useAssignments();
  const [showSpawnModal, setShowSpawnModal] = useState(false);

  const totalCost = agents.reduce((sum, agent) => sum + agent.costToday, 0);
  const totalTokens = agents.reduce((sum, agent) => sum + agent.tokensIn + agent.tokensOut, 0);
  const activeCount = agents.filter(a => a.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-cyan-400 animate-pulse">Loading agents...</div>
      </div>
    );
  }

  if (error && agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-400">Error loading agents: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Bot & Agent Management</h1>
          <p className="text-gray-500 mt-1">Oversee your AI fleet and track usage costs</p>
        </div>
        <button 
          onClick={() => setShowSpawnModal(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
        >
          <span>+</span> Spawn Agent
        </button>
      </div>

      {/* Live Data Indicator */}
      {usingMockData && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-3">
          <span className="text-yellow-400">⚠️</span>
          <div className="flex-1">
            <p className="text-yellow-400 text-sm">Using demo data — OpenClaw integration not configured</p>
            <p className="text-gray-500 text-xs mt-1">Run `openclaw sessions list` to populate with real agents</p>
          </div>
        </div>
      )}

      {/* Cost Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500 mb-1">Today's Cost</div>
          <div className="text-3xl font-bold text-white">${totalCost.toFixed(2)}</div>
          <div className="text-xs text-green-400 mt-2">+12% vs yesterday</div>
        </div>
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500 mb-1">Total Tokens</div>
          <div className="text-3xl font-bold text-white">{(totalTokens / 1000).toFixed(1)}k</div>
          <div className="text-xs text-gray-400 mt-2">Across all agents</div>
        </div>
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500">Active Agents</div>
          <div className="text-3xl font-bold text-cyan-400">{activeCount}</div>
          <div className="text-xs text-gray-400 mt-2">of {agents.length} total</div>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-gray-600 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-[#21262d] flex items-center justify-center text-2xl border border-[#30363d]`}>
                  🤖
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{agent.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500">{agent.model}</div>
                    {assignments[agent.id] && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20 uppercase">
                        🎯 {assignments[agent.id]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs border ${agent.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-gray-500/10 text-gray-400'}`}>
                  {agent.status.toUpperCase()}
                </span>
                <select 
                  className="bg-[#161b22] border border-[#30363d] text-[10px] text-gray-400 rounded px-2 py-1 outline-none focus:border-cyan-500"
                  value={assignments[agent.id] || ''}
                  onChange={(e) => assignAgentToMission(agent.id, e.target.value || null)}
                >
                  <option value="">No Mission</option>
                  <option value="m-001">Mission Control Launch</option>
                  <option value="m-002">Launch v2.0 Platform</option>
                  <option value="m-003">Cost Audit</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Today's Cost</div>
                <div className="text-lg font-semibold text-white">${agent.costToday.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Tokens Used</div>
                <div className="text-lg font-semibold text-white">{((agent.tokensIn + agent.tokensOut) / 1000).toFixed(1)}k</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Uptime</div>
                <div className="text-lg font-semibold text-white">{agent.uptime}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#30363d]">
              <div className="text-xs text-gray-500">
                Last activity: {agent.lastActivity}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-sm text-gray-300 transition-colors">
                  {agent.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-sm text-red-400 transition-colors">
                  Stop
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
