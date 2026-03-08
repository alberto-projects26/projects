'use client';

import { useAgents } from '@/hooks/useAgents';
import { useNodes } from '@/hooks/useNodes';

export default function Dashboard() {
  const { agents, usingMockData: agentsMock } = useAgents();
  const { nodes, usingMockData: nodesMock } = useNodes();

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const onlineNodes = nodes.filter(n => n.status === 'online').length;
  const isDemoMode = agentsMock || nodesMock;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome back, Commander. All systems operational.</p>
        </div>
        <div className="flex items-center gap-3">
          {isDemoMode && (
            <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-mono">
              DEMO MODE
            </div>
          )}
          <button className="px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-300 text-sm transition-colors">
            📊 Reports
          </button>
          <button className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors shadow-lg shadow-cyan-600/20">
            ⚡ Quick Action
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "AI Agents Online", value: activeAgents.toString(), change: "All systems nominal", color: "from-purple-500 to-pink-500", icon: "🤖" },
          { label: "Hardware Nodes", value: onlineNodes.toString(), change: `${nodes.length} paired total`, color: "from-blue-500 to-cyan-500", icon: "📱" },
          { label: "Tasks Remaining", value: "12", change: "5 high priority", color: "from-green-500 to-emerald-500", icon: "✅" },
          { label: "Active Missions", value: "4", change: "1 due this week", color: "from-orange-500 to-red-500", icon: "🎯" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${stat.color} bg-clip-text text-transparent border border-gray-700`}>
                LIVE
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
            <div className="text-xs text-gray-500 mt-2">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl">
          <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
            <h3 className="font-semibold text-white">Recent Activity</h3>
            <button className="text-sm text-cyan-400 hover:text-cyan-300">View all</button>
          </div>
          <div className="divide-y divide-[#30363d]">
            {[
              { action: "Task completed", item: "Review PR #247", time: "2 min ago", type: "success" },
              { action: "Mission created", item: "Launch v2.0", time: "1 hour ago", type: "info" },
              { action: "Node online", item: "Alberto's Mac mini", time: "3 hours ago", type: "info" },
              { action: "Task assigned", item: "Fix navigation bug", time: "5 hours ago", type: "warning" },
            ].map((activity, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-[#21262d]/50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' : 
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-cyan-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm text-white">{activity.action}</div>
                  <div className="text-sm text-gray-400">{activity.item}</div>
                </div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Logs Preview */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl">
          <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
            <h3 className="font-semibold text-white">Live Logs</h3>
            <button className="text-sm text-cyan-400 hover:text-cyan-300">View stream</button>
          </div>
          <div className="p-4 space-y-2 font-mono text-[11px]">
            {[
              { t: '14:32:10', s: 'SYS', m: 'Heartbeat check received from 4 agents', c: 'text-gray-500' },
              { t: '14:31:05', s: 'NODE', m: 'Mac mini report: CPU load 12%, Mem 45%', c: 'text-green-500' },
              { t: '14:30:12', s: 'AGENT', m: 'spawn: research-bot started successfully', c: 'text-cyan-400' },
              { t: '14:28:45', s: 'TOOL', m: 'git: push completed to origin/main', c: 'text-purple-400' },
              { t: '14:25:30', s: 'SYS', m: 'Daily cost alert: threshold 50% reached', c: 'text-yellow-500' },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 px-2 py-1 hover:bg-[#21262d] rounded transition-colors group">
                <span className="text-gray-600">{log.t}</span>
                <span className={`font-bold w-10 ${log.c}`}>{log.s}</span>
                <span className="text-gray-400 group-hover:text-gray-200">{log.m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
