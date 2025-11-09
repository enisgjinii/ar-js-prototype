import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API endpoint to convert GLB to USDZ
 * Uses Three.js for JavaScript-based conversion
 */
export async function POST(request: NextRequest) {
    try {
        const { modelId, glbUrl } = await request.json();

        if (!modelId || !glbUrl) {
            return NextResponse.json(
                { error: 'modelId and glbUrl are required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Update status to converting
        await supabase
            .from('models')
            .update({ conversion_status: 'converting' })
            .eq('id', modelId);

        console.log('🔄 Starting GLB to USDZ conversion for model:', modelId);

        try {
            // Convert using available method
            const usdzBuffer = await convertGLBtoUSDZ(glbUrl);

            // Generate USDZ filename
            const glbFilename = glbUrl.split('/').pop() || 'model.glb';
            const usdzFilename = glbFilename.replace(/\.glb$/i, '.usdz');
            const usdzPath = `models/${Date.now()}-${usdzFilename}`;

            // Upload USDZ to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('models')
                .upload(usdzPath, usdzBuffer, {
                    contentType: 'model/vnd.usdz+zip',
                    upsert: false,
                });

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL for USDZ
            const {
                data: { publicUrl },
            } = supabase.storage.from('models').getPublicUrl(usdzPath);

            // Update model record with USDZ URL
            const { error: updateError } = await supabase
                .from('models')
                .update({
                    usdz_url: publicUrl,
                    usdz_path: usdzPath,
                    conversion_status: 'completed',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', modelId);

            if (updateError) {
                throw updateError;
            }

            console.log('✅ Conversion completed:', publicUrl);

            return NextResponse.json({
                success: true,
                usdzUrl: publicUrl,
                message: 'GLB converted to USDZ successfully',
            });
        } catch (conversionError: any) {
            console.error('❌ Conversion failed:', conversionError);

            // Update status to failed
            await supabase
                .from('models')
                .update({
                    conversion_status: 'failed',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', modelId);

            throw conversionError;
        }
    } catch (error: any) {
        console.error('Conversion error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Conversion failed',
                details: 'Install three.js: npm install three@latest',
            },
            { status: 500 }
        );
    }
}

/**
 * Convert GLB to USDZ using available methods
 */
async function convertGLBtoUSDZ(glbUrl: string): Promise<Buffer> {
    // Method 1: Three.js (JavaScript-based, works everywhere)
    if (process.env.USE_THREEJS_CONVERTER !== 'false') {
        console.log('🎨 Using Three.js converter');
        try {
            return await convertWithThreeJS(glbUrl);
        } catch (error: any) {
            console.warn('Three.js conversion failed:', error.message);
            // Continue to other methods
        }
    }

    // Method 2: External Conversion API (if configured)
    if (process.env.CONVERSION_API_URL && process.env.CONVERSION_API_KEY) {
        console.log('📡 Using external conversion API');
        return await convertWithExternalAPI(glbUrl);
    }

    // Method 3: Reality Converter CLI (Mac only)
    if (process.platform === 'darwin') {
        console.log('🍎 Using Reality Converter CLI (Mac)');
        return await convertWithRealityConverter(glbUrl);
    }

    // No conversion method available
    throw new Error(
        'No conversion method available. Install three.js: npm install three@latest'
    );
}

/**
 * Convert using Three.js and USDZExporter
 */
async function convertWithThreeJS(glbUrl: string): Promise<Buffer> {
    try {
        // Dynamic import Three.js
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { USDZExporter } = await import('three/examples/jsm/exporters/USDZExporter.js');

        console.log('📥 Downloading GLB file...');

        // Fetch GLB file
        const response = await fetch(glbUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch GLB: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();

        console.log('📦 Parsing GLB with Three.js...');

        // Parse GLB using GLTFLoader
        const loader = new GLTFLoader();
        const gltf = await new Promise<any>((resolve, reject) => {
            loader.parse(
                arrayBuffer,
                '',
                (gltf: any) => resolve(gltf),
                (error: any) => reject(error)
            );
        });

        console.log('✨ Exporting to USDZ...');

        // Export to USDZ
        const exporter = new USDZExporter();
        const usdzArrayBuffer = await exporter.parseAsync(gltf.scene);

        console.log('✅ Three.js conversion complete!');

        return Buffer.from(usdzArrayBuffer);
    } catch (error: any) {
        console.error('Three.js conversion error:', error);
        throw new Error(`Three.js conversion failed: ${error.message}. Make sure three.js is installed: npm install three@latest`);
    }
}

/**
 * Convert using external API service
 */
async function convertWithExternalAPI(glbUrl: string): Promise<Buffer> {
    const response = await fetch(process.env.CONVERSION_API_URL!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CONVERSION_API_KEY}`,
        },
        body: JSON.stringify({
            inputUrl: glbUrl,
            outputFormat: 'usdz',
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`External API failed: ${error}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Convert using Reality Converter CLI (Mac only)
 */
async function convertWithRealityConverter(glbUrl: string): Promise<Buffer> {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    const fs = require('fs').promises;
    const path = require('path');
    const os = require('os');

    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input-${Date.now()}.glb`);
    const outputPath = path.join(tmpDir, `output-${Date.now()}.usdz`);

    try {
        // Download GLB file
        const glbResponse = await fetch(glbUrl);
        if (!glbResponse.ok) {
            throw new Error('Failed to download GLB file');
        }
        const glbBuffer = await glbResponse.arrayBuffer();
        await fs.writeFile(inputPath, Buffer.from(glbBuffer));

        // Convert using Reality Converter CLI
        await execAsync(`xcrun usdz_converter "${inputPath}" "${outputPath}"`);

        // Read USDZ file
        const usdzBuffer = await fs.readFile(outputPath);

        // Cleanup
        await fs.unlink(inputPath).catch(() => { });
        await fs.unlink(outputPath).catch(() => { });

        return usdzBuffer;
    } catch (error) {
        // Cleanup on error
        await fs.unlink(inputPath).catch(() => { });
        await fs.unlink(outputPath).catch(() => { });
        throw error;
    }
}

/**
 * GET endpoint to check conversion status
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
        return NextResponse.json({ error: 'modelId required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: model, error } = await supabase
        .from('models')
        .select('conversion_status, usdz_url')
        .eq('id', modelId)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        status: model.conversion_status,
        usdzUrl: model.usdz_url,
    });
}
