"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const { profile, profileStatus, status } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/60 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-extrabold text-xl tracking-tight text-white hover:text-blue-400 transition-colors">
          Personal<span className="text-blue-500">Hub</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/todos" className="text-gray-300 hover:text-white transition-colors">
            Calendar
          </Link>

          {profileStatus === 'ready' && profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="text-purple-400 hover:text-purple-300 transition-colors border border-purple-500/30 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20"
            >
              Admin
            </Link>
          )}

          {status === 'loading' ? (
            <span className="text-xs text-gray-500">Checking session…</span>
          ) : status === 'authenticated' ? (
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="text-blue-400 hover:text-blue-300 transition-colors border border-blue-500/30 px-3 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
