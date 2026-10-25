"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/75 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-6 py-3.5 flex justify-between items-center">
        <Link href="/" className="font-extrabold text-xl tracking-tight text-white hover:text-blue-400 transition-colors">
          Personal<span className="text-blue-500">Hub</span>
        </Link>
        <div className="flex items-center gap-3 text-sm font-medium">
          <Button asChild variant="ghost" size="sm">
            <Link href="/todos">
              <Calendar className="h-4 w-4 text-blue-400" />
              Calendar
            </Link>
          </Button>

          {profileStatus === 'ready' && profile?.role === 'admin' && (
            <Button asChild variant="outline" size="sm" className="border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 rounded-full">
              <Link href="/admin">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </Link>
            </Button>
          )}

          {status === 'loading' ? (
            <Badge variant="outline" className="text-gray-400">Checking session…</Badge>
          ) : status === 'authenticated' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-full text-gray-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="rounded-full border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20">
              <Link href="/auth/login">
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
