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
}

const initialTasks: Task[] = [
  { id: 't-001', title: 'Implement WebSocket gateway', status: 'in-progress', priority: 'high', mission: 'Mission Control v1', assignee: 'jarvis', due: '2026-02-22', tags: ['backend', 'websocket'], requiresApproval: false },
  { id: 't-002', title: 'Design agent dashboard UI', status: 'done', priority: 'medium', mission: 'Mission Control v1', assignee: 'human', due: '2026-02-21', tags: ['ui', 'design'], requiresApproval: false },
  { id: 't-003', title: 'Deploy to production cluster', status: 'review', priority: 'critical', mission: 'Launch v2.0', assignee: 'jarvis', due: '2026-02-23', tags: ['deploy', 'infrastructure'], requiresApproval: true, approved: false },
  { id: 't-004', title: 'Review cost optimization report', status: 'todo', priority: 'medium', mission: 'Cost Audit', assignee: 'research-bot', due: '2026-02-24', tags: ['analytics'], requiresApproval: false },
  { id: 't-005', title: 'Update API documentation', status: 'todo', priority: 'low', mission: 'Mission Control v1', assignee: 'code-reviewer', due: '2026-02-25', tags: ['docs'], requiresApproval: false },
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
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

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
    const pendingApproval = tasks.filter(t => t.requiresApproval && !t.approved && t.status === 'review').length;
    return { total, done, inProgress, pendingApproval, progress: Math.round((done / total) * 100) };
  }, [tasks]);

  const moveTaskStatus = (id: string, direction: 'forward' | 'backward') => {
    const statusOrder: Task['status'][] = ['todo', 'in-progress', 'review', 'done'];
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      const idx = statusOrder.indexOf(task.status);
      if (direction === 'forward' && idx < statusOrder.length - 1) {
        const newStatus = statusOrder[idx + 1];
        // Block if requires approval and moving to done
        if (newStatus === 'done' && task.requiresApproval && !task.approved) {
          return { ...task, status: 'review' };
        }
        return { ...task, status: newStatus };
      }
      if (direction === 'backward' && idx > 0) {
        return { ...task, status: statusOrder[idx - 1] };
      }
      return task;
    }));
  };

  const approveTask = (id: string) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, approved: true } : task));
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
      requiresApproval: newTask.priority === 'critical',
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
          <p className="text-gray-500 mt-1">Mission-critical work items with human-in-the-loop approval</p>
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
              <div className="text-sm text-gray-500">Total Tasks</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Done</div>
              <div className="text-2xl font-bold text-green-400">{stats.done}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">In Progress</div>
              <div className="text-2xl font-bold text-cyan-400">{stats.inProgress}</div>
            </div>
            {stats.pendingApproval > 0 && (
              <div>
                <div className="text-sm text-gray-500">Pending Approval</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.pendingApproval}</div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Overall Progress</div>
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

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-sm text-white"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Mission:</span>
          <select 
            value={filterMission}
            onChange={(e) => setFilterMission(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-sm text-white"
          >
            <option value="all">All Missions</option>
            {missions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {(['todo', 'in-progress', 'review', 'done'] as const).map(status => {
          const columnTasks = filteredTasks.filter(t => t.status === status);
          const config = statusConfig[status];
          return (
            <div key={status} className="bg-[#161b22] border border-[#30363d] rounded-xl">
              <div className={`px-4 py-3 border-b border-[#30363d] flex items-center justify-between ${config.bg}`}>
                <span className={`font-medium ${config.color}`}>{config.label}</span>
                <span className="text-xs text-gray-400 bg-[#0d1117] px-2 py-1 rounded">{columnTasks.length}</span>
              </div>
              <div className="p-3 space-y-3 min-h-[200px]">
                {columnTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-gray-500 transition-colors cursor-pointer"
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${priorityConfig[task.priority].dot}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">{task.title}</h4>
                        {task.mission && (
                          <div className="text-xs text-cyan-400 mt-1">🎯 {task.mission}</div>
                        )}
                      </div>
                    </div>

                    {task.requiresApproval && task.status === 'review' && !task.approved && (
                      <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="text-xs text-yellow-400 mb-2">⚠️ Requires your approval</div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); approveTask(task.id); }}
                          className="w-full py-1.5 text-xs bg-yellow-600 hover:bg-yellow-500 text-white rounded transition-colors"
                        >
                          Approve Completion
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#21262d] rounded">{task.assignee}</span>
                        <span>📅 {task.due}</span>
                      </div>
                    </div>

                    {expandedTask === task.id && (
                      <div className="mt-4 pt-4 border-t border-[#30363d]">
                        <div className="flex items-center gap-2 mb-3">
                          {task.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 bg-[#21262d] rounded text-gray-400">{tag}</span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {status !== 'todo' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); moveTaskStatus(task.id, 'backward'); }}
                              className="px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] text-gray-300 rounded transition-colors"
                            >
                              ← Move Back
                            </button>
                          )}
                          {status !== 'done' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); moveTaskStatus(task.id, 'forward'); }}
                              className="flex-1 px-3 py-1.5 text-xs bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded transition-colors"
                            >
                              Move Forward →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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
