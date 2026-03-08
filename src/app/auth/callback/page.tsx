'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [debug, setDebug] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');
    
    let msg = '';
    if (code) msg = `Code received: ${code.substring(0, 10)}...`;
    if (error) msg = `Error: ${error} - ${errorDesc}`;
    setDebug(msg);

    const checkSession = setInterval(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          clearInterval(checkSession);
          router.push('/');
        }
      });
    }, 1000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        clearInterval(checkSession);
        router.push('/');
      }
    });

    return () => {
      clearInterval(checkSession);
      subscription.unsubscribe();
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-xs font-mono text-[#8b949e] uppercase tracking-[0.2em] mb-4">Finalizing Authentication...</p>
      {debug && (
        <p className="text-[10px] font-mono text-red-500">{debug}</p>
      )}
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackHandler />
    </Suspense>
  );
}
