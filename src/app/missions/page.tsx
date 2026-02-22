export default function MissionsPage() {
  const missions = [
    { 
      id: 1, 
      title: "Launch v2.0 Platform", 
      status: "active", 
      progress: 65,
      due: "2026-03-15",
      tasks: { total: 24, done: 16 }
    },
    { 
      id: 2, 
      title: "Migrate Database to PostgreSQL", 
      status: "planning", 
      progress: 20,
      due: "2026-04-01",
      tasks: { total: 12, done: 2 }
    },
    { 
      id: 3, 
      title: "Hire Senior Dev Team", 
      status: "active", 
      progress: 45,
      due: "2026-03-30",
      tasks: { total: 8, done: 4 }
    },
  ];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'active': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'planning': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Missions</h1>
          <p className="text-gray-500 mt-1">Strategic initiatives and campaigns</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-medium transition-all shadow-lg shadow-cyan-600/20">
          🚀 Create Mission
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {missions.map((mission) => (
          <div key={mission.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-cyan-500/30 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <span className={`text-xs px-3 py-1 rounded-full border ${getStatusStyle(mission.status)}`}>
                ● {mission.status.toUpperCase()}
              </span>
              <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                ⋮
              </button>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{mission.title}</h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>📅 Due {mission.due}</span>
              <span>✅ {mission.tasks.done}/{mission.tasks.total} tasks</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-cyan-400 font-medium">{mission.progress}%</span>
              </div>
              <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${mission.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
