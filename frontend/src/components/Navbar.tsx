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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl border border-[#b6e2cf] bg-[#e6f4ee] flex items-center justify-center shadow-sm group-hover:bg-[#d6ede3] transition-colors">
            <Leaf className="h-4 w-4 text-[#18865b]" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#191f28]">
            Personal<span className="text-[#18865b]">Hub</span>
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
              <Calendar className="h-4 w-4 text-[#18865b]" />
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
                <ShieldCheck className="h-3.5 w-3.5 text-[#18865b]" />
                Admin
              </Link>
            </Button>
          )}

          {status === 'loading' ? (
            <Badge variant="outline" className="py-1 px-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#18865b] animate-pulse" />
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
