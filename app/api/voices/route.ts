import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/voices
 * Fetch all active voices
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: voices, error } = await supabase
      .from('voices')
      .select('id, name, description, file_url, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching voices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch voices' },
        { status: 500 }
      );
    }

    return NextResponse.json({ voices: voices || [] });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
