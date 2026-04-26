"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/60 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" className="font-extrabold text-xl tracking-tight text-white hover:text-blue-400 transition-colors">
          Personal<span className="text-blue-500">Hub</span>
        </a>
        <div className="flex items-center gap-4 text-sm font-medium">
          <a href="/todos" className="text-gray-300 hover:text-white transition-colors">Calendar</a>
          <a href="/admin" className="text-purple-400 hover:text-purple-300 transition-colors border border-purple-500/30 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20">Admin</a>

          {user ? (
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10"
            >
              Logout
            </button>
          ) : (
            <a
              href="/auth/login"
              className="text-blue-400 hover:text-blue-300 transition-colors border border-blue-500/30 px-3 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
