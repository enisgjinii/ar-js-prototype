import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API endpoint to convert GLB to USDZ
 * This runs server-side and stores both formats in Supabase
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

        // Fetch the GLB file
        const glbResponse = await fetch(glbUrl);
        if (!glbResponse.ok) {
            throw new Error('Failed to fetch GLB file');
        }

        const glbBuffer = await glbResponse.arrayBuffer();

        // Convert GLB to USDZ using external service or local conversion
        // For now, we'll use a conversion service API
        const usdzBuffer = await convertGLBtoUSDZ(glbBuffer);

        // Generate USDZ filename
        const glbFilename = glbUrl.split('/').pop() || 'model.glb';
        const usdzFilename = glbFilename.replace(/\.glb$/i, '.usdz');
        const usdzPath = `models/${Date.now()}-${usdzFilename}`;

        // Upload USDZ to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('models')
            .upload(usdzPath, usdzBuffer, {
                contentType: 'model/vnd.usdz+zip',
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        // Get public URL for USDZ
        const { data: urlData } = supabase.storage
            .from('models')
            .getPublicUrl(usdzPath);

        const usdzUrl = urlData.publicUrl;

        // Update model record with USDZ URL
        const { error: updateError } = await supabase
            .from('models')
            .update({
                usdz_url: usdzUrl,
                usdz_path: usdzPath,
                updated_at: new Date().toISOString()
            })
            .eq('id', modelId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            usdzUrl,
            message: 'GLB converted to USDZ successfully'
        });

    } catch (error: any) {
        console.error('Conversion error:', error);
        return NextResponse.json(
            { error: error.message || 'Conversion failed' },
            { status: 500 }
        );
    }
}

/**
 * Convert GLB to USDZ
 * This uses an external conversion service
 */
async function convertGLBtoUSDZ(glbBuffer: ArrayBuffer): Promise<Buffer> {
    // Option 1: Use external conversion API (recommended for production)
    if (process.env.CONVERSION_API_URL) {
        const formData = new FormData();
        formData.append('file', new Blob([glbBuffer]), 'model.glb');

        const response = await fetch(process.env.CONVERSION_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CONVERSION_API_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('External conversion service failed');
        }

        const usdzBuffer = await response.arrayBuffer();
        return Buffer.from(usdzBuffer);
    }

    // Option 2: Use local conversion (Mac only with Reality Converter CLI)
    if (process.platform === 'darwin') {
        return await convertLocallyMac(glbBuffer);
    }

    // Option 3: Use Python USD library (if available)
    if (process.env.PYTHON_USD_AVAILABLE === 'true') {
        return await convertWithPythonUSD(glbBuffer);
    }

    // Fallback: Return original GLB (will need manual conversion)
    throw new Error('No conversion method available. Please set up a conversion service.');
}

/**
 * Convert using Reality Converter CLI (Mac only)
 */
async function convertLocallyMac(glbBuffer: ArrayBuffer): Promise<Buffer> {
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
        // Write GLB to temp file
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
 * Convert using Python USD library
 */
async function convertWithPythonUSD(glbBuffer: ArrayBuffer): Promise<Buffer> {
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
        // Write GLB to temp file
        await fs.writeFile(inputPath, Buffer.from(glbBuffer));

        // Convert using Python script
        const pythonScript = `
import sys
from pxr import Usd, UsdGeom, Gf
# Add conversion logic here
`;

        await execAsync(`python3 -c "${pythonScript}" "${inputPath}" "${outputPath}"`);

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
