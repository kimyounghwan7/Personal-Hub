import { createBrowserClient } from '@supabase/ssr';
import type { Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are required.');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

const { supabaseUrl: browserSupabaseUrl, supabaseAnonKey: browserSupabaseAnonKey } = getSupabaseEnv();

export const supabase = createBrowserClient(browserSupabaseUrl, browserSupabaseAnonKey);

let currentSession: Session | null = null;
let sessionInitialized = false;
let sessionRequest: Promise<Session | null> | null = null;
let authListenerInitialized = false;
const sessionListeners = new Set<(session: Session | null) => void>();
const SESSION_REFRESH_BUFFER_MS = 30_000;

function notifySessionListeners(session: Session | null) {
  sessionListeners.forEach((listener) => listener(session));
}

function storeSession(session: Session | null) {
  currentSession = session;
  sessionInitialized = true;
  notifySessionListeners(session);
}

function isSessionFresh(session: Session | null) {
  if (!session?.expires_at) {
    return false;
  }

  return session.expires_at * 1000 > Date.now() + SESSION_REFRESH_BUFFER_MS;
}

function ensureAuthStateListener() {
  if (authListenerInitialized || typeof window === 'undefined') {
    return;
  }

  authListenerInitialized = true;
  supabase.auth.onAuthStateChange((_event, session) => {
    storeSession(session);
  });
}

export function clearCachedSession() {
  storeSession(null);
}

export function getCachedSession() {
  return isSessionFresh(currentSession) ? currentSession : null;
}

export function getCachedAccessToken() {
  return isSessionFresh(currentSession) && currentSession ? currentSession.access_token : null;
}

export function subscribeToSessionChanges(listener: (session: Session | null) => void) {
  ensureAuthStateListener();
  sessionListeners.add(listener);

  if (sessionInitialized) {
    listener(currentSession);
  }

  return () => {
    sessionListeners.delete(listener);
  };
}

export async function getSessionSnapshot() {
  ensureAuthStateListener();

  if (sessionInitialized && isSessionFresh(currentSession)) {
    return currentSession;
  }

  if (!sessionRequest) {
    sessionRequest = supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        storeSession(session);
        return session;
      })
      .catch(() => {
        storeSession(null);
        return null;
      })
      .finally(() => {
        sessionRequest = null;
      });
  }

  return sessionRequest;
}
