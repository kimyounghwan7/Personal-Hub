import { redirect } from 'next/navigation';
import TodosPageClient from '@/components/TodosPageClient';
import { buildLoginPath } from '@/lib/auth-paths';
import { getServerUser } from '@/lib/supabase-server';

export default async function TodosPage() {
  const user = await getServerUser();

  if (!user) {
    redirect(buildLoginPath('/todos'));
  }

  return <TodosPageClient />;
}
