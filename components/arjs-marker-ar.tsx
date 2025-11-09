'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Info, AlertCircle, Download } from 'lucide-react';
import Script from 'next/script';

interface ARjsMarkerARProps {
    modelUrl: string;
    modelTitle?: string;
    onClose?: () => void;
}

/**
 * AR.js Marker-Based AR
 * - Requires printed marker (Hiro or custom)
 * - Works in browser but poor quality
 * - No plane detection
 * - Outdated technology (2019)
 * 
 * THIS IS FOR DEMONSTRATION ONLY - NOT RECOMMENDED FOR PRODUCTION
 */
export default function ARjsMarkerAR({
    modelUrl,
    modelTitle = '3D Model',
    onClose
}: ARjsMarkerARProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(true);
    const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

    useEffect(() => {
        // Check camera permission
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(() => {
                    setCameraPermission('granted');
                })
                .catch(() => {
                    setCameraPermission('denied');
                });
        }
    }, []);

    const initARjs = () => {
        if (!containerRef.current) return;

        try {
            // Create AR.js scene
            const arScene = `
                <a-scene
                    embedded
                    arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
                    vr-mode-ui="enabled: false"
                    style="width: 100%; height: 100%;"
                >
                    <!-- Camera -->
                    <a-entity camera></a-entity>

                    <!-- Marker: Hiro (default AR.js marker) -->
                    <a-marker preset="hiro">
                        <!-- 3D Model -->
                        <a-entity
                            gltf-model="url(${modelUrl})"
                            scale="0.5 0.5 0.5"
                            position="0 0 0"
                            rotation="0 0 0"
                            animation="property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear"
                        ></a-entity>
                    </a-marker>

                    <!-- Alternative: Pattern marker -->
                    <!-- 
                    <a-marker type="pattern" url="/markers/custom-marker.patt">
                        <a-box position="0 0.5 0" material="color: red;"></a-box>
                    </a-marker>
                    -->
                </a-scene>
            `;

            containerRef.current.innerHTML = arScene;
            setIsLoaded(true);
            console.log('✅ AR.js initialized');
        } catch (err) {
            console.error('❌ AR.js error:', err);
            setError('Failed to initialize AR.js');
        }
    };

    const downloadMarker = () => {
        // Open Hiro marker image
        window.open('https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png', '_blank');
    };

    if (error) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                <div className="text-center text-white p-8 max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    {onClose && (
                        <Button onClick={onClose} variant="outline">
                            Close
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    if (cameraPermission === 'denied') {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                <div className="text-center text-white p-8 max-w-md">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Camera Permission Required</h2>
                    <p className="text-gray-400 mb-6">
                        AR.js needs camera access to detect markers. Please grant camera permission and reload.
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
            {/* Load A-Frame */}
            <Script
                src="https://aframe.io/releases/1.4.2/aframe.min.js"
                onLoad={() => {
                    console.log('✅ A-Frame loaded');
                }}
            />

            {/* Load AR.js */}
            <Script
                src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"
                onLoad={() => {
                    console.log('✅ AR.js loaded');
                    setTimeout(() => initARjs(), 500);
                }}
                onError={() => {
                    setError('Failed to load AR.js library');
                }}
            />

            <div className="fixed inset-0 z-50 bg-black flex flex-col">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4 z-20">
                    <div className="flex items-center justify-between">
                        <div className="text-white">
                            <h2 className="text-lg font-semibold">{modelTitle}</h2>
                            <p className="text-sm text-gray-300">AR.js Marker-Based AR</p>
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

                {/* AR Container */}
                <div ref={containerRef} className="flex-1 relative" />

                {/* Loading */}
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <div className="text-center text-white">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                            <p>Loading AR.js...</p>
                            <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
                        </div>
                    </div>
                )}

                {/* Instructions Overlay */}
                {showInstructions && isLoaded && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30 p-6">
                        <div className="bg-gray-900 rounded-lg p-6 max-w-md border border-yellow-600">
                            <div className="flex items-start gap-3 mb-4">
                                <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        ⚠️ Marker Required!
                                    </h3>
                                    <p className="text-gray-300 text-sm mb-4">
                                        AR.js requires a printed marker to work. You MUST print the Hiro marker
                                        and point your camera at it.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-800 rounded p-4">
                                    <h4 className="font-semibold text-white mb-2">How to use:</h4>
                                    <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                                        <li>Download and print the Hiro marker</li>
                                        <li>Grant camera permission</li>
                                        <li>Point camera at the printed marker</li>
                                        <li>3D model appears on the marker</li>
                                    </ol>
                                </div>

                                <Button
                                    onClick={downloadMarker}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Hiro Marker
                                </Button>

                                <Button
                                    onClick={() => setShowInstructions(false)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    I Have the Marker - Start AR
                                </Button>
                            </div>

                            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded">
                                <p className="text-xs text-red-200">
                                    <strong>Note:</strong> This is why AR.js is NOT recommended.
                                    Modern AR (WebXR, model-viewer) doesn't need markers!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Info */}
                {isLoaded && !showInstructions && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 z-20">
                        <div className="flex items-start gap-2 text-sm text-gray-300 mb-4">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="mb-2">
                                    <strong className="text-white">Point camera at Hiro marker</strong>
                                </p>
                                <p className="text-xs">
                                    If you don't see the model, make sure:
                                </p>
                                <ul className="text-xs space-y-1 mt-1">
                                    <li>• Marker is printed clearly</li>
                                    <li>• Good lighting conditions</li>
                                    <li>• Camera is focused on marker</li>
                                    <li>• Marker is not too small or too large</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowInstructions(true)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                            >
                                Show Instructions
                            </Button>
                            <Button
                                onClick={downloadMarker}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Get Marker
                            </Button>
                        </div>
                    </div>
                )}

                {/* Performance Warning */}
                <div className="absolute top-20 left-4 right-4 z-20">
                    <div className="bg-yellow-900/80 border border-yellow-600 rounded-lg p-3 text-sm">
                        <p className="text-yellow-200">
                            <strong>⚠️ AR.js Limitations:</strong> No plane detection, requires markers,
                            poor performance. This is why modern solutions (WebXR, model-viewer) are better!
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
