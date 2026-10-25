"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Leaf, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

const GENERIC_SIGN_IN_ERROR = 'Authentication failed. Please check your credentials and try again.';
const GENERIC_SIGN_UP_ERROR = 'Unable to complete sign up right now. Please try again.';
const SIGN_UP_CONFIRMATION_MESSAGE =
  'Registration submitted. Check your email for verification, then wait for administrator approval.';

function getSafeAuthMessage(isSignUp: boolean) {
  return isSignUp ? GENERIC_SIGN_UP_ERROR : GENERIC_SIGN_IN_ERROR;
}

export default function LoginPageClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const { status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'error' | 'success'>('error');

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(nextPath);
      router.refresh();
    }
  }, [nextPath, router, status]);

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const hasRealUser = Boolean(data.user?.id) && (data.user?.identities?.length ?? 0) > 0;

        if (data.session && hasRealUser) {
          router.replace(nextPath);
          router.refresh();
        } else {
          setMessageTone('success');
          setMessage(SIGN_UP_CONFIRMATION_MESSAGE);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        router.replace(nextPath);
        router.refresh();
      }
    } catch {
      setMessageTone('error');
      setMessage(getSafeAuthMessage(isSignUp));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setMessage('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${nextPath}`,
        scopes: 'https://www.googleapis.com/auth/calendar',
      },
    });

    if (error) {
      setMessageTone('error');
      setMessage(GENERIC_SIGN_IN_ERROR);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 pt-20 pb-12 bg-subtle-grid overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[280px] rounded-full bg-[#8ee3be]/12 blur-[120px] pointer-events-none" />

      <Card className="relative z-10 w-full max-w-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#8ee3be] to-transparent opacity-80" />

        <CardHeader className="text-center pb-4 pt-7">
          <div className="mx-auto mb-3 h-11 w-11 rounded-2xl border border-[#8ee3be]/35 bg-[#8ee3be]/15 flex items-center justify-center shadow-[0_0_24px_rgba(142,227,190,0.25)]">
            <Leaf className="h-5 w-5 text-[#8ee3be]" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="pt-1">
            {isSignUp
              ? 'Register for Personal Hub (requires administrator approval)'
              : 'Sign in to access your tasks and calendar workspace'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-emerald-200/10">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setMessage('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-[#8ee3be] text-[#062016] shadow-sm'
                  : 'text-emerald-100/65 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setMessage('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                isSignUp
                  ? 'bg-[#8ee3be] text-[#062016] shadow-sm'
                  : 'text-emerald-100/65 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-11"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-emerald-200/10" />
            <span className="text-emerald-100/40 text-[11px] uppercase tracking-widest">
              or email
            </span>
            <div className="flex-1 h-px bg-emerald-200/10" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-emerald-50/90">
                <Mail className="h-3.5 w-3.5 text-[#8ee3be]" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="flex items-center gap-1.5 text-emerald-50/90">
                <KeyRound className="h-3.5 w-3.5 text-[#8ee3be]" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11">
              {loading ? 'Processing…' : isSignUp ? 'Create Account' : 'Sign In to Workspace'}
            </Button>
          </form>

          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs leading-relaxed text-center ${
                messageTone === 'success'
                  ? 'bg-[#8ee3be]/12 text-[#bbf7d0] border border-[#8ee3be]/30'
                  : 'bg-rose-500/12 text-rose-200 border border-rose-400/30'
              }`}
            >
              {message}
            </div>
          )}

          <div className="pt-2 flex items-center justify-center">
            <Badge variant="outline" className="text-[11px] font-normal py-1 px-3">
              <ShieldCheck className="h-3.5 w-3.5 text-[#8ee3be]" />
              Protected by Supabase Auth &amp; Admin RBAC
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
