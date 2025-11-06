"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, AlertCircle } from 'lucide-react';

interface SimpleARViewProps {
    onBack?: () => void;
}

// Simple, reliable AR implementation that works on most Android devices
export default function SimpleARView({ onBack }: SimpleARViewProps) {
    const t = useT();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<any>(null);
    const sceneRef = useRef<any>(null);
    const xrRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isARActive, setIsARActive] = useState(false);
    const [objectsPlaced, setObjectsPlaced] = useState(0);

    useEffect(() => {
        return () => {
            // Cleanup
            if (xrRef.current?.session) {
                xrRef.current.session.end();
            }
            if (engineRef.current) {
                engineRef.current.dispose();
            }
        };
    }, []);

    const startSimpleAR = async () => {
        setError(null);
        setIsLoading(true);

        try {
            // Check if WebXR is available
            if (!navigator.xr) {
                throw new Error('WebXR not supported. Please use Chrome on Android.');
            }

            // Check AR support
            const supported = await navigator.xr.isSessionSupported('immersive-ar');
            if (!supported) {
                throw new Error('AR not supported on this device. Make sure you have ARCore installed.');
            }

            // Load Babylon.js
            const BABYLON = await import('@babylonjs/core');

            const canvas = canvasRef.current;
            if (!canvas) throw new Error('Canvas not found');

            // Create engine and scene
            const engine = new (BABYLON as any).Engine(canvas, true);
            engineRef.current = engine;

            const scene = new (BABYLON as any).Scene(engine);
            sceneRef.current = scene;

            // Make background transparent for AR
            scene.clearColor = new (BABYLON as any).Color4(0, 0, 0, 0);

            // Add basic lighting
            new (BABYLON as any).HemisphericLight('light', new (BABYLON as any).Vector3(0, 1, 0), scene);

            // Start render loop
            engine.runRenderLoop(() => scene.render());
            window.addEventListener('resize', () => engine.resize());

            // Get XR-compatible WebGL context FIRST
            const gl = canvas.getContext('webgl2', { xrCompatible: true }) ||
                canvas.getContext('webgl', { xrCompatible: true });
            if (!gl) throw new Error('WebGL not supported');

            // Make sure context is XR compatible
            if ('makeXRCompatible' in gl) {
                await (gl as any).makeXRCompatible();
            }

            // Request AR session
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: [],
                optionalFeatures: ['local-floor', 'bounded-floor', 'hit-test']
            });

            xrRef.current = { session };

            // Set up WebGL layer (now with XR-compatible context)
            const layer = new XRWebGLLayer(session, gl);

            await session.updateRenderState({
                baseLayer: layer
            });

            // Get reference space
            // Gracefully fallback through supported reference spaces to avoid runtime errors
            const preferredSpaces: XRReferenceSpaceType[] = ['local-floor', 'bounded-floor', 'local', 'unbounded', 'viewer'];
            let referenceSpace: XRReferenceSpace | null = null;
            let activeReferenceSpaceType: XRReferenceSpaceType | null = null;

            // Some browsers expose requestReferenceSpace on the XRSession, others on navigator.xr.
            // Bind the available function to keep a consistent call signature.
            const requestRefSpace = (session as any).requestReferenceSpace?.bind(session) ||
                (navigator.xr as any).requestReferenceSpace?.bind(navigator.xr);

            if (!requestRefSpace) {
                throw new Error('requestReferenceSpace is not available on this browser (neither on XRSession nor navigator.xr).');
            }

            for (const spaceType of preferredSpaces) {
                try {
                    // Try the available API (session or navigator.xr)
                    referenceSpace = await requestRefSpace(spaceType);
                    activeReferenceSpaceType = spaceType;
                    console.log(`✅ Using reference space: ${spaceType}`);
                    break;
                } catch (spaceError: any) {
                    // Continue trying other space types — some runtimes only support a subset.
                    console.warn(`ℹ️ Reference space "${spaceType}" not supported on this device.`, spaceError);
                }
            }

            if (!referenceSpace || !activeReferenceSpaceType) {
                throw new Error('This device does not expose a compatible WebXR reference space. Try Chrome on Android with ARCore.');
            }

            setIsARActive(true);
            setIsLoading(false);

            // Add a test cube that's always visible
            const testCube = (BABYLON as any).MeshBuilder.CreateBox('testCube', { size: 0.1 }, scene);
            testCube.position = new (BABYLON as any).Vector3(0, 0, -0.5);
            const testMaterial = new (BABYLON as any).StandardMaterial('testMat', scene);
            testMaterial.diffuseColor = new (BABYLON as any).Color3(1, 0, 0);
            testMaterial.emissiveColor = new (BABYLON as any).Color3(0.5, 0, 0);
            testCube.material = testMaterial;

            console.log('✅ AR Session started successfully!');
            console.log('✅ Test cube created at:', testCube.position);

            // Simple hit testing
            let hitTestSource = null;
            if (session.requestHitTestSource) {
                try {
                    hitTestSource = await session.requestHitTestSource({ space: referenceSpace });
                    console.log('✅ Hit test source created');
                } catch (e) {
                    console.warn('Hit test not available:', e);
                }
            }

            // Handle screen taps
            let tapCount = 0;
            const handleTap = () => {
                tapCount++;
                console.log('👆 Tap detected #', tapCount);

                // Create a sphere at a random position in front of camera
                const sphere = (BABYLON as any).MeshBuilder.CreateSphere(`sphere-${tapCount}`, { diameter: 0.08 }, scene);

                // Place in front of camera with some randomness
                const x = (Math.random() - 0.5) * 0.5;
                const y = (Math.random() - 0.5) * 0.3;
                const z = -0.3 - Math.random() * 0.5;

                sphere.position = new (BABYLON as any).Vector3(x, y, z);

                const material = new (BABYLON as any).StandardMaterial(`mat-${tapCount}`, scene);
                material.diffuseColor = new (BABYLON as any).Color3(
                    Math.random(),
                    Math.random(),
                    Math.random()
                );
                material.emissiveColor = material.diffuseColor.scale(0.3);
                sphere.material = material;

                // Add animation
                let time = 0;
                scene.registerBeforeRender(() => {
                    time += 0.02;
                    sphere.rotation.y = time;
                    sphere.position.y = y + Math.sin(time * 2) * 0.02;
                });

                setObjectsPlaced(tapCount);
                console.log('🎯 Sphere placed at:', sphere.position);
            };

            canvas.addEventListener('click', handleTap);

            // Animation loop
            const animate = (timestamp: number, frame: XRFrame) => {
                if (!session) return;

                session.requestAnimationFrame(animate);

                // Get viewer pose
                const pose = frame.getViewerPose(referenceSpace);
                if (pose) {
                    // Update camera
                    const view = pose.views[0];
                    if (view) {
                        // Update Babylon camera with XR pose
                        const camera = scene.activeCamera || scene.createDefaultCameraOrLight(true, true, true);
                        if (camera && view.transform) {
                            const pos = view.transform.position;
                            const orient = view.transform.orientation;

                            camera.position.set(pos.x, pos.y, pos.z);
                            camera.rotationQuaternion = new (BABYLON as any).Quaternion(
                                orient.x, orient.y, orient.z, orient.w
                            );
                        }
                    }
                }

                // Render scene
                scene.render();
            };

            session.requestAnimationFrame(animate);

            // Handle session end
            session.addEventListener('end', () => {
                console.log('AR session ended');
                setIsARActive(false);
                canvas.removeEventListener('click', handleTap);
            });

        } catch (err: any) {
            console.error('AR Error:', err);
            setError(err.message || 'Failed to start AR');
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-screen relative bg-black">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ touchAction: 'none' }}
            />

            {/* Start AR Button */}
            {!isARActive && !isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center">
                        <Button
                            onClick={startSimpleAR}
                            className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white rounded-xl"
                        >
                            🚀 Start AR
                        </Button>
                        <p className="text-white text-sm mt-2">Simple AR - Just tap to place objects!</p>
                    </div>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                    <div className="text-center text-white">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                        <p className="text-lg">Starting AR...</p>
                        <p className="text-sm opacity-70">Please allow camera access</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 p-4">
                    <div className="bg-red-600 text-white p-6 rounded-lg max-w-md text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-3" />
                        <h3 className="font-bold mb-2">AR Not Available</h3>
                        <p className="text-sm mb-4">{error}</p>
                        <div className="space-y-2 text-xs">
                            <p>✅ Use Chrome on Android</p>
                            <p>✅ Install Google Play Services for AR</p>
                            <p>✅ Allow camera permission</p>
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
                        <div className="bg-green-600/80 text-white px-3 py-1 rounded-full text-sm">
                            🟢 AR Active
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-center">
                            <p className="font-medium">👆 Tap anywhere to place objects</p>
                            <p className="text-sm opacity-80">Objects placed: {objectsPlaced}</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}