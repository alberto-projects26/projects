import { signIn } from '@/auth';
import { redirect } from 'next/navigation';

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const error = searchParams?.error;
  
  async function handleLogin(formData: FormData) {
    'use server';
    const password = formData.get('password') as string;
    
    const result = await signIn('credentials', {
      password,
      redirect: false,
    });
    
    if (result?.error) {
      redirect('/login?error=invalid');
    }
    
    redirect('/');
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
      <div className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-3xl">🚀</span>
          </div>
          <div>
            <span className="font-bold text-2xl text-white">Mission</span>
            <span className="font-bold text-2xl text-cyan-400">Control</span>
          </div>
        </div>
        
        {/* Login Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-white text-center mb-6">
            Secure Access Required
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              ⚠️ Invalid credentials. Please try again.
            </div>
          )}
          
          <form action={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Access Code
              </label>
              <input
                type="password"
                name="password"
                autoFocus
                className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-gray-600 font-mono"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-gray-600 mt-2">
                Default: "missioncontrol2025" (change in .env.local)
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
            >
              🚀 Initialize Session
            </button>
          </form>
          
          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-[#30363d] text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>System Secured • Tailscale Network</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          Unauthorized access prohibited.<br/>
          All activities are monitored and logged.
        </p>
      </div>
    </div>
  );
}
