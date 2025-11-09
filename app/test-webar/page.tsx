'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ModelViewerWebAR from '@/components/model-viewer-webar';

export default function TestWebARPage() {
    const [showAR, setShowAR] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">WebAR Test</h1>
                <p className="text-gray-400 mb-8">
                    Test the new WebAR viewer that keeps your UI visible!
                </p>

                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">What to expect:</h2>
                    <ul className="space-y-2 text-gray-300">
                        <li>✅ <strong>Android Chrome:</strong> WebXR AR - your UI stays visible!</li>
                        <li>⚠️ <strong>iOS Safari:</strong> Falls back to AR Quick Look (leaves app)</li>
                        <li>💻 <strong>Desktop:</strong> 3D preview with rotation controls</li>
                    </ul>
                </div>

                <Button
                    onClick={() => setShowAR(true)}
                    className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                    🚀 Launch WebAR Viewer
                </Button>

                <div className="mt-8 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <p className="text-sm text-blue-200">
                        <strong>Note:</strong> This uses Google's model-viewer library which automatically
                        handles WebXR on Android and falls back to native AR on iOS. It's the best free solution!
                    </p>
                </div>
            </div>

            {showAR && (
                <ModelViewerWebAR
                    modelUrl="/models/sample.glb"
                    usdzUrl="/models/sample.usdz"
                    modelTitle="Sample 3D Model"
                    onClose={() => setShowAR(false)}
                />
            )}
        </div>
    );
}
