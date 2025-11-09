'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Info } from 'lucide-react';
import Script from 'next/script';

interface ModelViewerWebARProps {
    modelUrl: string;
    usdzUrl?: string;
    modelTitle?: string;
    onClose?: () => void;
}

/**
 * Model Viewer with WebAR
 * Uses Google's model-viewer which handles:
 * - Android: WebXR AR (stays in browser)
 * - iOS: AR Quick Look fallback
 * - Desktop: 3D preview with controls
 * 
 * This is the easiest WebAR solution - your UI stays visible!
 */
export default function ModelViewerWebAR({
    modelUrl,
    usdzUrl,
    modelTitle = '3D Model',
    onClose
}: ModelViewerWebARProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
    const [webXRSupported, setWebXRSupported] = useState(false);
    const [arModes, setArModes] = useState('webxr scene-viewer quick-look');

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
            setArModes('quick-look'); // iOS only uses Quick Look
        } else if (/android/.test(userAgent)) {
            setPlatform('android');

            // Check if WebXR is supported
            if ('xr' in navigator) {
                (navigator as any).xr?.isSessionSupported('immersive-ar').then((supported: boolean) => {
                    setWebXRSupported(supported);
                    if (supported) {
                        setArModes('webxr'); // Only WebXR, no fallback
                        console.log('✅ WebXR supported - will stay in browser!');
                    } else {
                        setArModes('scene-viewer'); // Fallback to Scene Viewer
                        console.log('⚠️ WebXR not supported - will use Scene Viewer');
                    }
                }).catch(() => {
                    setArModes('scene-viewer');
                    console.log('⚠️ WebXR check failed - will use Scene Viewer');
                });
            } else {
                setArModes('scene-viewer');
                console.log('⚠️ No WebXR API - will use Scene Viewer');
            }
        }
    }, []);

    return (
        <>
            {/* Load model-viewer library */}
            <Script
                src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
                type="module"
                onLoad={() => setIsLoaded(true)}
            />

            <div className="fixed inset-0 z-50 bg-black flex flex-col">
                {/* Header - STAYS VISIBLE during AR! */}
                <div className="bg-gradient-to-b from-black/90 to-transparent p-4 z-20">
                    <div className="flex items-center justify-between">
                        <div className="text-white">
                            <h2 className="text-lg font-semibold">{modelTitle}</h2>
                            <p className="text-sm text-gray-300">
                                {platform === 'android' && 'Tap AR to view in your space'}
                                {platform === 'ios' && 'Tap AR for Quick Look'}
                                {platform === 'other' && 'Rotate and zoom the model'}
                            </p>
                        </div>
                        {onClose && (
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Model Viewer - This is where the magic happens */}
                <div className="flex-1 relative">
                    {isLoaded ? (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: `
                                    <model-viewer
                                        src="${modelUrl}"
                                        ios-src="${usdzUrl || modelUrl.replace(/\.glb$/i, '.usdz')}"
                                        alt="${modelTitle}"
                                        ar
                                        ar-modes="${arModes}"
                                        camera-controls
                                        touch-action="pan-y"
                                        auto-rotate
                                        shadow-intensity="1"
                                        xr-environment
                                        style="width: 100%; height: 100%; background: linear-gradient(to bottom, #1a1a1a, #000000);"
                                    >
                                        <button
                                            slot="ar-button"
                                            style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); padding: 16px 32px; font-size: 18px; font-weight: 600; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10;"
                                        >
                                            🥽 View in AR
                                        </button>
                                        <div
                                            slot="poster"
                                            style="display: flex; align-items: center; justify-content: center; height: 100%; background: #000;"
                                        >
                                            <div style="text-align: center; color: white;">
                                                <div style="width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
                                                <p>Loading 3D model...</p>
                                            </div>
                                        </div>
                                    </model-viewer>
                                `
                            }}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                                <p>Loading AR viewer...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info footer - STAYS VISIBLE during AR! */}
                <div className="bg-gradient-to-t from-black/90 to-transparent p-4 z-20">
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                            {platform === 'android' && (
                                <p>
                                    {webXRSupported ? (
                                        <>
                                            <strong className="text-white">✅ WebXR Ready:</strong> Your browser UI stays visible during AR!
                                        </>
                                    ) : (
                                        <>
                                            <strong className="text-white">⚠️ Scene Viewer:</strong> Will open Google AR app.
                                            Update Chrome for WebXR support.
                                        </>
                                    )}
                                </p>
                            )}
                            {platform === 'ios' && (
                                <p>
                                    <strong className="text-white">iOS Quick Look:</strong> Will open Apple's AR viewer.
                                    Close it to return here.
                                </p>
                            )}
                            {platform === 'other' && (
                                <p>
                                    <strong className="text-white">Desktop Preview:</strong> Use mouse to rotate and zoom.
                                    AR available on mobile devices.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add spin animation */}
            <style jsx global>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}
