import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Use AssemblyAI free tier for transcription
        const assemblyAIKey = process.env.ASSEMBLYAI_API_KEY;

        if (!assemblyAIKey) {
            return NextResponse.json(
                {
                    error: 'AssemblyAI API key not configured',
                    message: 'Please add ASSEMBLYAI_API_KEY to your .env.local file. Get a free key at https://www.assemblyai.com/dashboard/signup'
                },
                { status: 400 }
            );
        }

        // Step 1: Upload file to AssemblyAI
        const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
            method: 'POST',
            headers: {
                'authorization': assemblyAIKey,
            },
            body: await file.arrayBuffer(),
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload file to AssemblyAI');
        }

        const { upload_url } = await uploadResponse.json();

        // Step 2: Request transcription
        const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
            method: 'POST',
            headers: {
                'authorization': assemblyAIKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                audio_url: upload_url,
                language_code: 'en',
            }),
        });

        if (!transcriptResponse.ok) {
            throw new Error('Failed to request transcription');
        }

        const { id } = await transcriptResponse.json();

        // Step 3: Poll for transcription result
        let transcript;
        let attempts = 0;
        const maxAttempts = 60; // 60 seconds max wait

        while (attempts < maxAttempts) {
            const pollingResponse = await fetch(
                `https://api.assemblyai.com/v2/transcript/${id}`,
                {
                    headers: {
                        'authorization': assemblyAIKey,
                    },
                }
            );

            const result = await pollingResponse.json();

            if (result.status === 'completed') {
                transcript = result.text;
                break;
            } else if (result.status === 'error') {
                throw new Error(result.error || 'Transcription failed');
            }

            // Wait 1 second before polling again
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        if (!transcript) {
            throw new Error('Transcription timeout');
        }

        return NextResponse.json({
            transcript,
            method: 'assemblyai'
        });

    } catch (error) {
        console.error('Transcription error:', error);
        return NextResponse.json(
            {
                error: 'Transcription failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
