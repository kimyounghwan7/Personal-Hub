"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Leaf, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, profileStatus, status } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
    router.refresh();
  };

  const isTodosActive = pathname?.startsWith('/todos');
  const isAdminActive = pathname?.startsWith('/admin');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-200/10 bg-[#070c0a]/80 backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl border border-[#8ee3be]/35 bg-[#8ee3be]/15 flex items-center justify-center shadow-[0_0_20px_rgba(142,227,190,0.2)] group-hover:bg-[#8ee3be]/25 transition-colors">
            <Leaf className="h-4 w-4 text-[#8ee3be]" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            Personal<span className="text-[#8ee3be]">Hub</span>
          </span>
        </Link>

        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Button
            asChild
            variant={isTodosActive ? 'secondary' : 'ghost'}
            size="sm"
            className="rounded-full px-3.5"
          >
            <Link href="/todos">
              <Calendar className="h-4 w-4 text-[#8ee3be]" />
              Workspace
            </Link>
          </Button>

          {profileStatus === 'ready' && profile?.role === 'admin' && (
            <Button
              asChild
              variant={isAdminActive ? 'secondary' : 'outline'}
              size="sm"
              className="rounded-full px-3.5"
            >
              <Link href="/admin">
                <ShieldCheck className="h-3.5 w-3.5 text-[#8ee3be]" />
                Admin
              </Link>
            </Button>
          )}

          {status === 'loading' ? (
            <Badge variant="outline" className="py-1 px-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8ee3be] animate-pulse" />
              Syncing…
            </Badge>
          ) : status === 'authenticated' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-full px-3.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          ) : (
            <Button asChild variant="default" size="sm" className="rounded-full px-4">
              <Link href="/auth/login">
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
