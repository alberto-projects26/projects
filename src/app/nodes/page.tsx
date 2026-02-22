'use client';

import { useState } from 'react';

interface Node {
  id: string;
  name: string;
  type: 'iOS' | 'Android' | 'macOS' | 'Linux' | 'Pi';
  status: 'online' | 'offline' | 'busy';
  battery?: number;
  lastSeen: string;
  capabilities: string[];
  location?: { lat: number; lng: number; accuracy: number };
}

const mockNodes: Node[] = [
  {
    id: 'node-001',
    name: 'Alberto\'s iPhone',
    type: 'iOS',
    status: 'online',
    battery: 78,
    lastSeen: '2 min ago',
    capabilities: ['camera', 'location', 'screen', 'notifications'],
    location: { lat: 37.453, lng: -122.181, accuracy: 5 },
  },
  {
    id: 'node-002',
    name: 'Pixel Tablet',
    type: 'Android',
    status: 'online',
    battery: 45,
    lastSeen: '5 min ago',
    capabilities: ['camera', 'location', 'screen', 'sms'],
    location: { lat: 37.451, lng: -122.183, accuracy: 8 },
  },
  {
    id: 'node-003',
    name: 'Mac mini Lab',
    type: 'macOS',
    status: 'busy',
    lastSeen: '1 min ago',
    capabilities: ['screen', 'exec', 'camera'],
  },
  {
    id: 'node-004',
    name: 'Raspberry Pi 4',
    type: 'Pi',
    status: 'online',
    lastSeen: 'Just now',
    capabilities: ['exec', 'sensors'],
  },
];

const typeIcons: Record<string, string> = {
  'iOS': '📱',
  'Android': '🤖',
  'macOS': '🖥️',
  'Linux': '🐧',
  'Pi': '🥧',
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
  const [nodes, setNodes] = useState<Node[]>(mockNodes);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [commandOutput, setCommandOutput] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);

  const onlineCount = nodes.filter(n => n.status === 'online').length;
  const totalCapabilities = [...new Set(nodes.flatMap(n => n.capabilities))].length;

  const handleCameraSnap = (nodeId: string) => {
    setShowCameraPreview(true);
    setTimeout(() => setShowCameraPreview(false), 2000);
  };

  const handleScreenRecord = (nodeId: string) => {
    setIsRecording(true);
    setTimeout(() => setIsRecording(false), 5000);
  };

  const handleExecCommand = (nodeId: string, command: string) => {
    setCommandOutput(`$ ${command}\nExecuting on ${nodeId}...\n\nstdout: Command completed successfully\nexit code: 0\n`);
  };

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
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-5">
          <div className="text-sm text-gray-500 mb-1">Active Sessions</div>
          <div className="text-2xl font-bold text-purple-400">3</div>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {nodes.map((node) => {
          const status = statusConfig[node.status];
          const isSelected = selectedNode?.id === node.id;

          return (
            <div
              key={node.id}
              className={`bg-[#161b22] border rounded-xl overflow-hidden transition-all cursor-pointer ${
                isSelected ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-[#30363d] hover:border-gray-500'
              }`}
              onClick={() => setSelectedNode(isSelected ? null : node)}
            >
              {/* Node Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#21262d] flex items-center justify-center text-2xl border border-[#30363d]">
                      {typeIcons[node.type]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{node.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{node.type}</span>
                        <span>•</span>
                        <span>ID: {node.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs border ${status.bg} ${status.color} ${status.border || 'border-transparent'}`}>
                    <span className={`inline-block w-2 h-2 rounded-full ${status.dot} mr-2`} />
                    {node.status.toUpperCase()}
                  </div>
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {node.capabilities.map((cap) => (
                    <span key={cap} className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded-lg text-xs text-gray-400">
                      {capabilityIcons[cap]} {cap}
                    </span>
                  ))}
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    {node.battery && (
                      <span className={node.battery < 20 ? 'text-red-400' : ''}>
                        🔋 {node.battery}%
                      </span>
                    )}
                    <span>🕒 {node.lastSeen}</span>
                  </div>
                  {node.location && (
                    <span className="text-cyan-400">📍 Location active</span>
                  )}
                </div>
              </div>

              {/* Action Panel (when selected) */}
              {isSelected && (
                <div className="border-t border-[#30363d] p-5 bg-[#0d1117]/50">
                  <h4 className="text-sm font-medium text-white mb-4">Remote Actions</h4>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {node.capabilities.includes('camera') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCameraSnap(node.id); }}
                        className="flex items-center justify-center gap-2 p-3 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-sm text-gray-300 transition-colors"
                      >
                        📸 Snap Photo
                      </button>
                    )}
                    {node.capabilities.includes('screen') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleScreenRecord(node.id); }}
                        className={`flex items-center justify-center gap-2 p-3 border rounded-lg text-sm transition-colors ${
                          isRecording 
                            ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse' 
                            : 'bg-[#21262d] hover:bg-[#30363d] border-[#30363d] text-gray-300'
                        }`}
                      >
                        🎥 {isRecording ? 'Recording...' : 'Screen Record'}
                      </button>
                    )}
                    {node.capabilities.includes('location') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowLocationMap(true); }}
                        className="flex items-center justify-center gap-2 p-3 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-sm text-gray-300 transition-colors"
                      >
                        📍 Get Location
                      </button>
                    )}
                    {node.capabilities.includes('exec') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="flex items-center justify-center gap-2 p-3 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-sm text-gray-300 transition-colors"
                      >
                        ⚡ Execute Command
                      </button>
                    )}
                  </div>

                  {/* Command Input */}
                  {node.capabilities.includes('exec') && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-mono">$</span>
                        <input
                          type="text"
                          placeholder={`Enter command for ${node.name}...`}
                          className="flex-1 bg-transparent border-none outline-none text-gray-300 font-mono text-sm placeholder-gray-600"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleExecCommand(node.id, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                      {commandOutput && (
                        <pre className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs font-mono text-gray-400 overflow-x-auto">
                          {commandOutput}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Network Topology Map Placeholder */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Network Topology</h3>
          <span className="text-xs text-gray-500">Real-time node mesh</span>
        </div>
        <div className="h-64 bg-[#0d1117] rounded-lg border border-[#30363d] flex items-center justify-center relative overflow-hidden">
          {/* Animated nodes visualization */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 800 300">
              {/* Connection lines */}
              <line x1="100" y1="150" x2="250" y2="100" stroke="#30363d" strokeWidth="1" />
              <line x1="100" y1="150" x2="250" y2="200" stroke="#30363d" strokeWidth="1" />
              <line x1="250" y1="100" x2="400" y2="150" stroke="#30363d" strokeWidth="1" />
              <line x1="250" y1="200" x2="400" y2="150" stroke="#30363d" strokeWidth="1" />
              <line x1="400" y1="150" x2="600" y2="150" stroke="#58a6ff" strokeWidth="2" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
              </line>
              
              {/* Nodes */}
              <circle cx="100" cy="150" r="8" fill="#161b22" stroke="#58a6ff" strokeWidth="2" />
              <circle cx="250" cy="100" r="8" fill="#161b22" stroke="#238636" strokeWidth="2" />
              <circle cx="250" cy="200" r="8" fill="#161b22" stroke="#238636" strokeWidth="2" />
              <circle cx="400" cy="150" r="10" fill="#161b22" stroke="#58a6ff" strokeWidth="3" />
              <circle cx="600" cy="150" r="8" fill="#161b22" stroke="#8957e5" strokeWidth="2" />
              
              {/* Labels */}
              <text x="100" y="175" textAnchor="middle" fill="#888" fontSize="10">iPhone</text>
              <text x="250" y="85" textAnchor="middle" fill="#888" fontSize="10">Pixel</text>
              <text x="250" y="230" textAnchor="middle" fill="#888" fontSize="10">Mac mini</text>
              <text x="400" y="185" textAnchor="middle" fill="#888" fontSize="10" fontWeight="bold">Gateway</text>
              <text x="600" y="175" textAnchor="middle" fill="#888" fontSize="10">Pi 4</text>
            </svg>
          </div>
          <div className="text-gray-500 text-sm z-10">
            <span className="text-cyan-400">●</span> Gateway Hub &nbsp;
            <span className="text-green-400">●</span> Online Node &nbsp;
            <span className="text-purple-400">●</span> Peripheral
          </div>
        </div>
      </div>

      {/* Camera Preview Modal */}
      {showCameraPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">📸 Camera Snapshot</h3>
              <button onClick={() => setShowCameraPreview(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="aspect-video bg-[#0d1117] rounded-lg border border-[#30363d] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-gray-500 text-sm">Photo captured from node</div>
                <div className="text-gray-600 text-xs mt-1">2026-02-22 14:32:18 PST</div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex-1 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] rounded-lg text-gray-300 text-sm transition-colors">
                📥 Download
              </button>
              <button className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white text-sm transition-colors">
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Map Modal */}
      {showLocationMap && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">📍 Device Location</h3>
              <button onClick={() => setShowLocationMap(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="aspect-square bg-[#0d1117] rounded-lg border border-[#30363d] flex items-center justify-center relative">
              {/* Simulated map */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, #21262d 0%, transparent 70%)',
              }} />
              <div className="text-center z-10">
                <div className="text-3xl mb-2">📍</div>
                <div className="text-cyan-400 font-mono">37.4530° N, 122.1810° W</div>
                <div className="text-gray-500 text-sm mt-1">Accuracy: ±5 meters</div>
                <div className="text-gray-600 text-xs mt-2">Menlo Park, CA</div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex-1 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] rounded-lg text-gray-300 text-sm transition-colors">
                🗺️ Open in Maps
              </button>
              <button className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white text-sm transition-colors">
                📋 Copy Coords
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
