'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ThreeJSWebXRAR from '@/components/threejs-webxr-ar';

export default function TestThreeJSARPage() {
    const [showAR, setShowAR] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">Three.js WebXR AR Test</h1>
                <p className="text-gray-400 mb-8">
                    Pure Three.js implementation with WebXR for Android Chrome
                </p>

                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">What to expect:</h2>
                    <ul className="space-y-2 text-gray-300">
                        <li>✅ <strong>Android Chrome (WebXR enabled):</strong> Full AR in browser - UI stays visible!</li>
                        <li>⚠️ <strong>Android Chrome (WebXR disabled):</strong> 3D preview only, enable flags</li>
                        <li>❌ <strong>iOS Safari:</strong> Not supported (Apple blocks WebXR)</li>
                        <li>💻 <strong>Desktop:</strong> 3D preview with rotation controls</li>
                    </ul>
                </div>

                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold mb-3">Three.js Features:</h3>
                    <ul className="space-y-2 text-sm text-blue-200">
                        <li>• <strong>Hit Testing:</strong> Detect real-world surfaces</li>
                        <li>• <strong>Tap to Place:</strong> Place multiple models</li>
                        <li>• <strong>Reticle:</strong> Visual indicator for placement</li>
                        <li>• <strong>Shadows:</strong> Realistic lighting</li>
                        <li>• <strong>Full Control:</strong> Complete Three.js scene access</li>
                    </ul>
                </div>

                <Button
                    onClick={() => setShowAR(true)}
                    className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mb-6"
                >
                    🚀 Launch Three.js AR
                </Button>

                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-semibold mb-2 text-yellow-200">⚠️ Requirements:</h3>
                    <ul className="text-xs text-yellow-200 space-y-1">
                        <li>• Android device with Chrome 90+</li>
                        <li>• WebXR flags enabled (chrome://flags)</li>
                        <li>• Camera permission granted</li>
                        <li>• ARCore installed (Google Play Services for AR)</li>
                    </ul>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-2">Enable WebXR:</h3>
                    <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                        <li>Open Chrome and go to: <code className="bg-gray-700 px-1 rounded">chrome://flags</code></li>
                        <li>Search for "webxr"</li>
                        <li>Enable: WebXR Incubations, WebXR AR Module, WebXR Hit Test</li>
                        <li>Tap "Relaunch" button</li>
                        <li>Come back and test again</li>
                    </ol>
                </div>

                <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2 text-green-200">✅ Advantages:</h3>
                    <ul className="text-xs text-green-200 space-y-1">
                        <li>• Full control over AR experience</li>
                        <li>• Custom interactions and animations</li>
                        <li>• Multiple model placement</li>
                        <li>• Advanced Three.js features</li>
                        <li>• No external dependencies (besides Three.js)</li>
                    </ul>
                </div>
            </div>

            {showAR && (
                <ThreeJSWebXRAR
                    modelUrl="/models/Cesium_Man.glb"
                    modelTitle="Cesium Man - WebXR AR"
                    onClose={() => setShowAR(false)}
                />
            )}
        </div>
    );
}
