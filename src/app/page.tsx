export default function Home() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-800 pb-8">
        <h1 className="text-4xl font-bold mb-3 text-white">Dashboard</h1>
        <p className="text-gray-400 text-lg">Welcome to Mission Control. All systems operational.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              🚀
            </div>
            <h3 className="font-semibold text-lg">Active Missions</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-2">12</div>
          <p className="text-sm text-gray-400">3 awaiting your approval</p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              🤖
            </div>
            <h3 className="font-semibold text-lg">AI Agents</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-2">4</div>
          <p className="text-sm text-gray-400">All agents online</p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              ⚡
            </div>
            <h3 className="font-semibold text-lg">Quick Actions</h3>
          </div>
          <div className="space-y-2 mt-4">
            <button className="w-full py-2 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium transition-colors">
              Create Mission
            </button>
            <button className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors">
              Deploy Tool
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <div className="flex-1">
              <p className="font-medium">Task Manager module deployed</p>
              <p className="text-sm text-gray-500">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <div className="flex-1">
              <p className="font-medium">Mission Control initialized</p>
              <p className="text-sm text-gray-500">Just now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
