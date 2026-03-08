'use client';

import { useState, useMemo } from 'react';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  mission?: string;
  assignee: 'human' | 'jarvis' | 'research-bot' | 'code-reviewer';
  due: string;
  tags: string[];
  requiresApproval: boolean;
  approved?: boolean;
  plan?: string;
  planApproved?: boolean;
}

const initialTasks: Task[] = [
  { id: 't-001', title: 'Implement WebSocket gateway', status: 'in-progress', priority: 'high', mission: 'Mission Control v1', assignee: 'jarvis', due: '2026-02-22', tags: ['backend', 'websocket'], requiresApproval: true, plan: '1. Setup socket server\n2. Design messaging protocol\n3. Integrated with dashboard', planApproved: true },
  { id: 't-002', title: 'Design agent dashboard UI', status: 'done', priority: 'medium', mission: 'Mission Control v1', assignee: 'human', due: '2026-02-21', tags: ['ui', 'design'], requiresApproval: false },
  { id: 't-003', title: 'Deploy to production cluster', status: 'review', priority: 'critical', mission: 'Launch v2.0', assignee: 'jarvis', due: '2026-02-23', tags: ['deploy', 'infrastructure'], requiresApproval: true, approved: false },
  { id: 't-004', title: 'Review cost optimization report', status: 'todo', priority: 'medium', mission: 'Cost Audit', assignee: 'research-bot', due: '2026-02-24', tags: ['analytics'], requiresApproval: false },
];

const statusConfig = {
  'todo': { label: 'To Do', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  'in-progress': { label: 'In Progress', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  'review': { label: 'Review', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  'done': { label: 'Done', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
};

const priorityConfig = {
  'low': { color: 'text-blue-400', dot: 'bg-blue-400' },
  'medium': { color: 'text-yellow-400', dot: 'bg-yellow-400' },
  'high': { color: 'text-orange-400', dot: 'bg-orange-400' },
  'critical': { color: 'text-red-400', dot: 'bg-red-400' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMission, setFilterMission] = useState<string>('all');
  const [showNewTask, setShowNewTask] = useState(false);
  const [ expandedTask, setExpandedTask] = useState<string | null>(null);
  const [viewingPlan, setViewingPlan] = useState<Task | null>(null);

  const missions = useMemo(() => [...new Set(tasks.filter(t => t.mission).map(t => t.mission!))], [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterMission !== 'all' && task.mission !== filterMission) return false;
      return true;
    }).sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }, [tasks, filterStatus, filterMission]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pendingApproval = tasks.filter(t => (t.requiresApproval && !t.approved && t.status === 'review') || (t.status === 'in-progress' && t.plan && !t.planApproved)).length;
    return { total, done, inProgress, pendingApproval, progress: Math.round((done / total) * 100) };
  }, [tasks]);

  const startTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      return { 
        ...task, 
        status: 'in-progress', 
        plan: `Task Analysis: Review requirements and codebase\nPhase 1: Setup dependencies and core module\nPhase 2: Implement main functionality with tests\nPhase 3: Integration and final validation`, 
        planApproved: false 
      };
    }));
  };

  const approvePlan = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      return { ...task, planApproved: true };
    }));
  };

  const completeTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      return { ...task, status: 'review' };
    }));
  };

  const approveSuccess = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      return { ...task, status: 'done', approved: true };
    }));
  };

  const [newTask, setNewTask] = useState({ title: '', mission: '', priority: 'medium' as Task['priority'] });

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: `t-${Date.now()}`,
      title: newTask.title,
      status: 'todo',
      priority: newTask.priority,
      mission: newTask.mission || undefined,
      assignee: 'jarvis',
      due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: [],
      requiresApproval: true,
    };
    setTasks([...tasks, task]);
    setShowNewTask(false);
    setNewTask({ title: '', mission: '', priority: 'medium' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-gray-500 mt-1">Human-in-the-Loop Execution Engine</p>
        </div>
        <button 
          onClick={() => setShowNewTask(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition-all shadow-lg shadow-cyan-600/20"
        >
          + New Task
        </button>
      </div>

      {/* Stats Row with Progress */}
      <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">In Progress</div>
              <div className="text-2xl font-bold text-cyan-400">{stats.inProgress}</div>
            </div>
            {stats.pendingApproval > 0 && (
              <div>
                <div className="text-sm text-gray-500">Gated / Pending</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.pendingApproval}</div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Success Rate</div>
            <div className="text-3xl font-bold text-white">{stats.progress}%</div>
          </div>
        </div>
        <div className="h-3 bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {(['todo', 'in-progress', 'review', 'done'] as const).map(status => {
          const columnTasks = filteredTasks.filter(t => t.status === status);
          const config = statusConfig[status];
          return (
            <div key={status} className="bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col min-h-[600px]">
              <div className={`px-4 py-3 border-b border-[#30363d] flex items-center justify-between ${config.bg}`}>
                <span className={`font-bold text-xs uppercase tracking-widest ${config.color}`}>{config.label}</span>
                <span className="text-xs text-gray-400 bg-[#0d1117] px-2 py-1 rounded">{columnTasks.length}</span>
              </div>
              
              <div className="p-3 space-y-3 flex-1">
                {columnTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`bg-[#0d1117] border rounded-xl overflow-hidden transition-all ${
                      expandedTask === task.id ? 'border-cyan-500 ring-1 ring-cyan-500/20 shadow-xl' : 'border-[#30363d] hover:border-gray-600'
                    }`}
                  >
                    <div className="p-4 cursor-pointer" onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}>
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${priorityConfig[task.priority].dot}`} />
                        <h4 className="font-semibold text-white text-sm leading-tight flex-1">{task.title}</h4>
                      </div>
                      
                      {task.mission && (
                        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-3">🎯 {task.mission}</div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                        <span className="bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d]">{task.assignee}</span>
                        <span>{task.due}</span>
                      </div>
                    </div>

                    {/* Action Layer */}
                    <div className="bg-[#161b22]/50 border-t border-[#30363d] p-3">
                      {task.status === 'todo' && (
                        <button 
                          onClick={() => startTask(task.id)}
                          className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-600/10 active:scale-[0.98] transition-all"
                        >
                          ⚡ START EXECUTION
                        </button>
                      )}

                      {task.status === 'in-progress' && !task.planApproved && (
                        <div className="space-y-3">
                          <div 
                            onClick={() => setViewingPlan(task)}
                            className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-[11px] cursor-pointer hover:bg-yellow-500/20 transition-colors"
                          >
                            <p className="text-yellow-400 font-bold mb-1">📋 PROPOSED PLAN:</p>
                            <p className="text-gray-400 italic line-clamp-2">{task.plan}</p>
                            <p className="text-[9px] text-yellow-500/60 mt-1 uppercase tracking-wide">Click to view full plan →</p>
                          </div>
                          <button 
                            onClick={() => approvePlan(task.id)}
                            className="w-full py-2 bg-yellow-600 text-white text-xs font-bold rounded-lg"
                          >
                            ✅ APPROVE PLAN
                          </button>
                        </div>
                      )}

                      {task.status === 'in-progress' && task.planApproved && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[10px] text-green-400 font-bold uppercase mb-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Implementing...
                          </div>
                          <button 
                            onClick={() => completeTask(task.id)}
                            className="w-full py-2 bg-[#21262d] border border-[#30363d] text-cyan-400 text-xs font-bold rounded-lg"
                          >
                            🏁 SUBMIT FOR REVIEW
                          </button>
                        </div>
                      )}

                      {task.status === 'review' && (
                        <div className="space-y-3">
                          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded text-[11px] text-gray-300">
                            Build complete. Waiting for user verification.
                          </div>
                          <button 
                            onClick={() => approveSuccess(task.id)}
                            className="w-full py-2 bg-green-600 text-white text-xs font-bold rounded-lg"
                          >
                            🚀 SHIP TO PRODUCTION
                          </button>
                        </div>
                      )}

                      {task.status === 'done' && (
                        <div className="flex items-center justify-center py-1 text-[10px] text-green-500 font-bold uppercase">
                          ✅ Verified & Logged
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan View Modal */}
      {viewingPlan && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setViewingPlan(null)}
        >
          <div 
            className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 w-full max-w-2xl m-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Execution Plan</h2>
                <p className="text-gray-500 text-sm mt-1">{viewingPlan.title}</p>
              </div>
              <button 
                onClick={() => setViewingPlan(null)}
                className="text-gray-500 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {viewingPlan.plan}
              </pre>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {
                  approvePlan(viewingPlan.id);
                  setViewingPlan(null);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-xl shadow-lg"
              >
                ✅ APPROVE THIS PLAN
              </button>
              <button 
                onClick={() => setViewingPlan(null)}
                className="px-6 py-3 bg-[#21262d] text-gray-400 rounded-xl hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create New Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Task Title</label>
                <input 
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="What needs to be done?"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mission</label>
                <input 
                  type="text"
                  value={newTask.mission}
                  onChange={(e) => setNewTask({ ...newTask, mission: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="Link to a mission (optional)"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high', 'critical'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                        newTask.priority === p 
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
                onClick={() => setShowNewTask(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={addTask}
                className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
