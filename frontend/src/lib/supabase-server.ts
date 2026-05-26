import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

type ServerProfile = {
  id: string;
  email: string;
  role: string;
  is_approved: boolean;
  created_at: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

function getSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are required.');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

function getApiBaseUrl() {
  const baseUrl = apiUrl || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : undefined);

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is required outside development.');
  }

  return `${baseUrl.replace(/\/+$/, '')}/api/v1`;
}

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot persist refreshed auth cookies.
        }
      },
    },
  });
}

export async function getServerUser(): Promise<User | null> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getServerProfile(): Promise<ServerProfile | null> {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  const response = await fetch(`${getApiBaseUrl()}/auth/profile-sync`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: 'no-store',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch authenticated profile.');
  }

  return response.json();
}
