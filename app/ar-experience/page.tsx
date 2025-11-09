import { createClient } from '@/lib/supabase/server';
import ARViewerWithAudio from '@/components/ar-viewer-with-audio';

interface PageProps {
    searchParams: { model?: string };
}

export default async function ARExperiencePage({ searchParams }: PageProps) {
    const supabase = await createClient();

    // Fetch all active models
    const { data: models, error: modelsError } = await supabase
        .from('models')
        .select('id, name, description, file_url, usdz_url, file_type, is_active, conversion_status')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    // Fetch all active voices
    const { data: voices, error: voicesError } = await supabase
        .from('voices')
        .select('id, name, description, file_url, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (modelsError || voicesError) {
        console.error('Error fetching data:', modelsError || voicesError);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Error Loading Content</h1>
                    <p className="text-gray-600">Please try again later.</p>
                </div>
            </div>
        );
    }

    // If no models available, show message
    if (!models || models.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">No Models Available</h1>
                    <p className="text-gray-600">
                        No 3D models have been published yet.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ARViewerWithAudio
            models={models}
            voices={voices || []}
            selectedModelId={searchParams.model}
        />
    );
}
