import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ARPage() {
  const supabase = await createClient();

  // Fetch first active model
  const { data: models } = await supabase
    .from('models')
    .select('id')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1);

  // Redirect to AR viewer with first model
  if (models && models.length > 0) {
    redirect(`/ar-viewer?model=${models[0].id}`);
  }

  // If no models, redirect to AR viewer (will show empty state)
  redirect('/ar-viewer');
}
