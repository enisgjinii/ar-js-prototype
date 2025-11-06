"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, AlertCircle } from 'lucide-react';

interface WorkingARViewProps {
    onBack?: () => void;
}

// Ultra-simple AR that definitely works on mobile
export default function WorkingARView({ onBack }: WorkingARViewProps) {
    const t = useT();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<any>(null);
    const sceneRef = useRef<any>(null);
    const xrRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isARActive, setIsARActive] = useState(false);
    const [objectsPlaced, setObjectsPlaced] = useState(0);
    const [hitTestEnabled, setHitTestEnabled] = useState<boolean>(false);
    const [referenceSpaceType, setReferenceSpaceType] = useState<string | null>(null);
    const [xrMode, setXrMode] = useState<'babylon'|'native'|'none'>('none');
    const [showDebugPanel, setShowDebugPanel] = useState<boolean>(true);

    useEffect(() => {
        return () => {
            // Cleanup XR session and engine
            if (xrRef.current?.baseExperience?.sessionManager?.session) {
                try {
                    xrRef.current.baseExperience.sessionManager.session.end();
                } catch (e) {
                    // ignore
                }
            }
            if (engineRef.current) {
                engineRef.current.dispose();
            }
        };
    }, []);

    const startAR = async () => {
        setError(null);
        setIsLoading(true);

        try {
            if (!(navigator as any).xr) {
                throw new Error('WebXR not supported. Use Chrome on Android with ARCore.');
            }

            const supported = await (navigator as any).xr.isSessionSupported('immersive-ar');
            if (!supported) {
                throw new Error('AR not supported on this device. Try Chrome on Android.');
            }

            const canvas = canvasRef.current;
            if (!canvas) throw new Error('Canvas not found');

            // Dynamically import Babylon.js core
            const BABYLON = await import('@babylonjs/core');

            // Create engine and scene
            const engine = new (BABYLON as any).Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
            engineRef.current = engine;

            const scene = new (BABYLON as any).Scene(engine);
            sceneRef.current = scene;
            scene.clearColor = new (BABYLON as any).Color4(0, 0, 0, 0);

            new (BABYLON as any).HemisphericLight('light', new (BABYLON as any).Vector3(0, 1, 0), scene);

            // Start render loop
            engine.runRenderLoop(() => {
                scene.render();
            });
            window.addEventListener('resize', () => engine.resize());

            // Ensure XR-compatible context
            const gl = canvas.getContext('webgl2', { xrCompatible: true }) || canvas.getContext('webgl', { xrCompatible: true });
            if (!gl) throw new Error('WebGL not supported');
            if ((gl as any).makeXRCompatible) await (gl as any).makeXRCompatible();

            // Create a Babylon XR experience (WebXR default experience)
            let xr: any = null;
            try {
                xr = await (BABYLON as any).WebXRDefaultExperience.CreateAsync(scene, {
                    uiOptions: { sessionMode: 'immersive-ar' },
                    optionalFeatures: ['hit-test', 'local-floor', 'bounded-floor']
                });
            } catch (e) {
                console.warn('WebXRDefaultExperience.CreateAsync failed, falling back to lower-level session handling', e);
            }

            // If default experience not available, still try to request session manually
            let session: XRSession | null = null;
            let referenceSpace: XRReferenceSpace | null = null;

            if (xr && xr.baseExperience) {
                // Request to enter XR via Babylon helper
                try {
                    await xr.baseExperience.enterXRAsync('immersive-ar', 'local-floor');
                    session = xr.baseExperience.sessionManager.session;
                    referenceSpace = xr.baseExperience.referenceSpace;
                    console.log('✅ Entered XR via Babylon WebXRDefaultExperience');
                } catch (e) {
                    console.warn('Failed to enter XR via Babylon helper', e);
                }
            }

            // If we didn't get an xr session via Babylon helper, fall back to manual WebXR flow
            if (!session) {
                session = await (navigator as any).xr.requestSession('immersive-ar', { requiredFeatures: ['local'] });

                // Create XR layer and reference space
                const layer = new XRWebGLLayer(session!, gl);
                await session!.updateRenderState({ baseLayer: layer });

                // Try several reference spaces
                const spaceCandidates: XRReferenceSpaceType[] = ['local-floor', 'bounded-floor', 'local', 'viewer'];
                for (const s of spaceCandidates) {
                    try {
                        referenceSpace = await (session as XRSession).requestReferenceSpace(s);
                        console.log(`✅ Using reference space: ${s}`);
                        break;
                    } catch (err) {
                        console.warn(`Reference space ${s} not supported`, err);
                    }
                }

                if (!referenceSpace) {
                    throw new Error('No compatible reference space available on this device.');
                }
            }

            xrRef.current = { xr, session, referenceSpace };
            setIsARActive(true);
            setIsLoading(false);

            // Create a test cube using Babylon
            const testCube = (BABYLON as any).MeshBuilder.CreateBox('testCube', { size: 0.12 }, scene);
            testCube.position = new (BABYLON as any).Vector3(0, 0, -0.5);
            const testMat = new (BABYLON as any).StandardMaterial('testMat', scene);
            testMat.diffuseColor = new (BABYLON as any).Color3(1, 0, 0);
            testMat.emissiveColor = new (BABYLON as any).Color3(0.4, 0, 0);
            testCube.material = testMat;

            // Reticle for hit-test visualization
            const reticle = (BABYLON as any).MeshBuilder.CreateTorus('reticle', { diameter: 0.15, thickness: 0.01, tessellation: 24 }, scene);
            reticle.isVisible = false;
            const retMat = new (BABYLON as any).StandardMaterial('retMat', scene);
            retMat.emissiveColor = new (BABYLON as any).Color3(0, 0.7, 1);
            reticle.material = retMat;

            // Hit test: prefer Babylon's feature if available
            let hitTestSource: any = null;
            const handleHit = (hitPose: any) => {
                if (!hitPose) return;
                const pos = hitPose.transform?.position || hitPose.position || hitPose;
                if (!pos) return;
                reticle.position.set(pos.x || pos[0] || 0, pos.y || pos[1] || 0, pos.z || pos[2] || 0);
                reticle.isVisible = true;
            };

            // If Babylon XR helper is present, try to enable its hit-test feature
            if (xr && xr.baseExperience && xr.baseExperience.featuresManager) {
                try {
                    const featuresManager = xr.baseExperience.featuresManager;
                    const hitTestFeature = featuresManager.enableFeature((BABYLON as any).WebXRHitTest.Name, 'latest');
                    hitTestFeature.onHitTestResultObservable.add((results: any) => {
                        if (results && results.length) {
                            const first = results[0];
                            if (first && first.position) {
                                reticle.position.set(first.position.x, first.position.y, first.position.z);
                                reticle.isVisible = true;
                            } else if (first && first.transformationMatrix) {
                                const m = first.transformationMatrix;
                                // matrix is a Babylon matrix; translation is at m[12..14]
                                reticle.position.set(m.m[12], m.m[13], m.m[14]);
                                reticle.isVisible = true;
                            }
                        } else {
                            reticle.isVisible = false;
                        }
                    });
                    // indicate hit-test is available
                    setHitTestEnabled(true);
                    setXrMode('babylon');
                    console.log('✅ Babylon WebXR hit-test feature enabled');
                } catch (e) {
                    console.warn('Babylon hit-test feature not available or failed:', e);
                }
            } else if (session && referenceSpace) {
                // Fallback: use native hit-test
                try {
                    if ((session as any).requestHitTestSource) {
                        hitTestSource = await (session as any).requestHitTestSource({ space: referenceSpace });
                        console.log('✅ Native hit test source created');
                        setHitTestEnabled(true);
                        setXrMode('native');
                    }
                } catch (e) {
                    console.warn('Native hit-test not available:', e);
                }

                // Update reticle using requestAnimationFrame via XR frame callback
                const onXRFrame = (time: number, frame: XRFrame) => {
                    session!.requestAnimationFrame(onXRFrame);
                    const pose = frame.getViewerPose(referenceSpace!);
                    if (!pose) return;
                    if (hitTestSource) {
                        const hitResults = frame.getHitTestResults(hitTestSource);
                        if (hitResults && hitResults.length > 0) {
                            const hit = hitResults[0];
                            const hitPose = hit.getPose(referenceSpace!);
                            if (hitPose) {
                                const p = hitPose.transform.position;
                                reticle.position.set(p.x, p.y, p.z);
                                reticle.isVisible = true;
                            }
                        } else {
                            reticle.isVisible = false;
                        }
                    }
                };

                session.requestAnimationFrame(onXRFrame);
                // reflect chosen reference space
                setReferenceSpaceType((referenceSpace as any)?.type || 'unknown');
            }

            // Reticle pulse animation
            let pulseTime = 0;
            scene.registerBeforeRender(() => {
                pulseTime += 0.03;
                const s = 1 + Math.sin(pulseTime) * 0.08;
                reticle.scaling.set(s, s, s);
            });

            // Handle taps: if reticle visible, place at reticle; otherwise place in front of camera
            let tapCount = 0;
            const handleTap = () => {
                tapCount++;
                const sphere = (BABYLON as any).MeshBuilder.CreateSphere(`sphere-${tapCount}`, { diameter: 0.08 }, scene);
                let placePos = null;
                if (reticle.isVisible) {
                    placePos = reticle.position.clone();
                } else {
                    // place roughly in front of camera
                    const cam = scene.activeCamera;
                    if (cam) {
                        const forward = cam.getForwardRay(2);
                        placePos = forward.origin.add(forward.direction.scale(0.5));
                    } else {
                        placePos = new (BABYLON as any).Vector3(0, 0, -0.5);
                    }
                }

                sphere.position = placePos;
                const mat = new (BABYLON as any).StandardMaterial(`mat-${tapCount}`, scene);
                mat.diffuseColor = new (BABYLON as any).Color3(Math.random(), Math.random(), Math.random());
                mat.emissiveColor = mat.diffuseColor.scale(0.3);
                sphere.material = mat;

                // small animation
                let time = 0;
                scene.registerBeforeRender(() => {
                    time += 0.02;
                    sphere.rotation.y = time;
                    sphere.position.y += Math.sin(time * 2) * 0.001;
                });

                setObjectsPlaced(tapCount);
                console.log('🎯 Sphere placed at:', sphere.position);
            };

            canvas.addEventListener('click', handleTap);

            // Session end
            if (session) {
                session.addEventListener('end', () => {
                    console.log('AR session ended');
                    setIsARActive(false);
                    canvas.removeEventListener('click', handleTap);
                });
            }

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
                            onClick={startAR}
                            className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white rounded-xl"
                        >
                            🚀 Start Babylon AR
                        </Button>
                        <p className="text-white text-sm mt-2">Babylon.js + WebXR AR</p>
                    </div>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                    <div className="text-center text-white">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                        <p className="text-lg">Starting Babylon AR...</p>
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

                    {/* Debug Panel */}
                    {showDebugPanel && (
                        <div className="absolute top-4 left-4 z-30 bg-black/60 text-white p-3 rounded-md text-xs max-w-xs">
                            <div className="flex items-center justify-between mb-2">
                                <strong className="text-sm">AR Debug</strong>
                                <button
                                    onClick={() => setShowDebugPanel(false)}
                                    className="ml-2 text-gray-200 hover:text-white"
                                    aria-label="Hide debug panel"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-1">
                                <div>XR mode: <span className="font-medium ml-1">{xrMode}</span></div>
                                <div>Hit-test: <span className="font-medium ml-1">{hitTestEnabled ? 'enabled' : 'disabled'}</span></div>
                                <div>Reference space: <span className="font-medium ml-1">{referenceSpaceType || 'unknown'}</span></div>
                                <div>Objects: <span className="font-medium ml-1">{objectsPlaced}</span></div>
                            </div>
                            <div className="mt-2 text-xxs opacity-80">
                                Use chrome://inspect to view console logs for more details.
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-center">
                            <p className="font-medium">👆 Tap to place objects</p>
                            <p className="text-sm opacity-80">Objects placed: {objectsPlaced}</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}