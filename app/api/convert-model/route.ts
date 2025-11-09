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

            return NextResponse.json(
                {
                    error: conversionError.message || 'Conversion failed',
                    details: 'Check server logs for more information',
                    modelId,
                },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('❌ API error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Conversion failed',
                details: 'Check server logs for more information',
            },
            { status: 500 }
        );
    }
}

/**
 * Convert GLB to USDZ using available methods
 */
async function convertGLBtoUSDZ(glbUrl: string): Promise<Buffer> {
    const errors: string[] = [];

    // Method 1: Three.js (JavaScript-based, works everywhere)
    if (process.env.USE_THREEJS_CONVERTER !== 'false') {
        console.log('🎨 Trying Three.js converter...');
        try {
            return await convertWithThreeJS(glbUrl);
        } catch (error: any) {
            console.warn('⚠️ Three.js conversion failed:', error.message);
            errors.push(`Three.js: ${error.message}`);
            // Continue to other methods
        }
    }

    // Method 2: External Conversion API (if configured)
    if (process.env.CONVERSION_API_URL && process.env.CONVERSION_API_KEY) {
        console.log('📡 Trying external conversion API...');
        try {
            return await convertWithExternalAPI(glbUrl);
        } catch (error: any) {
            console.warn('⚠️ External API conversion failed:', error.message);
            errors.push(`External API: ${error.message}`);
        }
    }

    // Method 3: Reality Converter CLI (Mac only)
    if (process.platform === 'darwin') {
        console.log('🍎 Trying Reality Converter CLI (Mac)...');
        try {
            return await convertWithRealityConverter(glbUrl);
        } catch (error: any) {
            console.warn('⚠️ Reality Converter failed:', error.message);
            errors.push(`Reality Converter: ${error.message}`);
        }
    }

    // No conversion method worked
    const errorMessage = errors.length > 0
        ? `All conversion methods failed:\n${errors.join('\n')}`
        : 'No conversion method available';

    throw new Error(errorMessage);
}

/**
 * Convert using Three.js and USDZExporter
 */
async function convertWithThreeJS(glbUrl: string): Promise<Buffer> {
    try {
        console.log('📥 Downloading GLB file from:', glbUrl);

        // Fetch GLB file
        const response = await fetch(glbUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch GLB: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        console.log(`✅ Downloaded ${arrayBuffer.byteLength} bytes`);

        console.log('📦 Loading Three.js modules...');

        // Polyfill browser globals for Node.js environment
        // USDZExporter expects these to exist
        if (typeof self === 'undefined') {
            (global as any).self = global;
        }
        if (typeof window === 'undefined') {
            (global as any).window = global;
        }
        if (typeof document === 'undefined') {
            (global as any).document = {
                createElement: () => ({}),
                createElementNS: () => ({}),
            };
        }

        // Dynamic import Three.js
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { USDZExporter } = await import('three/examples/jsm/exporters/USDZExporter.js');

        console.log('✅ Three.js modules loaded');
        console.log('📦 Parsing GLB with GLTFLoader...');

        // Parse GLB using GLTFLoader
        const loader = new GLTFLoader();
        const gltf = await new Promise<any>((resolve, reject) => {
            loader.parse(
                arrayBuffer,
                '',
                (gltf: any) => {
                    console.log('✅ GLB parsed successfully');
                    resolve(gltf);
                },
                (error: any) => {
                    console.error('❌ GLB parsing error:', error);
                    reject(error);
                }
            );
        });

        console.log('✨ Exporting to USDZ format...');

        // Export to USDZ
        const exporter = new USDZExporter();
        const usdzArrayBuffer = await exporter.parseAsync(gltf.scene);

        console.log(`✅ USDZ export complete! Size: ${usdzArrayBuffer.byteLength} bytes`);

        return Buffer.from(usdzArrayBuffer);
    } catch (error: any) {
        console.error('❌ Three.js conversion error:', error);

        // Provide more specific error messages
        if (error.message?.includes('fetch')) {
            throw new Error(`Failed to download GLB file: ${error.message}`);
        } else if (error.message?.includes('parse')) {
            throw new Error(`Failed to parse GLB file: ${error.message}`);
        } else if (error.message?.includes('Cannot find module')) {
            throw new Error('Three.js modules not found. Run: npm install three@latest');
        } else {
            throw new Error(`Three.js conversion failed: ${error.message}`);
        }
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
