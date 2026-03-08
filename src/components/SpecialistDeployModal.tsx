'use client';

import { useState } from 'react';
import { Loader2, Zap, Users, Bot, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SPECIALIST_TYPES = [
  {
    id: 'research',
    name: 'Oracle',
    role: 'Research Specialist',
    color: '#10b981',
    icon: '🔍',
    capabilities: ['web-search', 'web-fetch', 'reading-files'],
    description: 'Gathers intel from across the digital realm',
    model: 'haiku',
    modelLabel: 'Haiku (Fast Research)'
  },
  {
    id: 'code',
    name: 'Neo',
    role: 'Development Specialist',
    color: '#8b5cf6',
    icon: '💻',
    capabilities: ['exec', 'write-files', 'git'],
    description: 'Builds and maintains codebases',
    model: 'codex-mini',
    modelLabel: 'Codex-Mini (Code Expert)'
  },
  {
    id: 'ops',
    name: 'Morphius',
    role: 'Operations Specialist',
    color: '#f59e0b',
    icon: '⚙️',
    capabilities: ['cron', 'email', 'messaging'],
    description: 'Coordinates schedules and workflows',
    model: 'haiku',
    modelLabel: 'Haiku (Fast Ops)'
  },
  {
    id: 'analysis',
    name: 'Sherlock',
    role: 'Analysis Specialist',
    color: '#ec4899',
    icon: '📊',
    capabilities: ['web-search', 'web-fetch', 'reading-files'],
    description: 'Turns raw data into actionable insights',
    model: 'minimax',
    modelLabel: 'Minimax-M2.5 (Deep Analysis)'
  },
  {
    id: 'design',
    name: 'Picasso',
    role: 'UI/UX Specialist',
    color: '#f43f5e',
    icon: '🎨',
    capabilities: ['browser', 'write-files'],
    description: 'Specializes in UI design and visual aesthetics',
    model: 'minimax',
    modelLabel: 'Minimax-M2.5 (Creative)'
  }
];

interface SpecialistDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (agent: any) => void;
}

export default function SpecialistDeployModal({ isOpen, onClose, onDeploy }: SpecialistDeployModalProps) {
  const [selectedType, setSelectedType] = useState<typeof SPECIALIST_TYPES[0] | null>(null);
  const [agentName, setAgentName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDeploy = async () => {
    if (!selectedType || !agentName.trim()) return;
    
    setIsDeploying(true);
    setError('');

    try {
      // Create agent in Supabase
      const { data, error: supabaseError } = await supabase
        .from('agents')
        .insert([{
          id: `${selectedType.id}-${Date.now()}`,
          name: agentName,
          role: selectedType.role,
          status: 'active',
          capabilities: selectedType.capabilities,
          token_burn_24h: 0,
          current_mission_id: null,
          is_specialist: true,
          specialist_type: selectedType.id,
          model: selectedType.model
        }])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Notify parent
      onDeploy(data);
      onClose();
      setSelectedType(null);
      setAgentName('');
    } catch (err: any) {
      console.error('Deploy error:', err);
      setError(err.message || 'Failed to deploy specialist');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <header className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} className="text-cyan-400" />
            Deploy Specialist
          </h3>
          <button onClick={onClose} className="text-[#8b949e] hover:text-white">✕</button>
        </header>

        <div className="p-6 space-y-6">
          {!selectedType ? (
            <>
              <p className="text-xs text-[#8b949e] font-mono">SELECT SPECIALIST TYPE</p>
              <div className="grid grid-cols-2 gap-3">
                {SPECIALIST_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className="p-4 rounded-xl border border-[#30363d] bg-[#0d1117] hover:border-[#484f58] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-black text-white uppercase">{type.name}</span>
                    </div>
                    <p className="text-[10px] text-[#8b949e] font-mono mb-2">{type.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {type.capabilities.map(cap => (
                        <span key={cap} className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-mono text-[#8b949e]">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0d1117] border border-[#30363d]">
                <span className="text-2xl">{selectedType.icon}</span>
                <div>
                  <div className="font-black text-white uppercase">{selectedType.name}</div>
                  <div className="text-[10px] text-[#8b949e] font-mono">{selectedType.role}</div>
                </div>
                <button 
                  onClick={() => setSelectedType(null)}
                  className="ml-auto text-[#8b949e] hover:text-white text-xs font-black uppercase"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest block mb-2">
                  Unit Name
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder={`e.g. ${selectedType.name}-01`}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm font-mono focus:border-cyan-500 transition-all"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]">
                <div className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-2">Configuration</div>
                <div className="flex gap-4 text-[10px] font-mono">
                  <div>
                    <span className="text-[#484f58]">Model:</span>{' '}
                    <span style={{ color: selectedType.color }}>{selectedType.model}</span>
                  </div>
                  <div>
                    <span className="text-[#484f58]">Capabilities:</span>{' '}
                    <span className="text-white">{selectedType.capabilities.join(', ')}</span>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 font-mono">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedType(null)}
                  className="flex-1 py-3 border border-[#30363d] text-[#8b949e] font-black uppercase text-xs tracking-widest rounded-lg hover:bg-[#161b22] transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleDeploy}
                  disabled={!agentName.trim() || isDeploying}
                  className="flex-1 py-3 bg-cyan-500 text-black font-black uppercase text-xs tracking-widest rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      Deploy Unit
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
