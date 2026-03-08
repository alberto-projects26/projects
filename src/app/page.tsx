'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from '../lib/auth';
import { 
  LayoutDashboard, 
  Target, 
  ListTodo, 
  Users, 
  Zap,
  Search,
  Code, 
  Cpu, 
  Plus, 
  ChevronRight, 
  Bell, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  GripVertical,
  ChevronDown,
  ExternalLink,
  Bot,
  Activity,
  History,
  Trash2,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  Loader2,
  LogOut
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import AuthScreen from '../components/AuthScreen';
import AgentRoom3D from '../components/3d/AgentRoom3D';
import SpecialistDeployModal from '../components/SpecialistDeployModal';
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
import { supabase } from '../lib/supabase';
import { 
  fetchMissions, 
  fetchAgents, 
  fetchNodes, 
  fetchTodos, 
  updateMissionStatus, 
  updateTodo, 
  updateAgentStatus,
  createMission,
  createAgent,
  createTodo,
  createActionPlan,
  Mission as SupaMission,
  Agent as SupaAgent,
  Node as SupaNode,
  Todo as SupaTodo
} from '../data/supabase';

// ============ TYPES ============

export type MissionStatus = 'backlog' | 'planning' | 'active' | 'review' | 'completed';
export type AgentStatus = 'idle' | 'active' | 'busy' | 'retired';
export type NodeStatus = 'online' | 'offline' | 'busy';

export interface Task {
  id: string;
  mission_id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface ActionPlan {
  id: string;
  mission_id: string;
  description: string;
  steps: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_agent_id: string | null;
  tasks: Task[];
  action_plans: ActionPlan[];
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  current_mission_id: string | null;
  token_burn_24h: number;
  capabilities: string[];
  model?: string;
}

export interface Node {
  id: string;
  name: string;
  type: 'mac-mini' | 'iphone' | 'android' | 'pi';
  status: NodeStatus;
  last_seen: string;
  capabilities: string[];
  location: string;
}

export interface Todo {
  id: string;
  task: string;
  mission_id: string | null;
  bot_id: string | null;
  status: 'pending' | 'completed' | 'planning';
  created_at: string;
}

// ============ UI COMPONENTS ============

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: 'bg-green-500/10 text-green-400 border-green-500/20',
    offline: 'bg-red-500/10 text-red-400 border-red-500/20',
    busy: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    idle: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    active: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    backlog: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    planning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded border ${colors[status] || colors.idle}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: 'bg-[#161b22] text-[#8b949e] border-[#30363d]',
    medium: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded border ${colors[priority] || colors.low}`}>
      {priority}
    </span>
  );
}

// ============ MODALS ============

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <header className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="text-[#8b949e] hover:text-white"><X size={18} /></button>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ============ COMMAND CENTER (DASHBOARD) ============

function Dashboard({ agents = [], missions = [], nodes = [], todos = [] }: { agents: Agent[]; missions: Mission[]; nodes: Node[]; todos: Todo[] }) {
  const activeAgents = agents?.filter(a => a.status !== 'retired').length || 0;
  const totalBurn = agents?.reduce((sum, a) => sum + (a.token_burn_24h || 0), 0) || 0;
  const onlineNodes = nodes?.filter(n => n.status === 'online').length || 0;
  const pendingApprovals = missions?.reduce((sum, m) => 
    sum + (m.action_plans?.filter(a => a.status === 'pending').length || 0), 0) || 0;

  const stats = [
    { label: 'Active Agents', value: activeAgents, icon: Users, color: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]' },
    { label: '24h Token Burn', value: `${(totalBurn / 1000).toFixed(1)}k`, icon: Zap, color: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
    { label: 'Online Nodes', value: onlineNodes, icon: Cpu, color: 'text-green-400', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.15)]' },
    { label: 'Pending Plans', value: pendingApprovals, icon: AlertCircle, color: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className={`p-6 rounded-2xl border border-[#30363d] bg-[#161b22] relative overflow-hidden group ${stat.glow}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-current opacity-20 transition-all group-hover:opacity-100" style={{ color: stat.color.split('text-')[1] }}></div>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-black/40 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">{stat.label}</div>
                <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden h-[600px]">
        <AgentRoom3D agents={agents} />
      </div>
    </div>
  );
}

// ============ MISSIONS ============

function MissionCard({ 
  mission, 
  agents = [], 
  onDrillDown 
}: { 
  mission: Mission; 
  agents?: Agent[];
  onDrillDown: (m: Mission) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mission.id });
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1
  };
  const agent = agents?.find(a => a.id === mission.assigned_agent_id);

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        onDrillDown(mission);
      }}
      className={`group p-4 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#484f58] transition-all relative overflow-hidden cursor-grab active:cursor-grabbing ${
        isDragging ? 'shadow-2xl ring-2 ring-cyan-500/50' : 'shadow-lg'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          <PriorityBadge priority={mission.priority} />
          {mission.assigned_agent_id && (
            <div className="px-2 py-0.5 text-[10px] font-black uppercase rounded border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              Assigned
            </div>
          )}
        </div>
        {mission.action_plans?.some(a => a.status === 'pending') && (
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
        )}
      </div>
      
      <h4 className="text-white font-black uppercase text-sm mb-2 tracking-tight group-hover:text-cyan-400 transition-colors">{mission.title}</h4>
      <p className="text-[10px] text-[#8b949e] line-clamp-2 font-mono leading-relaxed mb-4">{mission.description}</p>
      
      <div className="flex items-center justify-between pt-3 border-t border-[#30363d]">
        {agent ? (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-cyan-500'}`}></div>
            <span className="text-[9px] font-black uppercase text-white tracking-wider">{agent.name}</span>
          </div>
        ) : (
          <span className="text-[9px] font-black uppercase text-[#484f58] tracking-widest">Awaiting Unit</span>
        )}
        <div className="text-[8px] font-mono text-[#484f58] uppercase">
          {new Date(mission.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

const STATUS_COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'text-slate-400' },
  { id: 'planning', label: 'Planning', color: 'text-amber-400' },
  { id: 'active', label: 'Execution', color: 'text-cyan-400' },
  { id: 'review', label: 'Review', color: 'text-purple-400' },
  { id: 'completed', label: 'Deployed', color: 'text-green-400' },
] as const;

function Missions({ 
  missions = [], 
  setMissions, 
  agents = [], 
  onInitiate,
  onDrillDown,
  refreshData
}: { 
  missions?: Mission[]; 
  setMissions: (m: Mission[]) => void; 
  agents?: Agent[];
  onInitiate: () => void;
  onDrillDown: (m: Mission) => void;
  refreshData: () => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const getMissionsByStatus = (status: MissionStatus) => {
    const filtered = missions?.filter(m => m.status === status) || [];
    
    // Sort logic: Assigned Units First, then by Priority Level
    const priorityMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    
    return [...filtered].sort((a, b) => {
      // Rule 1: Assigned agents take precedence
      if (a.assigned_agent_id && !b.assigned_agent_id) return -1;
      if (!a.assigned_agent_id && b.assigned_agent_id) return 1;
      
      // Rule 2: Priority stacking
      const pa = priorityMap[a.priority] || 0;
      const pb = priorityMap[b.priority] || 0;
      if (pa !== pb) return pb - pa;
      
      // Rule 3: Natural sort by creation
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const missionId = active.id as string;
    const newStatus = over.id as MissionStatus;
    
    // Find destination status if dropped on a card instead of the column
    let targetStatus = newStatus;
    if (!['backlog', 'planning', 'active', 'review', 'completed'].includes(newStatus)) {
      const targetMission = missions.find(m => m.id === over.id);
      if (targetMission) targetStatus = targetMission.status;
      else return;
    }

    const oldMission = missions?.find(m => m.id === missionId);
    if (!oldMission || oldMission.status === targetStatus) return;

    // Optimistic update
    setMissions(missions.map(m => m.id === missionId ? { ...m, status: targetStatus } : m));

    try {
      await updateMissionStatus(missionId, targetStatus);
      toast.success(`Mission moved to ${targetStatus}`);
      
      // Auto-logic: If moved to planning and has no pending action plans, create one
      if (targetStatus === 'planning' && (!oldMission.action_plans || oldMission.action_plans.length === 0)) {
        await createActionPlan({
          mission_id: missionId,
          description: `Strategic blueprint for mission: ${oldMission.title}`,
          steps: ["Define core objectives", "Identify required agents", "Resource allocation scan"],
          status: 'pending'
        });
        toast('Drafting action plan...', { icon: '📝' });
        refreshData();
      }
    } catch (err) {
      console.error('Drag update failed:', err);
      toast.error('Failed to move mission.');
      refreshData();
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
          <p className="text-xs font-mono text-[#8b949e] uppercase tracking-[0.2em]">Deployment Pipeline / Task Orchestration</p>
        </div>
        <button 
          onClick={onInitiate}
          className="px-6 py-2 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2 group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          INITIATE MISSION
        </button>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {STATUS_COLUMNS.map(col => (
            <div key={col.id} className="min-h-[600px] flex flex-col">
              <div className={`text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3 p-3 rounded-lg bg-[#161b22] border border-[#30363d] ${col.color}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor] bg-current`}></div>
                {col.label}
                <span className="ml-auto font-mono text-[#484f58]">{getMissionsByStatus(col.id).length}</span>
              </div>
              
              <SortableContext items={getMissionsByStatus(col.id).map(m => m.id)} strategy={verticalListSortingStrategy}>
                <DroppableColumn id={col.id}>
                  <div className="space-y-3 flex-1 px-1">
                    {getMissionsByStatus(col.id).map(mission => (
                      <MissionCard 
                        key={mission.id} 
                        mission={mission} 
                        agents={agents} 
                        onDrillDown={onDrillDown}
                      />
                    ))}
                    {getMissionsByStatus(col.id).length === 0 && (
                      <div className="h-24 rounded-xl border border-dashed border-[#30363d] flex items-center justify-center text-[10px] font-black text-[#30363d] uppercase tracking-widest">
                        Empty Sector
                      </div>
                    )}
                  </div>
                </DroppableColumn>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}

import { useDroppable } from '@dnd-kit/core';

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className="flex-1 flex flex-col">{children}</div>;
}

// ============ FLEET HANGAR (AGENTS) ============

function AgentCard({ agent, onRetire, missions = [] }: { agent: Agent; onRetire: (id: string) => void; missions?: Mission[] }) {
  const mission = missions?.find(m => m.id === agent.current_mission_id);
  
  return (
    <div className="group relative p-6 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#484f58] transition-all overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.2)]">
      <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors"></div>
      
      <div className="flex items-start justify-between mb-6 relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-cyan-500 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
            {agent.id.startsWith('research') ? <Search size={24} /> : 
             agent.id.startsWith('code') ? <Code size={24} /> :
             agent.id.startsWith('ops') ? <Zap size={24} /> :
             agent.id.startsWith('analysis') ? <Activity size={24} /> :
             <Users size={24} />}
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{agent.name}</h4>
            <div className="text-[10px] text-[#8b949e] font-mono uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50"></span>
            {agent.model || 'Standard Engine'}
          </div>
          <p className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest">{agent.role}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <div className="space-y-4 relative">
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">24h Burn</span>
          </div>
          <span className="text-white">{(agent.token_burn_24h || 0).toLocaleString()} TK</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-cyan-400" />
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Assignment</span>
          </div>
          <span className="text-[10px] text-white font-mono uppercase truncate max-w-[120px]">{mission?.title || 'None'}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {agent.capabilities.map(cap => (
          <span key={cap} className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-mono text-[#c9d1d9] uppercase border border-white/5">{cap}</span>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-[#30363d] flex gap-3">
        <button className="flex-1 px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all">Command</button>
        {agent.status !== 'retired' && (
          <button onClick={() => onRetire(agent.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
        )}
      </div>
    </div>
  );
}

function Agents({ agents = [], setAgents, missions = [], onConstruct, onDeploySpecialist }: { agents?: Agent[]; setAgents: (a: Agent[]) => void; missions?: Mission[]; onConstruct: () => void; onDeploySpecialist: () => void }) {
  const handleRetire = async (id: string) => {
    const agent = agents.find(a => a.id === id);
    if (!agent) return;
    
    if (!window.confirm(`Are you certain you want to retire unit "${agent.name}"? This will terminate all active processes.`)) {
      return;
    }

    setAgents(agents.map(a => a.id === id ? { ...a, status: 'retired' as const } : a));
    try { 
      await updateAgentStatus(id, 'retired'); 
      toast.success(`Agent ${agent.name} retired.`);
    } catch (err) { 
      toast.error('Failed to retire agent.');
      setAgents(agents); 
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-end justify-between border-b border-[#30363d] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight flex items-center gap-3">
            <span className="w-1 h-8 bg-cyan-500 rounded-full"></span>
            FLEET HANGAR
          </h1>
          <p className="text-xs font-mono text-[#8b949e] uppercase tracking-[0.2em]">Agent Lifecycle / Roster Control</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onDeploySpecialist}
            className="px-6 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-black uppercase text-xs tracking-widest rounded-full hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2 group"
          >
            <Zap size={16} className="group-hover:animate-pulse" />
            Deploy Specialist
          </button>
          <button 
            onClick={onConstruct}
            className="px-6 py-2 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2 group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
            Construct Agent
          </button>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} onRetire={handleRetire} missions={missions} />
        ))}
      </div>
    </div>
  );
}

// ============ NODE NETWORK ============

function NodeCard({ node }: { node: Node }) {
  const [metrics, setMetrics] = useState<{ cpu: number; mem: number; freeMemGB?: number; usedMemGB?: number; totalMemGB?: number; topProcesses: any[] } | null>(null);

  useEffect(() => {
    if (node.id !== 'mac-mini-hub') return;
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/system-metrics');
        const data = await res.json();
        setMetrics(data);
      } catch (e) {
        console.error('Failed to fetch metrics:', e);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000); // 15 sec
    return () => clearInterval(interval);
  }, [node.id]);

  const cpuLoad = metrics?.cpu ?? 0;
  const bars = 20;
  const activeBars = Math.max(1, Math.round((cpuLoad / 100) * bars));

  return (
    <div className="group relative p-6 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#484f58] transition-all overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between mb-8">
        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] group-hover:text-cyan-500 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all">
          <Cpu size={24} />
        </div>
        <StatusBadge status={node.status} />
      </div>
      <h4 className="text-white font-black uppercase text-lg mb-1 tracking-tight">{node.name}</h4>
      <p className="text-[10px] font-mono text-[#8b949e] uppercase mb-6">{node.type} • {node.location}</p>
      
      <div className="space-y-6">
        {/* CPU */}
        <div className="space-y-3">
          <div className="flex gap-1 h-1">
            {[...Array(bars)].map((_, i) => (
              <div key={i} className={`flex-1 rounded-full ${node.status === 'online' ? (i < activeBars ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-[#30363d]') : 'bg-white/5'}`}></div>
            ))}
          </div>
          <div className="flex justify-between text-[8px] font-black text-[#484f58] uppercase tracking-widest">
            <span>CPU Load</span>
            <span className="text-cyan-400">{cpuLoad}%</span>
          </div>
        </div>

        {/* Memory */}
        {metrics?.totalMemGB && (
          <div className="space-y-3">
            <div className="flex gap-1 h-1">
              {[...Array(bars)].map((_, i) => (
                <div key={i} className={`flex-1 rounded-full ${node.status === 'online' ? (i < Math.round((metrics.usedMemGB! / metrics.totalMemGB!) * bars) ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-[#30363d]') : 'bg-white/5'}`}></div>
              ))}
            </div>
            <div className="flex justify-between text-[8px] font-black text-[#484f58] uppercase tracking-widest">
              <span>Memory: {metrics.usedMemGB}GB / {metrics.totalMemGB}GB</span>
              <span className="text-amber-400">AVAIL: {metrics.freeMemGB}GB</span>
            </div>
          </div>
        )}

        {metrics?.topProcesses && (
          <div className="space-y-2 pt-4 border-t border-[#30363d]">
            <h5 className="text-[8px] font-black text-[#8b949e] uppercase tracking-widest mb-3 italic">Active Resource Consumers</h5>
            {metrics.topProcesses.slice(0, 3).map((ps, i) => (
              <div key={i} className="flex flex-col gap-1 mb-2">
                <div className="flex justify-between items-center text-[9px] font-mono text-[#c9d1d9]">
                  <span className="truncate max-w-[150px] text-white opacity-80">{ps.name}</span>
                  <div className="flex gap-3">
                    <span className="text-cyan-500/70">{ps.cpu}% CPU</span>
                    <span className="text-amber-500/70">{ps.memMB}MB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Nodes({ nodes = [] }: { nodes: Node[] }) {
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
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nodes.map(node => (
          <NodeCard key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}

// ============ ACTIVITY LOG ============

function ActivityRow({ todo, agents, missions, onToggle }: { todo: Todo; agents: Agent[]; missions: Mission[]; onToggle: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: todo.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const bot = agents?.find(a => a.id === todo.bot_id);
  const mission = missions?.find(m => m.id === todo.mission_id);

  return (
    <tr ref={setNodeRef} style={style} className="group hover:bg-white/[0.02] transition-colors border-b border-[#30363d] last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="text-[#30363d] hover:text-[#8b949e] cursor-grab active:cursor-grabbing"><GripVertical size={14} /></button>
          <span className="text-white font-bold tracking-tight uppercase group-hover:text-cyan-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{todo.task}</span>
        </div>
      </td>
      <td className="px-6 py-4"><span className="text-[10px] font-black uppercase text-[#8b949e] tracking-widest">{mission?.title || 'N/A'}</span></td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {bot ? (<><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div><span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">{bot.name}</span></>) : (<span className="text-[10px] font-black uppercase text-[#484f58] tracking-widest">Unassigned</span>)}
        </div>
      </td>
      <td className="px-6 py-4 text-[10px] font-mono text-[#8b949e]">{new Date(todo.created_at).toLocaleDateString()}</td>
      <td className="px-6 py-4 text-right"><StatusBadge status={todo.status} /></td>
    </tr>
  );
}

function ActivityLog({ todos, setTodos, agents, missions, onNewActivity }: { todos: Todo[]; setTodos: (t: Todo[]) => void; agents: Agent[]; missions: Mission[]; onNewActivity: () => void }) {
  const activeTodos = todos.filter(t => t.status !== 'completed');
  const completedTodos = todos.filter(t => t.status === 'completed');
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-end justify-between border-b border-[#30363d] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight flex items-center gap-3">
            <span className="w-1 h-8 bg-cyan-500 rounded-full"></span>
            ACTIVITY LOG
          </h1>
          <p className="text-xs font-mono text-[#8b949e] uppercase tracking-[0.2em]">Mission Tasks / Agent Activity Stream</p>
        </div>
        <button 
          onClick={onNewActivity}
          className="px-6 py-2 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2 group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          NEW ACTIVITY
        </button>
      </header>

      <div className="rounded-2xl border border-[#30363d] bg-[#161b22] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/20 text-[10px] font-black uppercase text-[#484f58] tracking-widest border-b border-[#30363d]">
              <th className="px-6 py-4">Descriptor</th>
              <th className="px-6 py-4">Mission Source</th>
              <th className="px-6 py-4">Assigned Unit</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4 text-right">State</th>
            </tr>
          </thead>
          <tbody>
            {activeTodos.map(todo => (
              <ActivityRow key={todo.id} todo={todo} agents={agents} missions={missions} onToggle={(id) => {}} />
            ))}
          </tbody>
        </table>
      </div>

       <div className="mt-12 space-y-6">
          <h3 className="text-xs font-black text-[#484f58] uppercase tracking-[0.2em] px-6">Archive / Executed Tasks</h3>
          <div className="rounded-2xl border border-[#30363d] bg-black/20 overflow-hidden grayscale opacity-50">
            <table className="w-full text-left border-collapse">
              <tbody>
                {completedTodos.map(todo => (
                  <tr key={todo.id} className="border-b border-[#30363d] last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-[#484f58] uppercase tracking-tight line-through">{todo.task}</td>
                    <td className="px-6 py-4 text-[10px] font-black uppercase text-[#484f58] tracking-widest">{missions.find(m => m.id === todo.mission_id)?.title || 'N/A'}</td>
                    <td className="px-6 py-4 text-[10px] font-black uppercase text-[#484f58] tracking-widest">{agents.find(a => a.id === todo.bot_id)?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-[10px] font-mono text-[#484f58]">{new Date(todo.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right"><StatusBadge status="completed" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       </div>
    </div>
  );
}

// ============ SIDEBAR ============

function Sidebar({ activeView, setActiveView, user }: { activeView: string; setActiveView: (v: string) => void; user: any }) {
  const nav = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, href: '/' },
    { id: 'missions', label: 'Missions', icon: Target, href: '/?view=missions' },
    { id: 'tracker', label: 'Activity Log', icon: ListTodo, href: '/?view=tracker' },
    { id: 'agents', label: 'Fleet Hangar', icon: Users, href: '/?view=agents' },
    { id: 'nodes', label: 'Node Network', icon: Cpu, href: '/?view=nodes' },
  ];

  const handleNav = (id: string, href: string) => {
    setActiveView(id);
    window.history.pushState({ view: id }, '', href);
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-[#0d1117] border-r border-[#30363d] flex flex-col p-6 z-[80]">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-black">
          <ShieldCheck size={28} strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-sm font-black text-white leading-none uppercase tracking-widest">Jarvis</div>
          <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em] mt-1">OS / CORE-V2</div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2">
        <ul className="space-y-1">
          {nav.map(item => (
            <li key={item.id}>
              <button onClick={() => handleNav(item.id, item.href)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === item.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20' : 'hover:bg-[#161b22] text-[#8b949e] border border-transparent'}`}>
                <item.icon size={16} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto space-y-4">
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
           <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">
             <span>System Load</span>
             <span className="text-cyan-400">0.82ms</span>
           </div>
           <div className="w-full bg-[#30363d] h-1 rounded-full overflow-hidden">
             <div className="bg-cyan-400 h-full w-2/3 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
           </div>
        </div>
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-[#30363d] flex items-center justify-center text-white text-xs font-black">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-tight">{user?.email?.split('@')[0] || 'User'}</div>
            <div className="text-[8px] font-mono text-[#8b949e] uppercase tracking-widest">Commander</div>
          </div>
          <button 
            onClick={() => signOut()} 
            className="ml-auto text-[#8b949e] hover:text-red-400 p-1"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN APP ============

export default function Home() {
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view && ['dashboard', 'view3d', 'tracker', 'missions', 'agents', 'nodes'].includes(view)) return view;
    }
    return 'dashboard';
  };

  const [activeView, setActiveView] = useState(getInitialView);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateMission, setShowCreateMission] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showDeploySpecialist, setShowDeploySpecialist] = useState(false);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [detailMission, setDetailMission] = useState<Mission | null>(null);

  useEffect(() => {
    // Check auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return; // Don't load data if not authenticated

    async function loadData() {
      try {
        const [mData, aData, nData, tData] = await Promise.all([fetchMissions(), fetchAgents(), fetchNodes(), fetchTodos()]);
        setMissions(mData); setAgents(aData); setNodes(nData); setTodos(tData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Database Connection Unavailable.');
      } finally { setLoading(false); }
    }
    loadData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => { refreshData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => { refreshData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nodes' }, () => { refreshData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, () => { refreshData(); })
      .subscribe();

    const interval = setInterval(() => {
      refreshData();
    }, 60000); // 1 minute

    return () => { 
      supabase.removeChannel(channel); 
      clearInterval(interval);
    };
  }, [user]);

  const refreshData = async () => {
    try {
      const [m, a, n, t] = await Promise.all([fetchMissions(), fetchAgents(), fetchNodes(), fetchTodos()]);
      setMissions(m); setAgents(a); setNodes(n); setTodos(t);
    } catch (e) { console.error(e); }
  };

  const handleCreateMission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Basic validation
    const title = formData.get('title') as string;
    if (!title || title.length < 3) {
      toast.error('Mission title must be at least 3 characters.');
      return;
    }

    setIsSaving(true);
    try {
      await createMission({
        title,
        description: formData.get('description') as string,
        priority: formData.get('priority') as any,
        status: 'backlog',
        assigned_agent_id: formData.get('agent_id') as string || null
      });
      toast.success('Mission initiated successfully.');
      setShowCreateMission(false);
      refreshData();
    } catch (err) { 
      console.error(err);
      toast.error('Failed to initiate mission.');
    } finally { setIsSaving(false); }
  };

  const handleConstructAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Basic validation
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const caps = formData.get('caps') as string;

    if (!name || name.length < 2) {
      toast.error('Agent name must be at least 2 characters.');
      return;
    }
    if (!caps || caps.split(',').length < 1) {
      toast.error('At least one capability is required.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Register in Supabase
      const newAgent = await createAgent({
        name,
        role,
        status: 'idle',
        capabilities: caps.split(',').map(s => s.trim()),
        token_burn_24h: 0
      });

      // 2. Deploy via OpenClaw CLI (via our internal API)
      const tgToken = formData.get('tg_token') as string;
      if (tgToken) {
        toast('Deploying to OpenClaw...', { icon: '🚀' });
        const deployRes = await fetch('/api/agents/deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            agentId: newAgent.id, 
            name, 
            tgToken 
          }),
        });
        
        if (!deployRes.ok) {
          const errorData = await deployRes.json();
          throw new Error(errorData.message || 'Deployment failed');
        }
        toast.success('Agent deployed and bound to Telegram.');
      } else {
        toast.success('Agent registered (no Telegram bind).');
      }

      setShowCreateAgent(false);
      refreshData();
    } catch (err: any) { 
      console.error(err);
      toast.error(`Error: ${err.message || 'Action failed'}`);
    } finally { setIsSaving(false); }
  };

  const handleNewActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Basic validation
    const task = formData.get('task') as string;
    if (!task || task.length < 3) {
      toast.error('Task must be at least 3 characters.');
      return;
    }

    setIsSaving(true);
    try {
      await createTodo({
        task,
        mission_id: formData.get('mission_id') as string || null,
        bot_id: formData.get('bot_id') as string || null,
        status: 'pending'
      });
      toast.success('Activity logged.');
      setShowCreateActivity(false);
      refreshData();
    } catch (err) { 
      console.error(err);
      toast.error('Failed to log activity.');
    } finally { setIsSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest">Initializing Core...</p>
      </div>
    </div>
  );

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#1f6feb]">
      <Toaster 
        toastOptions={{
          style: {
            background: '#161b22',
            color: '#fff',
            border: '1px solid #30363d',
            fontSize: '12px',
            fontFamily: 'monospace',
          },
        }} 
      />
      <Sidebar activeView={activeView} setActiveView={setActiveView} user={user} />
      
      <main className="pt-8 pb-32">
        {activeView === 'dashboard' && <Dashboard agents={agents} missions={missions} nodes={nodes} todos={todos} />}
        {activeView === 'missions' && (
          <Missions 
            missions={missions} 
            setMissions={setMissions} 
            agents={agents} 
            onInitiate={() => setShowCreateMission(true)} 
            onDrillDown={setDetailMission}
            refreshData={refreshData}
          />
        )}
        {activeView === 'agents' && (
          <Agents 
            agents={agents} 
            setAgents={setAgents} 
            missions={missions} 
            onConstruct={() => setShowCreateAgent(true)} 
            onDeploySpecialist={() => setShowDeploySpecialist(true)}
          />
        )}
        {activeView === 'nodes' && <Nodes nodes={nodes} />}
        {activeView === 'tracker' && <ActivityLog todos={todos} setTodos={setTodos} agents={agents} missions={missions} onNewActivity={() => setShowCreateActivity(true)} />}
      </main>

      {/* MODALS */}
      <Modal isOpen={showCreateMission} onClose={() => setShowCreateMission(false)} title="Initiate New Mission">
        <form onSubmit={handleCreateMission} className="space-y-4">
          <input name="title" required minLength={3} maxLength={100} placeholder="PROTOCOL IDENTIFIER (min 3 chars)" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm font-mono focus:border-cyan-500 transition-all" />
          <textarea name="description" required minLength={10} maxLength={500} placeholder="Mission objective and operational parameters... (min 10 chars)" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm font-mono h-24 focus:border-cyan-500 transition-all" />
          <select name="priority" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm font-mono">
            <option value="low">LOW PRIORITY</option>
            <option value="medium">MEDIUM</option>
            <option value="high">HIGH</option>
            <option value="critical">CRITICAL</option>
          </select>
          <select name="agent_id" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm font-mono">
            <option value="">UNASSIGNED</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
          </select>
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-cyan-500 text-black font-black uppercase text-xs py-3 rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isSaving ? 'Processing...' : 'Engage'}
          </button>
        </form>
      </Modal>

      <SpecialistDeployModal 
        isOpen={showDeploySpecialist} 
        onClose={() => setShowDeploySpecialist(false)}
        onDeploy={() => refreshData()}
      />

      <Modal isOpen={showCreateAgent} onClose={() => setShowCreateAgent(false)} title="Construct New Agent Entity">
        <form onSubmit={handleConstructAgent} className="space-y-4">
          <input name="name" required minLength={2} maxLength={50} placeholder="UNIT NAME (min 2 chars)" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm font-mono focus:border-cyan-500 transition-all" />
          <input name="role" required minLength={2} maxLength={100} placeholder="OPERATIONAL ROLE (e.g. Scraper, Oracle)" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm font-mono focus:border-cyan-500 transition-all" />
          <input name="tg_token" type="password" placeholder="TELEGRAM BOT TOKEN (REQUIRED FOR BIND)" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm font-mono focus:border-cyan-500 transition-all" />
          <input name="caps" required pattern=".*\w+.*" placeholder="CAPABILITIES (comma separated, min 1)" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm font-mono focus:border-cyan-500 transition-all" />
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-cyan-500 text-black font-black uppercase text-xs py-3 rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isSaving ? 'Processing...' : 'Initialize Unit'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={showCreateActivity} onClose={() => setShowCreateActivity(false)} title="Registry Update: New Activity">
        <form onSubmit={handleNewActivity} className="space-y-4">
          <input name="task" required minLength={3} maxLength={200} placeholder="TASK DESCRIPTOR (min 3 chars)" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm font-mono focus:border-cyan-500 transition-all" />
          <select name="mission_id" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm font-mono">
            <option value="">NO MISSION SOURCE</option>
            {missions.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <select name="bot_id" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm font-mono">
            <option value="">UNASSIGNED UNIT</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-cyan-500 text-black font-black uppercase text-xs py-3 rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isSaving ? 'Processing...' : 'Commit to Log'}
          </button>
        </form>
      </Modal>

      {/* Mission Drilldown Drawer */}
      {detailMission && (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-[#0d1117] border-l border-[#30363d] z-[90] shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
          <header className="p-8 border-b border-[#30363d] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={detailMission.status} />
                <PriorityBadge priority={detailMission.priority} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">{detailMission.title}</h2>
            </div>
            <button onClick={() => setDetailMission(null)} className="text-[#8b949e] hover:text-white p-2 hover:bg-[#161b22] rounded-lg transition-all"><X size={20} /></button>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            <section>
              <h3 className="text-[10px] font-black uppercase text-[#484f58] tracking-[0.2em] mb-4">Core Objective</h3>
              <p className="text-sm text-[#8b949e] font-mono leading-relaxed">{detailMission.description}</p>
            </section>

            <section>
              <h3 className="text-[10px] font-black uppercase text-[#484f58] tracking-[0.2em] mb-4">Operational Unit</h3>
              {detailMission.assigned_agent_id ? (
                <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-cyan-400 border border-[#30363d]">
                    <Bot size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white uppercase tracking-wider">{agents.find(a => a.id === detailMission.assigned_agent_id)?.name}</div>
                    <div className="text-[10px] font-mono text-cyan-500/50 uppercase">Active Assignment</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[#30363d] text-center text-[10px] font-black text-[#484f58] uppercase tracking-widest">No Unit Bound</div>
              )}
            </section>

            <section>
              <h3 className="text-[10px] font-black uppercase text-[#484f58] tracking-[0.2em] mb-4">Strategy & Action Plans</h3>
              <div className="space-y-3">
                {detailMission.action_plans?.map(plan => (
                  <div key={plan.id} className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[10px] font-black text-white uppercase tracking-widest">Plan-v{plan.id.slice(0,4)}</div>
                      <StatusBadge status={plan.status} />
                    </div>
                    <p className="text-xs text-[#8b949e] mb-4">{plan.description}</p>
                    <div className="space-y-2">
                      {plan.steps.map((step, i) => (
                        <div key={i} className="flex gap-3 text-[10px] font-mono">
                          <span className="text-cyan-500">{i+1}.</span>
                          <span className="text-[#c9d1d9]">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black uppercase text-[#484f58] tracking-[0.2em] mb-4">Activity Stream</h3>
              <div className="space-y-4">
                {todos.filter(t => t.mission_id === detailMission.id).map(todo => (
                  <div key={todo.id} className="flex gap-4">
                    {todo.status === 'completed' ? <CheckCircle2 size={14} className="text-green-500" /> : <Clock size={14} className="text-[#30363d]" />}
                    <div className="flex-1">
                      <p className={`text-xs ${todo.status === 'completed' ? 'text-[#484f58] line-through' : 'text-[#c9d1d9]'}`}>{todo.task}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <footer className="p-8 border-t border-[#30363d] bg-black/20 flex gap-4">
            <button 
              onClick={() => detailMission.status !== 'completed' && window.confirm('Engage strategy for this mission?')}
              className="flex-1 px-4 py-3 bg-cyan-500 text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-lg hover:bg-white transition-all disabled:opacity-50"
            >
              Engage Strategy
            </button>
            <button 
              onClick={() => { if (window.confirm('Abort mission? This cannot be undone.')) setDetailMission(null); }}
              className="px-4 py-3 border border-[#30363d] text-[#8b949e] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-[#161b22] hover:text-white transition-all"
            >
              Abort
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}
