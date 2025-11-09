import { createClient } from '@/lib/supabase/server';
import ARModelViewer from '@/components/ar-model-viewer';
import { redirect } from 'next/navigation';

interface PageProps {
    searchParams: { model?: string };
}

export default async function ARViewerPage({ searchParams }: PageProps) {
    const supabase = await createClient();

    // Fetch all active models with USDZ URLs
    const { data: models, error } = await supabase
        .from('models')
        .select('id, name, description, file_url, usdz_url, file_type, is_active, conversion_status')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching models:', error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Error Loading Models</h1>
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
        <ARModelViewer
            models={models}
            selectedModelId={searchParams.model}
        />
    );
}
