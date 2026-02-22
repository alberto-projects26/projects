export default function TasksPage() {
  const tasks = [
    { id: 1, title: "Review PR #247", status: "in-progress", priority: "high", tags: ["dev", "urgent"] },
    { id: 2, title: "Update documentation", status: "todo", priority: "medium", tags: ["docs"] },
    { id: 3, title: "Fix navigation bug", status: "done", priority: "high", tags: ["bug", "ui"] },
    { id: 4, title: "Team standup notes", status: "todo", priority: "low", tags: ["meeting"] },
  ];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'done': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage your daily work and todos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#21262d] border border-[#30363d]">
            <span className="text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="bg-transparent border-none outline-none text-sm text-gray-300 w-64"
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors">
            ➕ Add Task
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "To Do", count: 12, color: "text-gray-400" },
          { label: "In Progress", count: 5, color: "text-yellow-400" },
          { label: "Done", count: 23, color: "text-green-400" },
          { label: "Total", count: 40, color: "text-cyan-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tasks List */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center gap-4">
          <input type="checkbox" className="rounded bg-[#21262d] border-[#30363d]" />
          <span className="text-sm font-medium text-gray-400">Select all</span>
          <div className="flex-1"></div>
          <button className="text-sm text-gray-500 hover:text-gray-300">Filter ▼</button>
        </div>

        <div className="divide-y divide-[#30363d]">
          {tasks.map((task) => (
            <div key={task.id} className="px-6 py-4 hover:bg-[#21262d]/50 transition-colors group flex items-center gap-4">
              <input type="checkbox" className="rounded bg-[#21262d] border-[#30363d]" />
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{task.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusStyle(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {task.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded bg-[#21262d] text-gray-400 border border-[#30363d]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`text-sm font-medium ${getPriorityStyle(task.priority)}`}>
                {task.priority.toUpperCase()}
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                <button className="p-2 rounded hover:bg-[#30363d] text-gray-400">✏️</button>
                <button className="p-2 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400">🗑️</button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-[#30363d] text-center">
          <button className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">
            + Add a new task
          </button>
        </div>
      </div>
    </div>
  );
}
</parameter name="content"></parameter>