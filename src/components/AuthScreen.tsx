'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-black text-2xl font-black italic">J</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Jarvis OS</h1>
          <p className="text-sm font-mono text-[#8b949e] uppercase tracking-widest">Command Center Access</p>
        </div>

        <div className="p-8 rounded-2xl border border-[#30363d] bg-[#161b22]">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={['github']}
            onlyThirdPartyProviders
            redirectTo={`${window.location.origin}/auth/callback`}
          />
        </div>

        <p className="text-center text-[10px] text-[#484f58] mt-8 font-mono italic">
          &gt; AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  );
}
