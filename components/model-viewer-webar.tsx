'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Info } from 'lucide-react';

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
 */
export default function ModelViewerWebAR({
    modelUrl,
    usdzUrl,
    modelTitle = '3D Model',
    onClose
}: ModelViewerWebARProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
    const [webXRSupported, setWebXRSupported] = useState(false);
    const [arModes, setArModes] = useState('webxr scene-viewer quick-look');
    const [modelError, setModelError] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
            setArModes('quick-look');
        } else if (/android/.test(userAgent)) {
            setPlatform('android');

            if ('xr' in navigator) {
                (navigator as any).xr?.isSessionSupported('immersive-ar').then((supported: boolean) => {
                    setWebXRSupported(supported);
                    if (supported) {
                        setArModes('webxr');
                        console.log('✅ WebXR supported - will stay in browser!');
                    } else {
                        setArModes('scene-viewer');
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

    useEffect(() => {
        // Load model-viewer script
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
        script.onload = () => {
            console.log('✅ model-viewer loaded');
            setIsLoaded(true);
            initModelViewer();
        };
        script.onerror = () => {
            console.error('❌ Failed to load model-viewer');
            setModelError(true);
        };
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        if (isLoaded) {
            initModelViewer();
        }
    }, [isLoaded, arModes]);

    const initModelViewer = () => {
        if (!containerRef.current || !isLoaded) return;

        // Clear existing content
        containerRef.current.innerHTML = '';

        // Create model-viewer element
        const modelViewer = document.createElement('model-viewer');
        modelViewer.setAttribute('src', modelUrl);
        modelViewer.setAttribute('ios-src', usdzUrl || modelUrl.replace(/\.glb$/i, '.usdz'));
        modelViewer.setAttribute('alt', modelTitle);
        modelViewer.setAttribute('ar', '');
        modelViewer.setAttribute('ar-modes', arModes);
        modelViewer.setAttribute('camera-controls', '');
        modelViewer.setAttribute('touch-action', 'pan-y');
        modelViewer.setAttribute('auto-rotate', '');
        modelViewer.setAttribute('shadow-intensity', '1');
        modelViewer.setAttribute('xr-environment', '');
        modelViewer.style.width = '100%';
        modelViewer.style.height = '100%';
        modelViewer.style.background = 'linear-gradient(to bottom, #1a1a1a, #000000)';

        // Add AR button
        const arButton = document.createElement('button');
        arButton.setAttribute('slot', 'ar-button');
        arButton.textContent = '🥽 View in AR';
        arButton.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 16px 32px;
            font-size: 18px;
            font-weight: 600;
            color: white;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10;
        `;

        // Add loading poster
        const poster = document.createElement('div');
        poster.setAttribute('slot', 'poster');
        poster.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: #000;
        `;
        poster.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
                <p>Loading 3D model...</p>
            </div>
        `;

        modelViewer.appendChild(arButton);
        modelViewer.appendChild(poster);

        // Event listeners
        modelViewer.addEventListener('load', () => {
            console.log('✅ Model loaded successfully');
        });

        modelViewer.addEventListener('error', (e) => {
            console.error('❌ Model loading error:', e);
            setModelError(true);
        });

        containerRef.current.appendChild(modelViewer);
    };

    if (modelError) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                <div className="text-center text-white p-8">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold mb-2">Failed to Load Model</h2>
                    <p className="text-gray-400 mb-6">
                        Could not load the 3D model. Please check the file path.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Model URL: {modelUrl}
                    </p>
                    {onClose && (
                        <Button onClick={onClose} variant="outline">
                            Close
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black flex flex-col">
                {/* Header */}
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

                {/* Model Viewer Container */}
                <div className="flex-1 relative">
                    {!isLoaded ? (
                        <div className="flex items-center justify-center h-full text-white">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                                <p>Loading AR viewer...</p>
                            </div>
                        </div>
                    ) : null}
                    <div ref={containerRef} className="w-full h-full" />
                </div>

                {/* Info footer */}
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
