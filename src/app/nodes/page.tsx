'use client';

import { useState } from 'react';
import { useNodes } from '@/hooks/useNodes';

const typeIcons: Record<string, string> = {
  'iOS': '📱',
  'Android': '🤖',
  'macOS': '🖥️',
  'Linux': '🐧',
  'Pi': '🥧',
  'unknown': '❓',
};

const statusConfig = {
  'online': { color: 'text-green-400', bg: 'bg-green-500/10', dot: 'bg-green-500 animate-pulse' },
  'busy': { color: 'text-yellow-400', bg: 'bg-yellow-500/10', dot: 'bg-yellow-500' },
  'offline': { color: 'text-gray-400', bg: 'bg-gray-500/10', dot: 'bg-gray-500' },
};

const capabilityIcons: Record<string, string> = {
  'camera': '📸',
  'location': '📍',
  'screen': '🖥️',
  'exec': '⚡',
  'sms': '💬',
  'notifications': '🔔',
  'sensors': '🌡️',
};

export default function NodesPage() {
  const { nodes, loading, error, usingMockData, executeCommand } = useNodes();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [commandOutput, setCommandOutput] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const onlineCount = nodes.filter(n => n.status === 'online').length;
  const totalCapabilities = [...new Set(nodes.flatMap(n => n.capabilities))].length;

  const handleCameraSnap = (nodeId: string) => {
    setShowCameraPreview(true);
    // Real integration would call nodes.camera_snap here
  };

  const handleScreenRecord = (nodeId: string) => {
    setIsRecording(true);
    setTimeout(() => setIsRecording(false), 5000);
  };

  const handleExec = async (nodeId: string, cmd: string) => {
    setCommandOutput(`$ ${cmd}\nConnecting to node ${nodeId}...\n`);
    const result = await executeCommand(nodeId, cmd);
    setCommandOutput(prev => prev + (result.stdout || result.error || 'Done.'));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-cyan-400 animate-pulse">Scanning network for nodes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Hardware Nodes</h1>
          <p className="text-gray-500 mt-1">Remote devices and sensors under your command</p>
        </div>
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition-all shadow-lg shadow-cyan-600/20">
          + Pair New Node
        </button>
      </div>

      {/* Connection Mode Indicator */}
      {usingMockData && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-3">
          <span className="text-yellow-400">⚠️</span>
          <div>
            <p className="text-yellow-400 text-sm">Demo Mode — No active nodes detected on OpenClaw Gateway</p>
            <p className="text-gray-500 text-xs mt-1">Pair devices using `openclaw devices pairing` to see them here</p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500 mb-1">Total Nodes</div>
          <div className="text-2xl font-bold text-white">{nodes.length}</div>
        </div>
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500 mb-1">Online</div>
          <div className="text-2xl font-bold text-green-400">{onlineCount}</div>
        </div>
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500 mb-1">Capabilities</div>
          <div className="text-2xl font-bold text-cyan-400">{totalCapabilities}</div>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {nodes.map((node) => {
          const status = statusConfig[node.status as keyof typeof statusConfig] || statusConfig.offline;
          const isSelected = selectedNodeId === node.id;

          return (
            <div
              key={node.id}
              className={`bg-[#161b22] border rounded-xl transition-all cursor-pointer ${
                isSelected ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-[#30363d] hover:border-gray-500'
              }`}
              onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#21262d] flex items-center justify-center text-2xl border border-[#30363d]">
                      {typeIcons[node.type.toLowerCase()] || typeIcons.unknown}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{node.name}</h3>
                      <div className="text-sm text-gray-500 uppercase font-mono">{node.type} • {node.id.slice(0,8)}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs border ${status.bg} ${status.color}`}>
                    <span className={`inline-block w-2 h-2 rounded-full ${status.dot} mr-2`} />
                    {node.status.toUpperCase()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {node.capabilities.map((cap) => (
                    <span key={cap} className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded-lg text-xs text-gray-400">
                      {capabilityIcons[cap.toLowerCase()] || '⚙️'} {cap}
                    </span>
                  ))}
                </div>
              </div>

              {isSelected && (
                <div className="border-t border-[#30363d] p-5 bg-[#0d1117]/50" onClick={e => e.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button onClick={() => handleCameraSnap(node.id)} className="p-3 bg-[#21262d] rounded-lg text-sm hover:bg-[#30363d] border border-[#30363d] text-gray-300">📸 Camera</button>
                    <button onClick={() => setShowLocationMap(true)} className="p-3 bg-[#21262d] rounded-lg text-sm hover:bg-[#30363d] border border-[#30363d] text-gray-300">📍 Location</button>
                  </div>
                  {node.capabilities.includes('system.run') || node.capabilities.includes('exec') ? (
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="Execute command..."
                        className="w-full bg-[#0d1117] border border-[#30363d] p-2 rounded-lg text-xs font-mono text-cyan-400"
                        onKeyDown={e => e.key === 'Enter' && handleExec(node.id, (e.target as HTMLInputElement).value)}
                      />
                      {commandOutput && <pre className="text-[10px] text-gray-500 overflow-x-auto max-h-32">{commandOutput}</pre>}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
