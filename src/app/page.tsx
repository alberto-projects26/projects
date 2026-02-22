export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome back, Commander. Here's your overview.</p>
        </div>
        <div className="flex items-center gap-3">
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
          { label: "Active Missions", value: "4", change: "+1 this week", color: "from-cyan-500 to-blue-500", icon: "🎯" },
          { label: "Tasks Today", value: "12", change: "5 remaining", color: "from-green-500 to-emerald-500", icon: "✅" },
          { label: "AI Agents Online", value: "3", change: "All systems nominal", color: "from-purple-500 to-pink-500", icon: "🤖" },
          { label: "Success Rate", value: "94%", change: "+2% this month", color: "from-orange-500 to-red-500", icon: "📈" },
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
              { action: "Agent deployed", item: "Documentation bot", time: "3 hours ago", type: "info" },
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

        {/* Quick Tasks */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl">
          <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
            <h3 className="font-semibold text-white">Quick Tasks</h3>
            <button className="text-sm text-cyan-400 hover:text-cyan-300">Manage</button>
          </div>
          <div className="p-4 space-y-2">
            {[
              { title: "Review code changes", done: false },
              { title: "Update mission timeline", done: false },
              { title: "Team sync notes", done: true },
              { title: "Deploy staging build", done: false },
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#21262d] transition-colors">
                <input 
                  type="checkbox" 
                  defaultChecked={task.done}
                  className="rounded bg-[#21262d] border-[#30363d] text-cyan-500 focus:ring-cyan-500"
                />
                <span className={`text-sm ${task.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                  {task.title}
                </span>
              </div>
            ))}
            <button className="w-full py-3 text-sm text-gray-500 hover:text-cyan-400 border border-dashed border-[#30363d] rounded-lg hover:border-cyan-500/30 transition-colors">
              + Add a task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
