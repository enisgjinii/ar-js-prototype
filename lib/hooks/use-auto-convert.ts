'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook to automatically convert GLB to USDZ after upload
 */
export function useAutoConvert(modelId: string | null) {
    const [converting, setConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!modelId) return;

        const convertModel = async () => {
            setConverting(true);
            setError(null);

            try {
                const supabase = createClient();

                // Get model details
                const { data: model, error: fetchError } = await supabase
                    .from('models')
                    .select('file_url, auto_convert_usdz, usdz_url')
                    .eq('id', modelId)
                    .single();

                if (fetchError) throw fetchError;

                // Skip if already has USDZ or auto-convert is disabled
                if (model.usdz_url || !model.auto_convert_usdz) {
                    setConverting(false);
                    return;
                }

                // Update status to converting
                await supabase
                    .from('models')
                    .update({ conversion_status: 'converting' })
                    .eq('id', modelId);

                // Call conversion API
                const response = await fetch('/api/convert-model', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        modelId,
                        glbUrl: model.file_url
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Conversion failed');
                }

                // Update status to completed
                await supabase
                    .from('models')
                    .update({ conversion_status: 'completed' })
                    .eq('id', modelId);

                setSuccess(true);
            } catch (err: any) {
                console.error('Conversion error:', err);
                setError(err.message);

                // Update status to failed
                const supabase = createClient();
                await supabase
                    .from('models')
                    .update({ conversion_status: 'failed' })
                    .eq('id', modelId);
            } finally {
                setConverting(false);
            }
        };

        convertModel();
    }, [modelId]);

    return { converting, error, success };
}
