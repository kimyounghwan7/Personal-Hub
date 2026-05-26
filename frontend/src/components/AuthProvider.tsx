"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import api, { isUnauthorizedError } from '@/lib/api';
import { getSessionSnapshot, subscribeToSessionChanges } from '@/lib/supabase';

type Profile = {
  id: string;
  email: string;
  role: string;
  is_approved: boolean;
  created_at: string | null;
};

type AuthContextValue = {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  session: Session | null;
  profile: Profile | null;
  profileStatus: 'idle' | 'loading' | 'ready' | 'error';
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileStatus, setProfileStatus] = useState<AuthContextValue['profileStatus']>('idle');
  const activeSessionUserIdRef = useRef<string | null>(null);
  const lastProfileUserIdRef = useRef<string | null>(null);
  const profileRequestFailedRef = useRef(false);

  const fetchProfile = useCallback(async (userId?: string) => {
    setProfileStatus('loading');

    try {
      const response = await api.post<Profile>('/auth/profile-sync');
      if (userId && (activeSessionUserIdRef.current !== userId || response.data.id !== userId)) {
        return;
      }

      lastProfileUserIdRef.current = response.data.id;
      profileRequestFailedRef.current = false;
      setProfile(response.data);
      setProfileStatus('ready');
    } catch (error) {
      if (isUnauthorizedError(error)) {
        lastProfileUserIdRef.current = null;
        profileRequestFailedRef.current = false;
        setSession(null);
        setStatus('unauthenticated');
        setProfile(null);
        setProfileStatus('idle');
        return;
      }

      profileRequestFailedRef.current = true;
      setProfile(null);
      setProfileStatus('error');
    }
  }, []);

  useEffect(() => {
    let active = true;

    const applySession = (nextSession: Session | null) => {
      if (!active) {
        return;
      }

      setSession(nextSession);

      if (!nextSession) {
        activeSessionUserIdRef.current = null;
        lastProfileUserIdRef.current = null;
        profileRequestFailedRef.current = false;
        setStatus('unauthenticated');
        setProfile(null);
        setProfileStatus('idle');
        return;
      }

      setStatus('authenticated');
      activeSessionUserIdRef.current = nextSession.user.id;

      if (lastProfileUserIdRef.current !== nextSession.user.id || profileRequestFailedRef.current) {
        void fetchProfile(nextSession.user.id);
      }
    };

    void getSessionSnapshot().then(applySession);
    const unsubscribe = subscribeToSessionChanges(applySession);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [fetchProfile]);

  const value = useMemo(
    () => ({
      status,
      session,
      profile,
      profileStatus,
      refreshProfile: () => fetchProfile(activeSessionUserIdRef.current ?? undefined),
    }),
    [fetchProfile, profile, profileStatus, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
