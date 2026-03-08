'use client';

import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  source: 'agent' | 'system' | 'node' | 'tool' | 'mission';
  message: string;
  details?: string;
  metadata?: Record<string, any>;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  source: string;
}

const mockLogs: LogEntry[] = [
  { id: 'l-001', timestamp: new Date(Date.now() - 1000 * 30), level: 'success', source: 'tool', message: 'Camera snap completed', details: 'node-001 (iPhone)', metadata: { node: 'iPhone', size: '2.4MB' } },
  { id: 'l-002', timestamp: new Date(Date.now() - 1000 * 120), level: 'info', source: 'agent', message: 'Jarvis spawned sub-agent', details: 'research-bot for mission analysis', metadata: { agent: 'research-bot', parent: 'jarvis' } },
  { id: 'l-003', timestamp: new Date(Date.now() - 1000 * 180), level: 'warning', source: 'system', message: 'Cost threshold approaching', details: 'Daily spend at $23.40 of $50.00 limit', metadata: { current: 23.40, limit: 50.00 } },
  { id: 'l-004', timestamp: new Date(Date.now() - 1000 * 300), level: 'info', source: 'mission', message: 'Mission "Launch v2.0" progress updated', details: 'Progress: 65% → 72%', metadata: { mission: 'Launch v2.0', old: 65, new: 72 } },
  { id: 'l-005', timestamp: new Date(Date.now() - 1000 * 450), level: 'error', source: 'node', message: 'Node connection lost', details: 'Raspberry Pi 4 (node-004) offline', metadata: { node: 'node-004', type: 'Pi' } },
  { id: 'l-006', timestamp: new Date(Date.now() - 1000 * 600), level: 'success', source: 'tool', message: 'Git push completed', details: 'Mission Control updates pushed to origin/main', metadata: { repo: 'Alberto-projects26/projects', branch: 'main' } },
  { id: 'l-007', timestamp: new Date(Date.now() - 1000 * 900), level: 'info', source: 'agent', message: 'Task completed by agent', details: '"Review PR #247" marked done', metadata: { task: 't-003', agent: 'code-reviewer' } },
  { id: 'l-008', timestamp: new Date(Date.now() - 1000 * 1200), level: 'warning', source: 'system', message: 'High token usage detected', details: 'Agent jarvis used 45k tokens in 5 minutes', metadata: { agent: 'jarvis', tokens: 45000, window: '5m' } },
];

const mockAlerts: Alert[] = [
  { id: 'a-001', severity: 'critical', title: 'Node Offline', message: 'Raspberry Pi 4 has been disconnected for 20 minutes', timestamp: new Date(Date.now() - 1000 * 60 * 20), acknowledged: false, source: 'node-004' },
  { id: 'a-002', severity: 'warning', title: 'Cost Spike', message: 'Daily API costs exceeded $20 threshold', timestamp: new Date(Date.now() - 1000 * 60 * 45), acknowledged: false, source: 'billing' },
  { id: 'a-003', severity: 'info', title: 'Mission Milestone', message: 'Mission Control v1 is 75% complete', timestamp: new Date(Date.now() - 1000 * 60 * 60), acknowledged: true, source: 'mission-001' },
  { id: 'a-004', severity: 'warning', title: 'Battery Low', message: 'Pixel Tablet battery at 15%', timestamp: new Date(Date.now() - 1000 * 30), acknowledged: false, source: 'node-002' },
];

const levelConfig = {
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'ℹ️' },
  warning: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: '⚠️' },
  error: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '🔴' },
  success: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: '✅' },
};

const sourceConfig = {
  agent: { label: 'AGENT', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  system: { label: 'SYSTEM', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  node: { label: 'NODE', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  tool: { label: 'TOOL', color: 'text-green-400', bg: 'bg-green-500/10' },
  mission: { label: 'MISSION', color: 'text-pink-400', bg: 'bg-pink-500/10' },
};

const severityConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: '🚨' },
  warning: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: '⚠️' },
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'ℹ️' },
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter(log => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (filterSource !== 'all' && log.source !== filterSource) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !log.details?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.severity === 'critical');
  const warningAlerts = unacknowledgedAlerts.filter(a => a.severity === 'warning');

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  // Simulate live log streaming
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newLog: LogEntry = {
          id: `l-${Date.now()}`,
          timestamp: new Date(),
          level: ['info', 'info', 'success', 'warning'][Math.floor(Math.random() * 4)] as any,
          source: ['agent', 'system', 'tool'][Math.floor(Math.random() * 3)] as any,
          message: ['Heartbeat check', 'Sync completed', 'Token usage updated', 'Node status ping'][Math.floor(Math.random() * 4)],
        };
        setLogs(prev => [newLog, ...prev].slice(0, 100));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission-control-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Monitoring & Logs</h1>
          <p className="text-gray-500 mt-1">Real-time system events and alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportLogs}
            className="px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-sm text-gray-300 transition-colors"
          >
            📥 Export Logs
          </button>
          <button 
            onClick={() => setShowAlerts(!showAlerts)}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors relative"
          >
            🔔 Alerts
            {unacknowledgedAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Alert Center */}
      {showAlerts && unacknowledgedAlerts.length > 0 && (
        <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              🚨 Active Alerts
              <span className="text-sm text-gray-500">({unacknowledgedAlerts.length} unacknowledged)</span>
            </h3>
            <button 
              onClick={() => setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))}
              className="text-xs text-gray-400 hover:text-white"
            >
              Acknowledge all
            </button>
          </div>
          <div className="space-y-3">
            {unacknowledgedAlerts.slice(0, 3).map(alert => {
              const config = severityConfig[alert.severity];
              return (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg} ${config.border}`}>
                  <span className="text-xl">{config.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${config.color}`}>{alert.title}</span>
                      <span className="text-xs text-gray-500">{alert.source}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                    <span className="text-xs text-gray-500">{formatTime(alert.timestamp)}</span>
                  </div>
                  <button 
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs text-gray-300 transition-colors"
                  >
                    Ack
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
          <div className="text-sm text-gray-500">Total Logs</div>
          <div className="text-2xl font-bold text-white">{logs.length}</div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
          <div className="text-sm text-gray-500">Errors</div>
          <div className="text-2xl font-bold text-red-400">{logs.filter(l => l.level === 'error').length}</div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
          <div className="text-sm text-gray-500">Warnings</div>
          <div className="text-2xl font-bold text-yellow-400">{logs.filter(l => l.level === 'warning').length}</div>
        </div>
        <div className="bg-[#161b22] border border-red-500/30 rounded-xl p-4">
          <div className="text-sm text-red-400">Critical Alerts</div>
          <div className="text-2xl font-bold text-red-400">{criticalAlerts.length}</div>
        </div>
        <div className="bg-[#161b22] border border-yellow-500/30 rounded-xl p-4">
          <div className="text-sm text-yellow-400">Warnings</div>
          <div className="text-2xl font-bold text-yellow-400">{warningAlerts.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Level:</span>
          <select 
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-sm text-white"
          >
            <option value="all">All Levels</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Source:</span>
          <select 
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-sm text-white"
          >
            <option value="all">All Sources</option>
            <option value="agent">Agent</option>
            <option value="system">System</option>
            <option value="node">Node</option>
            <option value="tool">Tool</option>
            <option value="mission">Mission</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="w-full px-4 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-sm text-white placeholder-gray-600"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input 
            type="checkbox" 
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded bg-[#21262d] border-[#30363d]"
          />
          Auto-scroll
        </label>
      </div>

      {/* Log Stream */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#30363d] bg-[#0d1117] flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400">Live Log Stream</span>
          <span className="text-xs text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Real-time
          </span>
        </div>
        <div className="max-h-[500px] overflow-y-auto font-mono text-sm">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No logs match your filters</div>
          ) : (
            filteredLogs.map((log) => {
              const level = levelConfig[log.level];
              const source = sourceConfig[log.source];
              return (
                <div 
                  key={log.id}
                  className="px-4 py-3 border-b border-[#30363d]/50 hover:bg-[#21262d]/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 text-xs">{formatTime(log.timestamp)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${source.bg} ${source.color}`}>
                      {source.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${level.bg} ${level.color} ${level.border}`}>
                      {level.icon} {log.level.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <span className="text-gray-300">{log.message}</span>
                      {log.details && (
                        <span className="text-gray-500 ml-2">— {log.details}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Log Details</h3>
              <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Timestamp</label>
                  <div className="text-sm text-gray-300">{formatTime(selectedLog.timestamp)}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Level</label>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${levelConfig[selectedLog.level].bg} ${levelConfig[selectedLog.level].color}`}>
                    {levelConfig[selectedLog.level].icon} {selectedLog.level}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Source</label>
                  <div className={`inline-block px-2 py-1 rounded text-sm ${sourceConfig[selectedLog.source].bg} ${sourceConfig[selectedLog.source].color}`}>
                    {sourceConfig[selectedLog.source].label}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Log ID</label>
                  <div className="text-sm text-gray-300 font-mono">{selectedLog.id}</div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Message</label>
                <div className="mt-1 p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-gray-300">
                  {selectedLog.message}
                </div>
              </div>

              {selectedLog.details && (
                <div>
                  <label className="text-xs text-gray-500">Details</label>
                  <div className="mt-1 p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-gray-400 text-sm">
                    {selectedLog.details}
                  </div>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <label className="text-xs text-gray-500">Metadata</label>
                  <pre className="mt-1 p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-gray-400 overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
