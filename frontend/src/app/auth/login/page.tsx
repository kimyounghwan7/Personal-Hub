import { redirect } from 'next/navigation';
import LoginPageClient from '@/components/LoginPageClient';
import { normalizeNextPath } from '@/lib/auth-paths';
import { getServerUser } from '@/lib/supabase-server';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const nextPath = normalizeNextPath(searchParams?.next);
  const user = await getServerUser();

  if (user) {
    redirect(nextPath);
  }

  return <LoginPageClient nextPath={nextPath} />;
}
