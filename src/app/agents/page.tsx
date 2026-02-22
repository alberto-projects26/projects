'use client';

import { useState } from 'react';

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

const mockAgents: Agent[] = [
  {
    id: 'agent-001',
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
    id: 'agent-002',
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
  {
    id: 'agent-003',
    name: 'Code Reviewer',
    status: 'paused',
    model: 'GPT-4o Mini',
    provider: 'OpenAI',
    tokensIn: 3400,
    tokensOut: 1200,
    costToday: 0.12,
    uptime: '45m',
    lastActivity: '1 hour ago',
  },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'idle':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'paused':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const getStatusDot = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500 animate-pulse';
    case 'idle':
      return 'bg-yellow-500';
    case 'paused':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentType, setNewAgentType] = useState('research');

  const totalCost = agents.reduce((sum, agent) => sum + agent.costToday, 0);
  const totalTokens = agents.reduce((sum, agent) => sum + agent.tokensIn + agent.tokensOut, 0);
  const activeCount = agents.filter(a => a.status === 'active').length;

  const handleSpawnAgent = () => {
    if (!newAgentName.trim()) return;
    
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: newAgentName,
      status: 'active',
      model: newAgentType === 'research' ? 'Claude 3.5 Sonnet' : 'GPT-4 Turbo',
      provider: newAgentType === 'research' ? 'Anthropic' : 'OpenRouter',
      tokensIn: 0,
      tokensOut: 0,
      costToday: 0,
      uptime: '0m',
      lastActivity: 'Just now',
    };
    
    setAgents([...agents, newAgent]);
    setShowSpawnModal(false);
    setNewAgentName('');
  };

  const toggleAgentStatus = (id: string) => {
    setAgents(agents.map(agent => {
      if (agent.id === id) {
        const nextStatus = agent.status === 'active' ? 'paused' : 
                          agent.status === 'paused' ? 'idle' : 'active';
        return { ...agent, status: nextStatus };
      }
      return agent;
    }));
  };

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
          <div className="text-sm text-gray-500 mb-1">Active Agents</div>
          <div className="text-3xl font-bold text-cyan-400">{activeCount}</div>
          <div className="text-xs text-gray-400 mt-2">of {agents.length} total</div>
        </div>
        
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500 mb-1">Monthly Budget</div>
          <div className="text-3xl font-bold text-white">$47.20</div>
          <div className="text-xs text-yellow-400 mt-2">47% of $100 limit</div>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-gray-600 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusDot(agent.status)}`} />
                <div>
                  <h3 className="font-semibold text-white text-lg">{agent.name}</h3>
                  <div className="text-sm text-gray-500">{agent.model} • {agent.provider}</div>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full border ${getStatusStyle(agent.status)}`}>
                {agent.status.toUpperCase()}
              </span>
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
                <button 
                  onClick={() => toggleAgentStatus(agent.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-sm text-gray-300 transition-colors"
                >
                  {agent.status === 'active' ? 'Pause' : agent.status === 'paused' ? 'Resume' : 'Activate'}
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-sm text-red-400 transition-colors">
                  Stop
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Provider Breakdown */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">Cost by Provider</h3>
        <div className="space-y-3">
          {[
            { name: 'OpenRouter', cost: 2.34, percent: 70, color: 'bg-cyan-500' },
            { name: 'Anthropic', cost: 0.89, percent: 26, color: 'bg-purple-500' },
            { name: 'OpenAI', cost: 0.12, percent: 4, color: 'bg-green-500' },
          ].map((provider) => (
            <div key={provider.name} className="flex items-center gap-4">
              <div className="w-24 text-sm text-gray-400">{provider.name}</div>
              <div className="flex-1 h-2 bg-[#21262d] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${provider.color} rounded-full`}
                  style={{ width: `${provider.percent}%` }}
                />
              </div>
              <div className="w-16 text-right text-sm text-white font-medium">${provider.cost.toFixed(2)}</div>
              <div className="w-12 text-right text-xs text-gray-500">{provider.percent}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Spawn Agent Modal */}
      {showSpawnModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Spawn New Agent</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Agent Name</label>
                <input 
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g., Dev Assistant"
                  className="w-full px-4 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Agent Type</label>
                <select 
                  value={newAgentType}
                  onChange={(e) => setNewAgentType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="research">Research Assistant (Claude 3.5)</option>
                  <option value="coding">Code Assistant (GPT-4)</option>
                  <option value="writing">Writing Assistant (GPT-4)</option>
                  <option value="analysis">Data Analysis (Claude 3.5)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowSpawnModal(false)}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSpawnAgent}
                className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                Spawn Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
