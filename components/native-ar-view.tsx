'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Smartphone, Info } from 'lucide-react';

interface NativeARViewProps {
    modelUrl?: string; // URL to GLB/GLTF model
    modelTitle?: string;
    onBack?: () => void;
}

/**
 * Native AR View - Uses platform-specific AR:
 * - Android: Google AR (Scene Viewer) via intent:// URLs
 * - iOS: AR Quick Look via .usdz files
 * 
 * This provides the best AR experience on each platform.
 */
export default function NativeARView({
    modelUrl = '/models/sample.glb',
    modelTitle = '3D Model',
    onBack
}: NativeARViewProps) {
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);

        if (isIOS) {
            setPlatform('ios');
        } else if (isAndroid) {
            setPlatform('android');
        } else {
            setPlatform('other');
        }
    }, []);

    const launchAndroidAR = () => {
        try {
            // Convert GLB URL to absolute URL
            const absoluteUrl = new URL(modelUrl, window.location.origin).href;

            // Google AR Scene Viewer intent
            // This launches the native Google AR app on Android
            const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(absoluteUrl)}&mode=ar_preferred&title=${encodeURIComponent(modelTitle)}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end;`;

            console.log('🤖 Launching Android AR with URL:', intentUrl);

            // Launch the intent
            window.location.href = intentUrl;
        } catch (err: any) {
            console.error('Android AR Error:', err);
            setError('Failed to launch AR. Make sure Google Play Services for AR is installed.');
        }
    };

    const launchIOSAR = () => {
        try {
            // iOS AR Quick Look requires .usdz files
            // You need to convert your GLB to USDZ or provide USDZ URL
            const usdzUrl = modelUrl.replace(/\.(glb|gltf)$/i, '.usdz');

            console.log('🍎 Launching iOS AR Quick Look with URL:', usdzUrl);

            // Create a temporary anchor element to trigger AR Quick Look
            const anchor = document.createElement('a');
            anchor.rel = 'ar';
            anchor.href = usdzUrl;

            // Optional: Add AR Quick Look banner
            const img = document.createElement('img');
            anchor.appendChild(img);

            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
        } catch (err: any) {
            console.error('iOS AR Error:', err);
            setError('Failed to launch AR Quick Look. Make sure you have a .usdz file.');
        }
    };

    const handleLaunchAR = () => {
        setError(null);

        if (platform === 'android') {
            launchAndroidAR();
        } else if (platform === 'ios') {
            launchIOSAR();
        }
    };

    return (
        <div className="w-full h-screen relative bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
            {/* Back Button */}
            <div className="absolute top-4 left-4 z-10">
                <Button
                    onClick={onBack}
                    variant="secondary"
                    className="bg-black/50 text-white border-white/20"
                >
                    ← Back
                </Button>
            </div>

            <div className="max-w-md w-full text-center">
                {/* Platform-specific content */}
                {platform === 'android' && (
                    <div className="space-y-6">
                        <div className="bg-green-600/20 border-2 border-green-600 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                            <Smartphone className="w-12 h-12 text-green-400" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Android AR Ready
                            </h1>
                            <p className="text-gray-400">
                                View this model in your space using Google AR
                            </p>
                        </div>

                        <Button
                            onClick={handleLaunchAR}
                            className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white rounded-xl"
                        >
                            🚀 View in AR
                        </Button>

                        <div className="bg-gray-800/50 rounded-lg p-4 text-left text-sm text-gray-300">
                            <div className="flex items-start gap-2 mb-2">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold mb-1">Requirements:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• Google Play Services for AR installed</li>
                                        <li>• ARCore-compatible device</li>
                                        <li>• Camera permission granted</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {platform === 'ios' && (
                    <div className="space-y-6">
                        <div className="bg-blue-600/20 border-2 border-blue-600 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                            <Smartphone className="w-12 h-12 text-blue-400" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                iOS AR Ready
                            </h1>
                            <p className="text-gray-400">
                                View this model in your space using AR Quick Look
                            </p>
                        </div>

                        <Button
                            onClick={handleLaunchAR}
                            className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                        >
                            🚀 View in AR
                        </Button>

                        <div className="bg-gray-800/50 rounded-lg p-4 text-left text-sm text-gray-300">
                            <div className="flex items-start gap-2 mb-2">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold mb-1">Requirements:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• iOS 12 or later</li>
                                        <li>• iPhone 6s or newer / iPad (5th gen) or newer</li>
                                        <li>• Safari browser</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {platform === 'other' && (
                    <div className="space-y-6">
                        <div className="bg-gray-600/20 border-2 border-gray-600 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                            <AlertCircle className="w-12 h-12 text-gray-400" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Mobile Device Required
                            </h1>
                            <p className="text-gray-400">
                                Native AR is only available on iOS and Android devices
                            </p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4 text-left text-sm text-gray-300">
                            <p className="font-semibold mb-2">To use AR:</p>
                            <ul className="space-y-1 text-xs">
                                <li>• Open this page on your iPhone or Android phone</li>
                                <li>• Make sure you're using Safari (iOS) or Chrome (Android)</li>
                                <li>• Tap the "View in AR" button</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mt-4 bg-red-600/20 border border-red-600 rounded-lg p-4 text-left">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-red-200">
                                <p className="font-semibold mb-1">Error</p>
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Model Info */}
                <div className="mt-8 text-gray-500 text-xs">
                    <p>Model: {modelTitle}</p>
                    <p className="mt-1">Using native AR for best experience</p>
                </div>
            </div>
        </div>
    );
}
