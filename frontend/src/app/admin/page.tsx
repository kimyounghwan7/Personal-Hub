import { redirect } from 'next/navigation';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import { buildLoginPath } from '@/lib/auth-paths';
import { getServerProfile, getServerUser } from '@/lib/supabase-server';

export default async function AdminPage() {
  const user = await getServerUser();

  if (!user) {
    redirect(buildLoginPath('/admin'));
  }

  try {
    const profile = await getServerProfile();

    if (!profile) {
      redirect(buildLoginPath('/admin'));
    }

    if (profile.role !== 'admin') {
      redirect('/todos');
    }
  } catch {
    // Fall back to the client dashboard error state if the backend profile check is temporarily unavailable.
  }

  return <AdminDashboardClient />;
}
