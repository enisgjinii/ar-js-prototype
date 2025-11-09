import { createClient } from '@/lib/supabase/server';
import ARModelGallery from '@/components/ar-model-gallery';
import { Button } from '@/components/ui/button';
import { Box } from 'lucide-react';
import Link from 'next/link';

export default async function ModelsGalleryPage() {
    const supabase = await createClient();

    const { data: models, error } = await supabase
        .from('models')
        .select('id, name, description, file_url, usdz_url, file_type, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching models:', error);
    }

    // Transform to AR model format
    const arModels = models?.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description || '',
        glbUrl: model.file_url,
        category: model.file_type.toUpperCase()
    })) || [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">3D Model Gallery</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                View our collection of 3D models in augmented reality
                            </p>
                        </div>
                        <Link href="/">
                            <Button variant="outline">← Home</Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {arModels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Box className="h-20 w-20 text-gray-400 mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">No Models Yet</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                            No 3D models have been published yet. Check back soon!
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <p className="text-gray-600 dark:text-gray-400">
                                {arModels.length} model{arModels.length !== 1 ? 's' : ''} available
                            </p>
                        </div>
                        <ARModelGallery
                            models={arModels}
                            columns={3}
                            showCategory
                        />
                    </>
                )}
            </div>
        </div>
    );
}
