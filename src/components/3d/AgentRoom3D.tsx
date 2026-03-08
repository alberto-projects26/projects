'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Zap, Activity, Users, Calendar, BarChart3, Code, Headset, BookOpen, Network } from 'lucide-react';

interface AgentType {
  id: string;
  name: string;
  role: string;
  color: string;
  icon: React.ElementType;
  position: { x: number; y: number };
  status: 'idle' | 'working' | 'collaborating' | 'thinking';
  currentTask?: string;
}

const AGENT_CONFIGS: Record<string, { color: string; icon: React.ElementType; role: string }> = {
  'jarvis-1': { color: '#06b6d4', icon: Network, role: 'Primary Assistant' },
};

const WORKSTATIONS = [
  { id: 'planning', name: 'Planning Station', position: { x: 150, y: 150 }, color: '#3b82f6', icon: Calendar },
  { id: 'analytics', name: 'Analytics Hub', position: { x: 450, y: 200 }, color: '#10b981', icon: BarChart3 },
  { id: 'code', name: 'Code Terminal', position: { x: 750, y: 180 }, color: '#8b5cf6', icon: Code },
  { id: 'support', name: 'Support Console', position: { x: 250, y: 450 }, color: '#f59e0b', icon: Headset },
  { id: 'research', name: 'Research Lab', position: { x: 550, y: 480 }, color: '#ec4899', icon: BookOpen },
  { id: 'command', name: 'Command Node', position: { x: 800, y: 500 }, color: '#06b6d4', icon: Network },
];

const TASKS = [
  'Processing requests...',
  'Analyzing metrics',
  'Optimizing workflows',
  'Reviewing documentation',
  'Coordinating tasks',
  'Gathering insights',
  'Synchronizing data',
  'Monitoring system',
];

function Agent3D({ agent, isHovered, onHover }: { agent: AgentType; isHovered: boolean; onHover: (id: string | null) => void }) {
  const Icon = agent.icon || Users;
  const statusColors = {
    idle: '#9ca3af',
    working: '#22c55e',
    thinking: '#a855f7',
    collaborating: '#3b82f6',
  };

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ 
        left: agent.position.x, 
        top: agent.position.y,
        transform: `translateZ(0px) scale(${isHovered ? 1.15 : 1})`,
        transformStyle: 'preserve-3d',
      }}
      onMouseEnter={() => onHover(agent.id)}
      onMouseLeave={() => onHover(null)}
      animate={{
        x: 0,
        y: 0,
      }}
      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
    >
      {/* Shadow */}
      <div 
        className="absolute rounded-full blur-lg"
        style={{
          width: 48,
          height: 32,
          backgroundColor: 'rgba(0,0,0,0.6)',
          transform: 'translateY(30px) translateZ(-20px)',
          left: -24,
          top: 20,
        }}
      />

      {/* Body */}
      <div 
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Head */}
        <div 
          className="relative rounded-lg"
          style={{
            width: 28,
            height: 24,
            backgroundColor: agent.color,
            border: '2px solid rgba(255,255,255,0.8)',
            transform: 'translateZ(20px)',
            boxShadow: `0 0 20px ${agent.color}60`,
          }}
        >
          {/* Eyes */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.1s' }} />
          </div>
        </div>

        {/* Antenna */}
        <div 
          className="absolute"
          style={{
            width: 2,
            height: 8,
            backgroundColor: 'rgba(255,255,255,0.8)',
            left: 13,
            top: -8,
            transform: 'translateZ(24px)',
          }}
        >
          <div 
            className="absolute rounded-full"
            style={{
              width: 6,
              height: 6,
              backgroundColor: statusColors[agent.status],
              left: -2,
              top: -3,
              boxShadow: `0 0 8px ${statusColors[agent.status]}`,
            }}
          />
        </div>

        {/* Body */}
        <div 
          className="relative rounded-lg"
          style={{
            width: 32,
            height: 32,
            backgroundColor: agent.color,
            border: '2px solid rgba(255,255,255,0.8)',
            transform: 'translateZ(15px)',
            marginTop: 4,
            boxShadow: `0 0 20px ${agent.color}60`,
          }}
        >
          <Icon 
            size={16} 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-lg" 
          />
        </div>

        {/* Legs */}
        <div className="flex gap-1 justify-center" style={{ transform: 'translateZ(10px)', marginTop: 4 }}>
          <div 
            className="rounded-sm"
            style={{
              width: 8,
              height: 20,
              backgroundColor: agent.color,
              opacity: agent.status === 'working' ? 0.8 : 1,
            }} 
          />
          <div 
            className="rounded-sm"
            style={{
              width: 8,
              height: 20,
              backgroundColor: agent.color,
              opacity: agent.status === 'working' ? 0.8 : 1,
            }} 
          />
        </div>

        {/* Glow when working/collaborating */}
        {(agent.status === 'working' || agent.status === 'collaborating') && (
          <div 
            className="absolute rounded-full animate-pulse"
            style={{
              width: 60,
              height: 60,
              backgroundColor: agent.color,
              opacity: 0.3,
              left: -14,
              top: -10,
              transform: 'translateZ(0px)',
              filter: 'blur(10px)',
            }}
          />
        )}
      </div>

      {/* Task Bubble on Hover */}
      {isHovered && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-2 rounded-lg text-xs"
          style={{
            bottom: 60,
            backgroundColor: 'rgba(0,0,0,0.9)',
            border: `2px solid ${agent.color}`,
            boxShadow: `0 0 15px ${agent.color}60`,
            transform: 'translateZ(40px)',
          }}
        >
          <div className="font-black uppercase" style={{ color: agent.color }}>{agent.name}</div>
          <div className="text-white/70 text-[10px] font-mono">{agent.role}</div>
          <div className="text-cyan-400 text-[9px] font-mono mt-1">{agent.currentTask}</div>
        </motion.div>
      )}

      {/* Name Tag */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[9px] font-mono uppercase"
        style={{
          top: 65,
          backgroundColor: 'rgba(0,0,0,0.8)',
          border: `1px solid ${agent.color}`,
          boxShadow: `0 0 8px ${agent.color}40`,
          color: agent.color,
          transform: 'translateZ(25px)',
        }}
      >
        {agent.name}
      </div>
    </motion.div>
  );
}

function Workstation({ station }: { station: typeof WORKSTATIONS[0] }) {
  const Icon = station.icon;
  
  return (
    <div 
      className="absolute"
      style={{
        left: station.position.x - 32,
        top: station.position.y - 32,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Station Base */}
      <div 
        className="rounded-lg"
        style={{
          width: 64,
          height: 64,
          backgroundColor: `${station.color}20`,
          border: `2px solid ${station.color}`,
          transform: 'translateZ(8px)',
          boxShadow: `0 0 20px ${station.color}60, inset 0 0 20px ${station.color}30`,
        }}
      >
        <Icon 
          size={24} 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ color: station.color }}
        />
      </div>

      {/* Label */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[8px] font-mono uppercase whitespace-nowrap"
        style={{
          top: 70,
          backgroundColor: 'rgba(0,0,0,0.8)',
          border: `1px solid ${station.color}`,
          boxShadow: `0 0 8px ${station.color}40`,
          color: station.color,
        }}
      >
        {station.name}
      </div>
    </div>
  );
}

function SyncChamber() {
  return (
    <div 
      className="absolute rounded-full border-2 border-dashed"
      style={{
        left: 400,
        top: 320,
        width: 100,
        height: 100,
        borderColor: '#a855f7',
        transform: 'translateZ(5px)',
        boxShadow: '0 0 30px #a855f740',
      }}
    >
      {/* Corner Markers */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-sm animate-pulse"
          style={{
            backgroundColor: '#a855f7',
            boxShadow: '0 0 10px #a855f7',
            left: i % 2 === 0 ? -6 : -3,
            top: i < 2 ? -6 : -3,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function AgentRoom3D({ agents = [] }: { agents?: any[] }) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [cameraRotateX, setCameraRotateX] = useState(60);
  const [cameraRotateZ, setCameraRotateZ] = useState(-45);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert Supabase agents to 3D agents
  const activeAgents: AgentType[] = useMemo(() => {
    if (!agents || agents.length === 0) {
      return [{
        id: 'jarvis-1',
        name: 'Jarvis',
        role: 'Primary Assistant',
        color: '#06b6d4',
        icon: Network,
        position: { x: 450, y: 300 },
        status: 'idle',
        currentTask: 'Awaiting command...',
      }];
    }

    return agents.slice(0, 6).map((agent, i) => {
      const config = AGENT_CONFIGS[agent.id] || { 
        color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'][i % 5], 
        icon: Users,
        role: agent.role 
      };
      
      const station = WORKSTATIONS[i % WORKSTATIONS.length];
      
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role || config.role,
        color: agent.color || config.color,
        icon: config.icon,
        position: { 
          x: station.position.x + (Math.random() - 0.5) * 40, 
          y: station.position.y + (Math.random() - 0.5) * 40 
        },
        status: agent.status === 'active' ? 'working' : agent.status === 'retired' ? 'idle' : 'idle',
        currentTask: TASKS[Math.floor(Math.random() * TASKS.length)],
      };
    });
  }, [agents]);

  // Update agent tasks periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityLog(prev => {
        const newLog = [...prev, `[${new Date().toLocaleTimeString()}] Agent activity update`];
        return newLog.slice(-6);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCameraRotateZ(prev => prev + e.movementX * 0.3);
    setCameraRotateX(prev => Math.max(20, Math.min(80, prev + e.movementY * 0.3)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    setZoom(prev => Math.max(50, Math.min(150, prev - e.deltaY * 0.1)));
  };

  const workingCount = activeAgents.filter(a => a.status === 'working').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <header className="pb-6">
      </header>

      <div className="flex gap-6">
        {/* 3D Room */}
        <div 
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-gradient-to-b from-slate-900 to-black cursor-grab active:cursor-grabbing"
          style={{
            width: 900,
            height: 600,
            perspective: '1500px',
            transformStyle: 'preserve-3d',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Room Container with 3D Transform */}
          <div 
            style={{
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transform: `rotateX(${cameraRotateX}deg) rotateZ(${cameraRotateZ}deg) scale(${zoom / 100})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {/* Floor */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
                transform: 'translateZ(-40px)',
              }}
            />
            
            {/* Grid */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #06b6d4 1px, transparent 1px),
                  linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                animation: 'gridScroll 20s linear infinite',
                transform: 'translateZ(0px)',
              }}
            />

            {/* Workstations */}
            {WORKSTATIONS.map(station => (
              <Workstation key={station.id} station={station} />
            ))}

            {/* Sync Chamber */}
            <SyncChamber />

            {/* Agents */}
            {activeAgents.map(agent => (
              <Agent3D 
                key={agent.id} 
                agent={agent} 
                isHovered={hoveredAgent === agent.id}
                onHover={setHoveredAgent}
              />
            ))}
          </div>

          {/* Camera Controls Hint */}
          <div 
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/60 text-[10px] font-mono text-cyan-400 border border-cyan-500/30 backdrop-blur-sm transition-opacity ${isDragging ? 'opacity-50' : ''}`}
          >
            🎮 Drag to Rotate | 🖱️ Scroll to Zoom
          </div>

          {/* Camera Stats */}
          <div className="absolute top-4 left-4 text-[9px] font-mono text-cyan-500/50">
            X: {cameraRotateX.toFixed(0)}° | Z: {cameraRotateZ.toFixed(0)}° | Zoom: {zoom}%
          </div>
        </div>

        {/* Activity Panel */}
        <div className="w-80 p-6 rounded-2xl border border-[#30363d] bg-black/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-cyan-400" />
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest">System Log</h3>
          </div>

          {/* Log Entries */}
          <div className="space-y-2 mb-6 min-h-[120px]">
            {activityLog.length === 0 ? (
              <p className="text-[10px] font-mono text-gray-500">Waiting for activity...</p>
            ) : (
              activityLog.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-2 rounded bg-black/40 border border-cyan-500/30"
                >
                  <p className="text-[10px] font-mono text-cyan-300">{entry}</p>
                </motion.div>
              ))
            )}
          </div>

          {/* Agent Roster */}
          <div className="border-t border-[#30363d] pt-4">
            <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-3">Agent Roster</h4>
            <div className="space-y-2">
              {activeAgents.map(agent => (
                <div key={agent.id} className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: agent.status === 'working' ? '#22c55e' : agent.status === 'thinking' ? '#a855f7' : '#9ca3af',
                      boxShadow: `0 0 6px ${agent.status === 'working' ? '#22c55e' : agent.status === 'thinking' ? '#a855f7' : '#9ca3af'}`,
                    }}
                  />
                  <span className="text-[10px] font-mono" style={{ color: agent.color }}>{agent.name}</span>
                  <span className="text-[9px] text-cyan-500/50 uppercase">{agent.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Key */}
          <div className="border-t border-[#30363d] pt-4 mt-4">
            <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-3">Status Key</h4>
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-400">WORKING</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-400">SYNCING</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-gray-400">THINKING</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span className="text-gray-400">IDLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gridScroll {
          from { background-position: 0 0; }
          to { background-position: 40px 40px; }
        }
      `}</style>
    </div>
  );
}
