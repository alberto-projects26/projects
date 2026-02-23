'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const VALID_PASSWORD = 'missioncontrol2025';
const AUTH_KEY = 'mc_auth';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === 'true') {
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === VALID_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true');
      setAuthenticated(true);
      setError('');
    } else {
      setError('Invalid access code');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setPassword('');
  };

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Initializing...</div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <div className="w-full max-w-md p-8">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-3xl">🚀</span>
            </div>
            <div>
              <span className="font-bold text-2xl text-white">Mission</span>
              <span className="font-bold text-2xl text-cyan-400">Control</span>
            </div>
          </div>
          
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-2xl">
            <h1 className="text-xl font-bold text-white text-center mb-6">
              Secure Access Required
            </h1>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                ⚠️ {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Access Code
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
              >
                🚀 Initialize Session
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show children with logout option
  return (
    <>
      {children}
      {/* Logout button in corner */}
      <button
        onClick={handleLogout}
        className="fixed bottom-4 right-4 px-4 py-2 bg-[#161b22] border border-[#30363d] text-gray-400 text-xs rounded-lg hover:text-red-400 transition-colors"
      >
        Logout
      </button>
    </>
  );
}
