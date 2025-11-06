"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface AFrameARViewProps {
    onBack?: () => void;
}

// A-Frame AR - Most reliable mobile AR solution
export default function AFrameARView({ onBack }: AFrameARViewProps) {
    const t = useT();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isARActive, setIsARActive] = useState(false);
    const [objectsPlaced, setObjectsPlaced] = useState(0);

    useEffect(() => {
        return () => {
            // Cleanup A-Frame scene
            const scene = document.querySelector('a-scene');
            if (scene) {
                scene.remove();
            }
        };
    }, []);

    const startAFrameAR = async () => {
        setError(null);
        setIsLoading(true);

        try {
            // Load A-Frame and AR.js
            await loadAFrame();

            const container = containerRef.current;
            if (!container) throw new Error('Container not found');

            console.log('✅ A-Frame loaded, creating AR scene...');

            // Create A-Frame scene with AR
            const sceneHTML = `
        <a-scene 
          embedded 
          arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
          vr-mode-ui="enabled: false"
          renderer="logarithmicDepthBuffer: true;"
          style="width: 100%; height: 100%;"
        >
          <!-- Assets -->
          <a-assets>
            <a-mixin id="sphere-mixin" 
              geometry="primitive: sphere; radius: 0.05" 
              material="color: #ff6b6b; metalness: 0.3; roughness: 0.4"
              animation="property: rotation; to: 0 360 0; loop: true; dur: 3000">
            </a-mixin>
          </a-assets>

          <!-- Camera with AR -->
          <a-camera 
            id="ar-camera"
            gps-camera 
            rotation-reader
            look-controls-enabled="false"
            arjs-look-controls="smoothingFactor: 0.1"
            wasd-controls-enabled="false">
          </a-camera>

          <!-- Test cube always visible -->
          <a-box 
            id="test-cube"
            position="0 0 -1" 
            rotation="0 45 0" 
            color="#ff0000" 
            scale="0.1 0.1 0.1"
            animation="property: rotation; to: 360 405 360; loop: true; dur: 4000">
          </a-box>

          <!-- Lighting -->
          <a-light type="ambient" color="#404040"></a-light>
          <a-light type="directional" position="1 1 1" color="#ffffff"></a-light>
        </a-scene>
      `;

            container.innerHTML = sceneHTML;

            // Wait for A-Frame to initialize
            const scene = container.querySelector('a-scene') as any;

            await new Promise((resolve) => {
                if (scene.hasLoaded) {
                    resolve(true);
                } else {
                    scene.addEventListener('loaded', resolve);
                }
            });

            console.log('✅ A-Frame scene loaded');
            setIsARActive(true);
            setIsLoading(false);

            // Add tap handler for placing objects
            let tapCount = 0;
            const handleTap = (event: MouseEvent) => {
                tapCount++;
                console.log('👆 Tap detected #', tapCount);

                // Get camera position and direction
                const camera = scene.querySelector('#ar-camera');
                const cameraPosition = camera.getAttribute('position');
                const cameraRotation = camera.getAttribute('rotation');

                // Calculate position in front of camera
                const distance = 0.5 + Math.random() * 0.5;
                const angle = (cameraRotation.y * Math.PI) / 180;

                const x = cameraPosition.x + Math.sin(angle) * distance + (Math.random() - 0.5) * 0.3;
                const y = cameraPosition.y + (Math.random() - 0.5) * 0.2;
                const z = cameraPosition.z - Math.cos(angle) * distance;

                // Create new sphere
                const sphere = document.createElement('a-sphere');
                sphere.setAttribute('position', `${x} ${y} ${z}`);
                sphere.setAttribute('radius', '0.05');
                sphere.setAttribute('color', `hsl(${Math.random() * 360}, 70%, 60%)`);
                sphere.setAttribute('metalness', '0.3');
                sphere.setAttribute('roughness', '0.4');
                sphere.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 3000');

                scene.appendChild(sphere);
                setObjectsPlaced(tapCount);

                console.log('🎯 Sphere placed at:', x, y, z);
            };

            container.addEventListener('click', handleTap);

            // Store cleanup function
            (container as any)._cleanup = () => {
                container.removeEventListener('click', handleTap);
            };

        } catch (err: any) {
            console.error('A-Frame AR Error:', err);
            setError(err.message || 'Failed to start AR');
            setIsLoading(false);
        }
    };

    // Load A-Frame dynamically
    const loadAFrame = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            if ((window as any).AFRAME) {
                resolve();
                return;
            }

            // Load A-Frame
            const aframeScript = document.createElement('script');
            aframeScript.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
            aframeScript.onload = () => {
                // Load AR.js
                const arScript = document.createElement('script');
                arScript.src = 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar.min.js';
                arScript.onload = () => resolve();
                arScript.onerror = () => reject(new Error('Failed to load AR.js'));
                document.head.appendChild(arScript);
            };
            aframeScript.onerror = () => reject(new Error('Failed to load A-Frame'));
            document.head.appendChild(aframeScript);
        });
    };

    return (
        <div className="w-full h-screen relative bg-black">
            <div ref={containerRef} className="w-full h-full" />

            {/* Start AR Button */}
            {!isARActive && !isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center">
                        <Button
                            onClick={startAFrameAR}
                            className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                        >
                            🌟 A-Frame AR
                        </Button>
                        <p className="text-white text-sm mt-2">Most reliable mobile AR solution</p>
                        <p className="text-white text-xs mt-1 opacity-70">Works on 99% of devices</p>
                    </div>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                    <div className="text-center text-white">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                        <p className="text-lg">Loading A-Frame AR...</p>
                        <p className="text-sm opacity-70">Most compatible AR solution</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 p-4">
                    <div className="bg-red-600 text-white p-6 rounded-lg max-w-md text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-3" />
                        <h3 className="font-bold mb-2">AR Error</h3>
                        <p className="text-sm mb-4">{error}</p>
                        <div className="space-y-2 text-xs">
                            <p>✅ Allow camera permission</p>
                            <p>✅ Use any modern browser</p>
                            <p>✅ Works on iOS and Android</p>
                        </div>
                        <Button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-white text-red-600 hover:bg-gray-100"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            )}

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

            {/* AR Status */}
            {isARActive && (
                <>
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-blue-600/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            A-Frame AR
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-center">
                            <p className="font-medium">👆 Tap to place spheres</p>
                            <p className="text-sm opacity-80">Objects placed: {objectsPlaced}</p>
                            <p className="text-xs opacity-60">Look for spinning red cube!</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}