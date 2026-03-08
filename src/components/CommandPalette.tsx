'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Command {
  id: string;
  title: string;
  shortcut?: string;
  icon: string;
  category: 'Navigation' | 'Actions' | 'Agents' | 'Nodes' | 'Settings';
  action: () => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const commands: Command[] = useMemo(() => [
    // Navigation
    { id: 'nav-dashboard', title: 'Go to Dashboard', shortcut: 'G D', icon: '📊', category: 'Navigation', action: () => { router.push('/'); setIsOpen(false); } },
    { id: 'nav-missions', title: 'Go to Missions', shortcut: 'G M', icon: '🎯', category: 'Navigation', action: () => { router.push('/missions'); setIsOpen(false); } },
    { id: 'nav-tasks', title: 'Go to Tasks', shortcut: 'G T', icon: '✅', category: 'Navigation', action: () => { router.push('/tasks'); setIsOpen(false); } },
    { id: 'nav-agents', title: 'Go to Agents', shortcut: 'G A', icon: '🤖', category: 'Navigation', action: () => { router.push('/agents'); setIsOpen(false); } },
    { id: 'nav-nodes', title: 'Go to Nodes', shortcut: 'G N', icon: '📱', category: 'Navigation', action: () => { router.push('/nodes'); setIsOpen(false); } },
    { id: 'nav-logs', title: 'Go to Logs', shortcut: 'G L', icon: '📋', category: 'Navigation', action: () => { router.push('/logs'); setIsOpen(false); } },
    
    // Actions
    { id: 'action-new-mission', title: 'Create New Mission', shortcut: '⌘ M', icon: '🚀', category: 'Actions', action: () => { router.push('/missions'); setIsOpen(false); } },
    { id: 'action-new-task', title: 'Create New Task', shortcut: '⌘ T', icon: '➕', category: 'Actions', action: () => { router.push('/tasks'); setIsOpen(false); } },
    { id: 'action-spawn-agent', title: 'Spawn Agent', shortcut: '⌘ A', icon: '🤖', category: 'Actions', action: () => { router.push('/agents'); setIsOpen(false); } },
    { id: 'action-refresh', title: 'Refresh Data', shortcut: '⌘ R', icon: '🔄', category: 'Actions', action: () => { window.location.reload(); } },
    
    // Quick Actions
    { id: 'quick-snap', title: 'Snap Photo from iPhone', icon: '📸', category: 'Nodes', action: () => { router.push('/nodes'); setIsOpen(false); } },
    { id: 'quick-location', title: 'Get Device Location', icon: '📍', category: 'Nodes', action: () => { router.push('/nodes'); setIsOpen(false); } },
    { id: 'quick-screen', title: 'Start Screen Recording', icon: '🎥', category: 'Nodes', action: () => { router.push('/nodes'); setIsOpen(false); } },
    
    // Settings
    { id: 'settings-theme', title: 'Toggle Theme', icon: '🌙', category: 'Settings', action: () => { setIsOpen(false); } },
    { id: 'settings-notifications', title: 'Notification Settings', icon: '🔔', category: 'Settings', action: () => { router.push('/settings'); setIsOpen(false); } },
    { id: 'settings-api', title: 'API Keys', icon: '🔑', category: 'Settings', action: () => { router.push('/settings'); setIsOpen(false); } },
  ], [router]);

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    const query = search.toLowerCase();
    return commands.filter(cmd => 
      cmd.title.toLowerCase().includes(query) ||
      cmd.category.toLowerCase().includes(query)
    );
  }, [commands, search]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearch('');
      }
      // Arrow navigation
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const command = filteredCommands[selectedIndex];
          if (command) {
            command.action();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]">
      <div className="w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="border-b border-[#30363d] p-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xl">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-gray-500"
              autoFocus
            />
            <kbd className="px-2 py-1 bg-[#21262d] rounded text-xs text-gray-400">ESC to close</kbd>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No commands found for &quot;{search}&quot;
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds], groupIdx) => {
              const prevCmds = Object.entries(groupedCommands)
                .slice(0, groupIdx)
                .flatMap(([, c]) => c);
              return (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {category}
                  </div>
                  {cmds.map((cmd, idx) => {
                    const globalIndex = prevCmds.length + idx;
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => cmd.action()}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                          isSelected ? 'bg-[#30363d]' : 'hover:bg-[#21262d]'
                        }`}
                      >
                        <span className="text-xl">{cmd.icon}</span>
                        <span className={`flex-1 text-left ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {cmd.title}
                        </span>
                        {cmd.shortcut && (
                          <kbd className="px-2 py-1 bg-[#0d1117] border border-[#30363d] rounded text-xs text-gray-400">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#30363d] px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>{filteredCommands.length} commands available</span>
        </div>
      </div>
    </div>
  );
}
