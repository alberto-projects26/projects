'use client';

import { Github } from 'lucide-react';
import { signInWithGitHub } from '../lib/auth';

export default function AuthScreen() {
  const handleLogin = async () => {
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Github size={36} className="text-black" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Jarvis OS</h1>
          <p className="text-sm font-mono text-[#8b949e] uppercase tracking-widest">Command Center Access</p>
        </div>

        <div className="p-8 rounded-2xl border border-[#30363d] bg-[#161b22]">
          <p className="text-center text-xs text-[#8b949e] mb-8 font-mono leading-relaxed">
            AUTHORIZED PERSONNEL ONLY.<br/>
            PLEASE AUTHENTICATE TO ACCESS FLIGHT CONTROLS.
          </p>
          
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-white text-black font-black uppercase text-sm tracking-widest rounded-lg hover:bg-cyan-500 hover:text-white transition-all flex items-center justify-center gap-3"
          >
            <Github size={20} />
            Authenticate with GitHub
          </button>
        </div>

        <p className="text-center text-[10px] text-[#484f58] mt-8 font-mono">
          SECURED BY SUPABASE AUTH
        </p>
      </div>
    </div>
  );
}
