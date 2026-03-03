"use client";

import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ListTodo,
  LayoutDashboard, 
  Target, 
  Users, 
  Cpu, 
  Plus, 
  GripVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Camera,
  Monitor,
  MapPin,
  Zap,
  Activity,
  X
} from 'lucide-react';
import { 
  fetchMissions, 
  fetchAgents, 
  fetchNodes, 
  fetchTodos, 
  updateMissionStatus, 
  updateTodo, 
  updateAgentStatus,
  Mission as SupaMission,
  Agent as SupaAgent,
  Node as SupaNode,
  Todo as SupaTodo
} from '../data/supabase';
// import { mockMissions, mockAgents, mockNodes } from '../data/mock';

// ============ RE-MAP TYPES FOR BACKEND COMPAT ============
type Mission = SupaMission;
type Agent = SupaAgent;
type Node = SupaNode;
type Todo = SupaTodo;

// ============ COMPONENTS ============

// Sidebar
function Sidebar({ activeView, setActiveView }: { activeView: string; setActiveView: (v: string) => void }) {
  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracker', label: 'Todo Tracker', icon: ListTodo },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'nodes', label: 'Nodes', icon: Cpu },
  ];
  
  return (
    <nav className="fixed left-0 top-0 h-full w-64 border-r border-[#30363d] bg-[#010409] p-4 z-50">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-6 h-6 bg-cyan-500 rounded-sm animate-pulse"></div>
        <span className="font-bold text-white tracking-widest uppercase text-xs">Mission Control</span>
      </div>
      
      <ul className="space-y-1">
        {nav.map(item => (
          <li key={item.id}>
            <button 
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                activeView === item.id 
                  ? 'bg-[#1f6feb] text-white' 
                  : 'hover:bg-[#161b22] text-[#c9d1d9]'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="absolute bottom-4 left-4 right-4 p-4 border-t border-[#30363d]">
        <div className="flex items-center gap-2 text-xs text-[#8b949e]">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Gateway Online
        </div>
      </div>
    </nav>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: 'bg-green-500/20 text-green-400 border-green-500/30',
    idle: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    active: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    busy: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    retired: 'bg-red-500/20 text-red-400 border-red-500/30',
    offline: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${colors[status] || colors.idle}`}>
      {status}
    </span>
  );
}

// Priority Badge
function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: 'bg-gray-500/20 text-gray-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-amber-500/20 text-amber-400',
    critical: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${colors[priority] || colors.low}`}>
      {priority}
    </span>
  );
}

// ============ DASHBOARD ============

function Dashboard({ agents, missions, nodes, todos }: { agents: Agent[]; missions: Mission[]; nodes: Node[]; todos: Todo[] }) {
  const activeAgents = agents.filter(a => a.status !== 'retired').length;
  const totalBurn = agents.reduce((sum, a) => sum + a.tokenBurn24h, 0);
  const onlineNodes = nodes.filter(n => n.status === 'online').length;
  const pendingApprovals = missions.reduce((sum, m) => 
    sum + (m.action_plans?.filter(a => a.status === 'pending').length || 0), 0);

  const stats = [
    { label: 'Active Agents', value: activeAgents, icon: Users, color: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]' },
    { label: '24h Token Burn', value: `${(totalBurn / 1000).toFixed(1)}k`, icon: Zap, color: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
    { label: 'Paired Nodes', value: onlineNodes, icon: Cpu, color: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]' },
    { label: 'Pending Approvals', value: pendingApprovals, icon: AlertTriangle, color: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end border-b border-[#30363d] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight flex items-center gap-3">
            <span className="w-1 h-8 bg-cyan-500 rounded-full"></span>
            FLEET OVERVIEW
          </h1>
          <p className="text-xs font-mono text-[#8b949e] uppercase tracking-[0.2em]">Operational status: Nominal</p>
        </div>
        <div className="hidden lg:flex gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Uptime</div>
            <div className="text-sm font-mono text-white">14:02:44:19</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Bandwidth</div>
            <div className="text-sm font-mono text-white">2.4 GB/s</div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.label} className={`group relative p-6 rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden transition-all hover:border-[#484f58] ${stat.glow}`}>
            {/* Design elements */}
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-1 h-0 bg-cyan-500 group-hover:h-full transition-all duration-500"></div>
            
            <div className="relative flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-[#8b949e] uppercase tracking-[0.2em]">{stat.label}</span>
              <stat.icon size={18} className={`${stat.color} group-hover:scale-110 transition-transform`} />
            </div>
            <div className="relative flex items-baseline gap-2">
              <div className="text-5xl font-extralight text-white tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-mono text-[#484f58] uppercase">Current</div>
            </div>

            {/* Scanning line animation */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 translate-y-full animate-[scan_3s_linear_infinite] bg-gradient-to-b from-transparent via-cyan-500 to-transparent h-1/2 w-full"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <section className="lg:col-span-2 p-6 rounded-xl border border-[#30363d] bg-[#0d1117] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Activity size={120} />
          </div>
          
          <h3 className="text-xs font-black text-[#8b949e] uppercase mb-8 flex items-center gap-3 tracking-[0.2em]">
            <span className="w-2 h-2 bg-cyan-500 animate-pulse rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
            UNIFIED EVENT STREAM
          </h3>
          
          <div className="space-y-4 font-mono">
            {[
              { time: '22:45:12', type: 'mission', status: 'INFO', msg: 'Mission "Build Mission Control UI" moved to Planning' },
              { time: '22:44:03', type: 'agent', status: 'WARN', msg: 'Agent Dev-1 latency check: 142ms (Elevated)' },
              { time: '22:43:22', type: 'approval', status: 'REQ', msg: 'Action Plan awaiting approval: "Execute web research"' },
              { time: '22:42:00', type: 'node', status: 'SYS', msg: 'Node "Alberto\'s iPhone" authenticated (E2EE)' },
              { time: '22:40:15', type: 'system', status: 'OK', msg: 'Secure WebSocket handshake: 101 Switching Protocols' },
            ].map((event, i) => (
              <div key={i} className="text-xs flex gap-6 group hover:bg-white/[0.02] p-2 -m-2 rounded transition-colors">
                <span className="text-[#484f58] shrink-0">{event.time}</span>
                <span className={`shrink-0 w-12 font-bold ${
                  event.status === 'REQ' ? 'text-amber-500' : 
                  event.status === 'WARN' ? 'text-red-500' : 
                  'text-cyan-700'
                }`}>[{event.status}]</span>
                <span className="text-[#c9d1d9] group-hover:text-white transition-colors">{event.msg}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mini Performance Radar/Chart Placeholder */}
        <section className="p-6 rounded-xl border border-[#30363d] bg-[#161b22] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-[#8b949e] uppercase mb-4 tracking-[0.2em]">Resource Allocation</h3>
            <div className="space-y-4">
              {[
                { label: 'Compute', val: '74%', color: 'bg-cyan-500' },
                { label: 'Memory', val: '32%', color: 'bg-purple-500' },
                { label: 'API Quota', val: '12%', color: 'bg-amber-500' },
              ].map(bar => (
                <div key={bar.label}>
                  <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-widest">
                    <span className="text-[#8b949e]">{bar.label}</span>
                    <span className="text-white">{bar.val}</span>
                  </div>
                  <div className="h-1 w-full bg-[#0d1117] rounded-full overflow-hidden">
                    <div className={`h-full ${bar.color} rounded-full`} style={{ width: bar.val }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#30363d]">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-[10px] font-bold text-[#8b949e] uppercase mb-1">Fleet Latency</div>
                <div className="text-2xl font-light text-white tracking-tighter">24<span className="text-xs ml-1 text-[#484f58]">ms</span></div>
              </div>
              <div className="w-24 h-12 flex items-end gap-1">
                {[4,7,3,8,5,9,6,8,4].map((h, i) => (
                  <div key={i} className="flex-1 bg-cyan-500/20 w-1 rounded-t-sm animate-pulse" style={{ height: `${h * 10}%`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ============ MISSIONS (KANBAN) ============

const STATUS_COLUMNS: { id: MissionStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'text-gray-400' },
  { id: 'planning', label: 'Planning', color: 'text-blue-400' },
  { id: 'active', label: 'Active', color: 'text-cyan-400' },
  { id: 'review', label: 'Review', color: 'text-amber-400' },
  { id: 'completed', label: 'Completed', color: 'text-green-400' },
];

function MissionCard({ mission, agents }: { mission: Mission; agents: Agent[] }) {
  const agent = agents.find(a => a.id === mission.assigned_agent_id);
  
  return (
    <div className="group p-4 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#484f58] transition-all relative overflow-hidden cursor-grab active:cursor-grabbing">
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        mission.priority === 'critical' ? 'bg-red-500' : 
        mission.priority === 'high' ? 'bg-amber-500' : 
        'bg-cyan-500'
      }`}></div>
      
      <div className="flex items-start justify-between mb-3">
        <PriorityBadge priority={mission.priority} />
        <button className="text-[#484f58] hover:text-[#c9d1d9] transition-colors">
          <GripVertical size={14} />
        </button>
      </div>
      
      <h4 className="text-sm font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{mission.title}</h4>
      <p className="text-[11px] text-[#8b949e] line-clamp-2 mb-4 font-mono leading-relaxed">{mission.description}</p>
      
      <div className="flex items-center justify-between pt-3 border-t border-[#30363d]">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${agent ? 'bg-cyan-500 animate-pulse' : 'bg-gray-700'}`}></div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${agent ? 'text-cyan-400' : 'text-[#484f58]'}`}>
            {agent?.name || 'Unassigned'}
          </span>
        </div>
        <div className="flex gap-2">
          {mission.tasks.length > 0 && (
            <span className="text-[10px] font-mono text-[#8b949e] flex items-center gap-1">
              <CheckCircle2 size={10} className="text-green-500" /> {mission.tasks.length}
            </span>
          )}
          {mission.actionPlans.some(a => a.status === 'pending') && (
            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 animate-pulse">
              <AlertTriangle size={10} /> 1
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Missions({ missions, setMissions, agents }: { missions: Mission[]; setMissions: (m: Mission[]) => void; agents: Agent[] }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getMissionsByStatus = (status: MissionStatus) => 
    missions.filter(m => m.status === status);

  const handleDragEnd = async (event: DragEndEvent, newStatus: MissionStatus) => {
    const { active, over } = event;
    if (!over) return;
    
    const missionId = active.id as string;
    const oldMission = missions.find(m => m.id === missionId);
    if (!oldMission || oldMission.status === newStatus) return;

    // Optimistic update
    setMissions(missions.map(m => m.id === missionId ? { ...m, status: newStatus } : m));

    try {
      await updateMissionStatus(missionId, newStatus);
    } catch (err) {
      console.error('Failed to update mission status:', err);
      // Rollback
      setMissions(missions);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-end justify-between border-b border-[#30363d] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight flex items-center gap-3">
            <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
            MISSION KANBAN
          </h1>
          <p className="text-xs font-mono text-[#8b949e] uppercase tracking-[0.2em]">Strategy Room / Deployment Hub</p>
        </div>
        <button className="group flex items-center gap-3 px-5 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md transition-all shadow-[0_0_20px_rgba(35,134,54,0.15)] active:scale-95">
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          INITIATE MISSION
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {STATUS_COLUMNS.map(col => (
          <div key={col.id} className="min-h-[600px] flex flex-col">
            <div className={`text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3 p-3 rounded-lg bg-[#161b22] border border-[#30363d] ${col.color}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor] bg-current`}></div>
              {col.label}
              <span className="ml-auto font-mono text-[#484f58]">{getMissionsByStatus(col.id).length}</span>
            </div>
            
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, col.id)}
            >
              <SortableContext 
                items={getMissionsByStatus(col.id).map(m => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 flex-1 px-1">
                  {getMissionsByStatus(col.id).map(mission => (
                    <MissionCard key={mission.id} mission={mission} />
                  ))}
                  {getMissionsByStatus(col.id).length === 0 && (
                    <div className="h-24 rounded-xl border border-dashed border-[#30363d] flex items-center justify-center text-[10px] font-black text-[#30363d] uppercase tracking-widest">
                      Empty Sector
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ AGENTS ============

function AgentCard({ agent, onRetire }: { agent: Agent; onRetire: (id: string) => void }) {
  const mission = missions.find(m => m.id === agent.current_mission_id);
  
  return (
    <div className="group relative p-6 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#484f58] transition-all overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.2)]">
      {/* Design accents */}
      <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors"></div>
      
      <div className="flex items-start justify-between mb-6 relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-cyan-500 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
            <Users size={24} />
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{agent.name}</h4>
            <p className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest">{agent.role}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>
      
      <div className="space-y-3 mb-6 relative font-mono text-[11px]">
        <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
          <span className="text-[#8b949e] uppercase tracking-tighter">Mission</span>
          <span className="text-cyan-400">{mission?.title ? mission.title.substring(0, 15) + '...' : 'IDLE'}</span>
        </div>
        <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
          <span className="text-[#8b949e] uppercase tracking-tighter">Energy/Burn</span>
          <span className="text-white">{agent.tokenBurn24h.toLocaleString()} TK</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#8b949e] uppercase tracking-tighter">Uptime</span>
          <span className="text-white">82h 14m</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6 relative">
        {agent.capabilities.map(cap => (
          <span key={cap} className="px-2 py-1 text-[9px] font-black bg-[#0d1117] text-[#484f58] rounded border border-[#30363d] uppercase tracking-tighter group-hover:border-cyan-500/30 group-hover:text-cyan-700 transition-all">
            {cap}
          </span>
        ))}
      </div>

      {agent.status !== 'retired' && (
        <button 
          onClick={() => onRetire(agent.id)}
          className="relative w-full py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-red-500/50 border border-red-500/20 hover:border-red-500 hover:text-red-500 hover:bg-red-500/5 rounded-md transition-all active:scale-95"
        >
          DECOMMISSION AGENT
        </button>
      )}
    </div>
  );
}

function Agents({ agents, setAgents, missions }: { agents: Agent[]; setAgents: (a: Agent[]) => void; missions: Mission[] }) {
  const handleRetire = async (id: string) => {
    // Optimistic update
    setAgents(agents.map(a => a.id === id ? { ...a, status: 'retired' as const } : a));
    
    try {
      await updateAgentStatus(id, 'retired');
    } catch (err) {
      console.error('Failed to retire agent:', err);
      // Rollback
      setAgents(agents);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-end justify-between border-b border-[#30363d] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight flex items-center gap-3">
            <span className="w-1 h-8 bg-purple-500 rounded-full"></span>
            FLEET HANGAR
          </h1>
          <p className="text-xs font-mono text-[#8b949e] uppercase tracking-[0.2em]">Agent Registry / Resource Control</p>
        </div>
        <button className="flex items-center gap-3 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] active:scale-95">
          <Plus size={16} />
          CONSTRUCT AGENT
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} onRetire={handleRetire} />
        ))}
      </div>
    </div>
  );
}

// ============ NODES ============

function NodeActions({ nodeId }: { nodeId: string }) {
  const [action, setAction] = useState<string | null>(null);
  
  const actions = [
    { id: 'camera', label: 'CAM SNAP', icon: Camera },
    { id: 'screen', label: 'SCR REC', icon: Monitor },
    { id: 'location', label: 'GPS LOC', icon: MapPin },
  ];

  const handleAction = async (actionId: string) => {
    setAction(actionId);
    setTimeout(() => setAction(null), 2000);
  };

  return (
    <div className="flex gap-2 mt-6">
      {actions.map(act => (
        <button
          key={act.id}
          onClick={() => handleAction(act.id)}
          disabled={!!action}
          className={`flex-1 py-2 text-[9px] font-black border transition-all flex flex-col items-center justify-center gap-2 rounded-md ${
            action === act.id
              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-cyan-500/50 hover:text-white'
          }`}
        >
          {action === act.id ? (
            <Activity size={14} className="animate-spin" />
          ) : (
            <act.icon size={14} />
          )}
          <span className="tracking-widest">{act.label}</span>
        </button>
      ))}
    </div>
  );
}

function NodeCard({ node }: { node: Node }) {
  return (
    <div className="group relative p-6 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#484f58] transition-all overflow-hidden">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h4 className="text-white font-black uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{node.name}</h4>
          <p className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest">{node.type}</p>
        </div>
        <StatusBadge status={node.status} />
      </div>

      <div className="space-y-3 font-mono text-[11px]">
        <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
          <span className="text-[#8b949e] uppercase tracking-tighter">Vector/Location</span>
          <span className="text-white">{node.location || 'UNKNOWN'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#8b949e] uppercase tracking-tighter">Sync Log</span>
          <span className="text-white">{new Date(node.lastSeen).toLocaleTimeString()}</span>
        </div>
      </div>

      {node.status === 'online' && <NodeActions nodeId={node.id} />}
      {node.status === 'offline' && (
        <div className="mt-6 py-4 rounded-md bg-[#0d1117] border border-dashed border-[#30363d] flex items-center justify-center text-[10px] font-black text-[#30363d] uppercase tracking-[0.2em]">
          Connection Severed
        </div>
      )}
    </div>
  );
}

function Nodes({ nodes }: { nodes: Node[] }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-end justify-between border-b border-[#30363d] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight flex items-center gap-3">
            <span className="w-1 h-8 bg-red-500 rounded-full"></span>
            NODE NETWORK
          </h1>
          <p className="text-xs font-mono text-[#8b949e] uppercase tracking-[0.2em]">Peripheral Control / Hardware Grid</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Active Channels</div>
            <div className="text-sm font-mono text-white">08/12</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nodes.map(node => (
          <NodeCard key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}

// ============ TODO TRACKER ============

interface TodoTask {
  id: string;
  task: string;
  missionId?: string;
  botId?: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'planning';
}

function SortableTodoRow({ todo, agents, missions }: { todo: TodoTask; agents: Agent[]; missions: Mission[] }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const bot = agents.find(a => a.id === todo.botId);
  const mission = missions.find(m => m.id === todo.missionId);

  return (
    <tr 
      ref={setNodeRef} 
      style={style} 
      className="group hover:bg-white/[0.02] transition-colors border-b border-[#30363d] last:border-0"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="text-[#30363d] hover:text-[#8b949e] cursor-grab active:cursor-grabbing">
            <GripVertical size={14} />
          </button>
          <span className="text-white font-bold tracking-tight uppercase group-hover:text-cyan-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
            {todo.task}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-[10px] font-black uppercase text-[#8b949e] tracking-widest">
          {mission?.title || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {bot ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">{bot.name}</span>
            </>
          ) : (
            <span className="text-[10px] font-black uppercase text-[#484f58] tracking-widest">Unassigned</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-[10px] font-mono text-[#8b949e]">
        {new Date(todo.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right">
        <StatusBadge status={todo.status} />
      </td>
    </tr>
  );
}

function TodoTracker({ todos, setTodos, agents, missions }: { todos: Todo[]; setTodos: (t: Todo[]) => void; agents: Agent[]; missions: Mission[] }) {
  const activeTodos = todos.filter(t => t.status !== 'completed');
  const completedTodos = todos.filter(t => t.status === 'completed');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = todos.findIndex((i) => i.id === active.id);
      const newIndex = todos.findIndex((i) => i.id === over?.id);
      const newTodos = arrayMove(todos, oldIndex, newIndex);
      
      // Optimistic update
      setTodos(newTodos);
      
      try {
        // In a real app, you'd save the order index to the DB
        // For now we'll just update the item to trigger a change
        await updateTodo(active.id as string, { status: 'pending' });
      } catch (err) {
        console.error('Failed to update todo order:', err);
        // Rollback
        setTodos(todos);
      }
    }
  };

  const TableHeader = () => (
    <thead className="bg-[#0d1117] border-b border-[#30363d] text-[#8b949e] font-black uppercase text-[10px] tracking-[0.2em]">
      <tr>
        <th className="px-6 py-5">Objective</th>
        <th className="px-6 py-5">Mission</th>
        <th className="px-6 py-5">Bot</th>
        <th className="px-6 py-5">Created</th>
        <th className="px-6 py-5 text-right">Status</th>
      </tr>
    </thead>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex items-end justify-between border-b border-[#30363d] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight flex items-center gap-3">
            <span className="w-1 h-8 bg-cyan-500 rounded-full"></span>
            TODO TRACKER
          </h1>
          <p className="text-xs font-mono text-[#8b949e] uppercase tracking-[0.2em]">Prioritize and Track Task Execution</p>
        </div>
      </header>

      {/* Active Tasks Table */}
      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3 text-cyan-400">
          <div className="w-2 h-2 rounded-full animate-pulse bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
          Active Operations
          <span className="ml-auto font-mono text-[#484f58]">{activeTodos.length}</span>
        </h3>
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)]">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full text-left font-mono">
              <TableHeader />
              <SortableContext 
                items={activeTodos.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="">
                  {activeTodos.map(todo => (
                    <SortableTodoRow key={todo.id} todo={todo} agents={agents} missions={missions} />
                  ))}
                  {activeTodos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-[10px] font-black text-[#30363d] uppercase tracking-[0.2em]">
                        All current objectives achieved
                      </td>
                    </tr>
                  )}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>
      </section>

      {/* Completed Tasks Table */}
      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3 text-green-500">
          <CheckCircle2 size={12} />
          Terminal Phase / Archived
          <span className="ml-auto font-mono text-[#484f58]">{completedTodos.length}</span>
        </h3>
        <div className="rounded-xl border border-[#30363d] bg-[#010409] overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
          <table className="w-full text-left font-mono grayscale hover:grayscale-0 transition-all">
            <TableHeader />
            <tbody className="divide-y divide-[#30363d]">
              {completedTodos.map(todo => (
                <tr key={todo.id} className="group border-b border-[#30363d] last:border-0">
                  <td className="px-6 py-4">
                    <span className="text-[#8b949e] font-bold tracking-tight uppercase line-through flex items-center gap-3">
                      <div className="w-3.5" /> {/* Spacer for grip icon alignment */}
                      {todo.task}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black uppercase text-[#484f58] tracking-widest">{missions.find(m => m.id === todo.mission_id)?.title || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-black uppercase text-[#484f58] tracking-widest">
                    {agents.find(a => a.id === todo.bot_id)?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-[10px] font-mono text-[#484f58]">
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge status="completed" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ============ MAIN APP ============

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Supabase on mount
  React.useEffect(() => {
    async function loadData() {
      try {
        const [missionsData, agentsData, nodesData, todosData] = await Promise.all([
          fetchMissions(),
          fetchAgents(),
          fetchNodes(),
          fetchTodos()
        ]);
        setMissions(missionsData);
        setAgents(agentsData);
        setNodes(nodesData);
        setTodos(todosData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to connect to database. Using offline mode.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Refresh data helper
  const refreshData = async () => {
    setLoading(true);
    try {
      const [missionsData, agentsData, nodesData, todosData] = await Promise.all([
        fetchMissions(),
        fetchAgents(),
        fetchNodes(),
        fetchTodos()
      ]);
      setMissions(missionsData);
      setAgents(agentsData);
      setNodes(nodesData);
      setTodos(todosData);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs font-mono text-[#8b949e] uppercase tracking-widest">Connecting to Mission Control Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#1f6feb] selection:text-white">
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500/20 border-b border-red-500/50 p-2 text-center text-xs font-mono text-red-400 z-50">
          ⚠️ {error}
        </div>
      )}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className={`md:ml-64 p-8 ${error ? 'pt-12' : ''}`}>
        {activeView === 'dashboard' && <Dashboard agents={agents} missions={missions} nodes={nodes} todos={todos} />}
        {activeView === 'tracker' && <TodoTracker todos={todos} setTodos={setTodos} agents={agents} missions={missions} />}
        {activeView === 'missions' && <Missions missions={missions} setMissions={setMissions} agents={agents} />}
        {activeView === 'agents' && <Agents agents={agents} setAgents={setAgents} missions={missions} />}
        {activeView === 'nodes' && <Nodes nodes={nodes} />}
      </main>
    </div>
  );
}
