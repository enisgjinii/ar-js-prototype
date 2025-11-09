import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/admin/sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const userData = {
    email: user.email,
    full_name:
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name,
    avatar_url:
      profile?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture,
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 flex-shrink-0">
        <Sidebar user={userData} />
      </div>
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
