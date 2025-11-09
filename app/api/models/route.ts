import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/models
 * Fetch all active 3D models
 */
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: models, error } = await supabase
            .from('models')
            .select('id, name, description, file_url, usdz_url, file_type, is_active')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching models:', error);
            return NextResponse.json(
                { error: 'Failed to fetch models' },
                { status: 500 }
            );
        }

        return NextResponse.json({ models: models || [] });
    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
