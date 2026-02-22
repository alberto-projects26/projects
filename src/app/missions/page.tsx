'use client';

import { useState, useMemo } from 'react';

interface SubTask {
  id: string;
  title: string;
  status: 'todo' | 'done';
}

interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  targetDate: string;
  subTasks: SubTask[];
  owner: string;
  tags: string[];
  costEstimate?: number;
  costActual?: number;
}

const initialMissions: Mission[] = [
  {
    id: 'm-001',
    title: 'Mission Control Launch',
    description: 'Build and deploy the v1.0 Mission Control dashboard for managing AI agents and tasks',
    status: 'active',
    priority: 'critical',
    startDate: '2026-02-20',
    targetDate: '2026-02-28',
    owner: 'jarvis',
    tags: ['internal', 'dashboard', 'v1.0'],
    costEstimate: 500,
    costActual: 234,
    subTasks: [
      { id: 'st-1', title: 'Design system architecture', status: 'done' },
      { id: 'st-2', title: 'Build sidebar navigation', status: 'done' },
      { id: 'st-3', title: 'Create agent management view', status: 'done' },
      { id: 'st-4', title: 'Implement task kanban board', status: 'done' },
      { id: 'st-5', title: 'Add mission progress tracking', status: 'in-progress' },
      { id: 'st-6', title: 'Hardware node integration', status: 'todo' },
    ]
  },
  {
    id: 'm-002',
    title: 'Launch v2.0 Platform',
    description: 'Major platform upgrade with multi-node orchestration and real-time collaboration',
    status: 'planning',
    priority: 'high',
    startDate: '2026-03-01',
    targetDate: '2026-04-15',
    owner: 'human',
    tags: ['platform', 'v2.0', 'multi-node'],
    costEstimate: 5000,
    subTasks: [
      { id: 'st-7', title: 'Define v2.0 requirements', status: 'done' },
      { id: 'st-8', title: 'Architecture review', status: 'in-progress' },
      { id: 'st-9', title: 'Multi-node protocol design', status: 'todo' },
      { id: 'st-10', title: 'Real-time sync implementation', status: 'todo' },
    ]
  },
  {
    id: 'm-003',
    title: 'Cost Optimization Audit',
    description: 'Analyze and optimize API costs across all agents and providers',
    status: 'active',
    priority: 'medium',
    startDate: '2026-02-18',
    targetDate: '2026-02-25',
    owner: 'research-bot',
    tags: ['cost', 'audit', 'optimization'],
    costEstimate: 200,
    costActual: 89,
    subTasks: [
      { id: 'st-11', title: 'Collect usage data', status: 'done' },
      { id: 'st-12', title: 'Analyze provider costs', status: 'done' },
      { id: 'st-13', title: 'Identify optimization opportunities', status: 'in-progress' },
      { id: 'st-14', title: 'Implement cost controls', status: 'todo' },
    ]
  }
];

const statusConfig = {
  'planning': { label: 'Planning', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  'active': { label: 'Active', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  'completed': { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  'archived': { label: 'Archived', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
};

const priorityConfig = {
  'low': { color: 'text-blue-400', bg: 'bg-blue-500/10' },
  'medium': { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  'high': { color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'critical': { color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [expandedMission, setExpandedMission] = useState<string | null>('m-001');
  const [showNewMission, setShowNewMission] = useState(false);

  const calculateProgress = (subTasks: SubTask[]) => {
    if (subTasks.length === 0) return 0;
    const done = subTasks.filter(t => t.status === 'done').length;
    return Math.round((done / subTasks.length) * 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const stats = useMemo(() => {
    const total = missions.length;
    const active = missions.filter(m => m.status === 'active').length;
    const completed = missions.filter(m => m.status === 'completed').length;
    const avgProgress = Math.round(missions.reduce((sum, m) => sum + calculateProgress(m.subTasks), 0) / missions.length);
    const totalBudget = missions.reduce((sum, m) => sum + (m.costEstimate || 0), 0);
    const totalSpent = missions.reduce((sum, m) => sum + (m.costActual || 0), 0);
    return { total, active, completed, avgProgress, totalBudget, totalSpent };
  }, [missions]);

  const toggleSubTask = (missionId: string, subTaskId: string) => {
    setMissions(prev => prev.map(mission => {
      if (mission.id !== missionId) return mission;
      return {
        ...mission,
        subTasks: mission.subTasks.map(st => 
          st.id === subTaskId ? { ...st, status: st.status === 'done' ? 'todo' : 'done' } : st
        )
      };
    }));
  };

  const [newMission, setNewMission] = useState({ title: '', description: '', priority: 'medium' as Mission['priority'] });

  const addMission = () => {
    if (!newMission.title.trim()) return;
    const mission: Mission = {
      id: `m-${Date.now()}`,
      title: newMission.title,
      description: newMission.description,
      status: 'planning',
      priority: newMission.priority,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner: 'jarvis',
      tags: [],
      subTasks: [
        { id: `st-${Date.now()}-1`, title: 'Define mission objectives', status: 'todo' },
        { id: `st-${Date.now()}-2`, title: 'Create sub-tasks', status: 'todo' },
      ]
    };
    setMissions([...missions, mission]);
    setShowNewMission(false);
    setNewMission({ title: '', description: '', priority: 'medium' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Missions</h1>
          <p className="text-gray-500 mt-1">Strategic campaigns with measurable progress</p>
        </div>
        <button 
          onClick={() => setShowNewMission(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition-all shadow-lg shadow-cyan-600/20"
        >
          + Create Mission
        </button>
      </div>

      {/* Mission Stats */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-cyan-400">{stats.active}</div>
        </div>
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500">Completed</div>
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
        </div>
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500">Avg Progress</div>
          <div className="text-2xl font-bold text-white">{stats.avgProgress}%</div>
        </div>
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500">Budget</div>
          <div className="text-2xl font-bold text-white">${stats.totalBudget}</div>
        </div>
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500">Spent</div>
          <div className="text-2xl font-bold text-purple-400">${stats.totalSpent}</div>
        </div>
      </div>

      {/* Mission Cards */}
      <div className="space-y-4">
        {missions.map(mission => {
          const progress = calculateProgress(mission.subTasks);
          const daysLeft = getDaysRemaining(mission.targetDate);
          const isExpanded = expandedMission === mission.id;
          const status = statusConfig[mission.status];
          const priority = priorityConfig[mission.priority];

          return (
            <div key={mission.id} className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden hover:border-gray-600 transition-colors">
              {/* Mission Header */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => setExpandedMission(isExpanded ? null : mission.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${priority.bg} flex items-center justify-center`}>
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{mission.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{mission.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs border ${status.bg} ${status.color} ${status.border}`}>
                      {status.label}
                    </span>
                    <button className="text-gray-500 hover:text-white transition-colors">
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <div className="text-sm text-gray-400">{mission.subTasks.filter(t => t.status === 'done').length}/{mission.subTasks.length} tasks</div>
                    <div className={`text-xs ${daysLeft < 7 ? 'text-red-400' : 'text-gray-500'}`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                    </div>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                  <span>👤 {mission.owner}</span>
                  <span>📅 {mission.startDate} → {mission.targetDate}</span>
                  {mission.costActual && (
                    <span>
                      💰 ${mission.costActual} {mission.costEstimate && `/ $${mission.costEstimate}`}
                    </span>
                  )}
                  <div className="flex gap-2">
                    {mission.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-[#21262d] rounded text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expanded Sub-Tasks */}
              {isExpanded && (
                <div className="border-t border-[#30363d] px-6 pb-6">
                  <h4 className="font-medium text-white mb-4 mt-4">Sub-Tasks</h4>
                  <div className="space-y-2">
                    {mission.subTasks.map(subTask => (
                      <div 
                        key={subTask.id}
                        className="flex items-center gap-3 p-3 bg-[#0d1117] rounded-lg border border-[#30363d] hover:border-gray-500 transition-colors cursor-pointer"
                        onClick={() => toggleSubTask(mission.id, subTask.id)}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          subTask.status === 'done' 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-500 hover:border-cyan-500'
                        }`}>
                          {subTask.status === 'done' && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className={`flex-1 ${subTask.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                          {subTask.title}
                        </span>
                        <span className={`text-xs ${subTask.status === 'done' ? 'text-green-400' : 'text-gray-500'}`}>
                          {subTask.status === 'done' ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-cyan-400 border border-dashed border-[#30363d] rounded-lg hover:border-cyan-500/30 transition-colors">
                    + Add sub-task
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Mission Modal */}
      {showNewMission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create New Mission</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mission Title</label>
                <input 
                  type="text"
                  value={newMission.title}
                  onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="What are we accomplishing?"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea 
                  value={newMission.description}
                  onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white focus:border-cyan-500 focus:outline-none resize-none h-24"
                  placeholder="Describe the mission objectives..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high', 'critical'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewMission({ ...newMission, priority: p })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                        newMission.priority === p 
                          ? 'bg-cyan-600 text-white' 
                          : 'bg-[#21262d] text-gray-400 hover:bg-[#30363d]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowNewMission(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={addMission}
                className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                Create Mission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
