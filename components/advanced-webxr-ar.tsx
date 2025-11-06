"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface AdvancedWebXRARProps {
    onBack?: () => void;
}

// Advanced WebXR AR with hit-test and plane detection
export default function AdvancedWebXRAR({ onBack }: AdvancedWebXRARProps) {
    const t = useT();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isARActive, setIsARActive] = useState(false);
    const [objectsPlaced, setObjectsPlaced] = useState(0);
    const [surfaceDetected, setSurfaceDetected] = useState(false);
    const sessionRef = useRef<XRSession | null>(null);
    const rendererRef = useRef<any>(null);
    const sceneRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const reticleRef = useRef<any>(null);

    const startAdvancedAR = async () => {
        setError(null);
        setIsLoading(true);

        try {
            // Check WebXR support
            if (!navigator.xr) {
                throw new Error('WebXR not supported. Use Chrome on Android with ARCore.');
            }

            const supported = await navigator.xr.isSessionSupported('immersive-ar');
            if (!supported) {
                throw new Error('AR not supported. Install Google Play Services for AR.');
            }

            console.log('✅ WebXR AR supported');

            // Load Three.js
            const THREE = await import('three');
            console.log('✅ Three.js loaded');

            const container = containerRef.current;
            if (!container) throw new Error('Container not found');

            // Create scene
            const scene = new THREE.Scene();
            sceneRef.current = scene;

            // Create camera
            const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
            cameraRef.current = camera;

            // Create renderer with XR support
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.xr.enabled = true;
            renderer.setClearColor(0x000000, 0);
            rendererRef.current = renderer;

            container.appendChild(renderer.domElement);

            // Add lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(0, 1, 0);
            scene.add(directionalLight);

            console.log('✅ Three.js scene created');

            // Request AR session with advanced features
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test'],
                optionalFeatures: ['dom-overlay', 'light-estimation', 'anchors']
            });

            sessionRef.current = session;
            await renderer.xr.setSession(session);

            console.log('✅ WebXR AR session started');
            setIsARActive(true);
            setIsLoading(false);

            // Get reference space with fallback
            const supportedSpaces: XRReferenceSpaceType[] = ['local-floor', 'local', 'viewer'];
            let referenceSpace: XRReferenceSpace | null = null;

            for (const spaceType of supportedSpaces) {
                try {
                    referenceSpace = await session.requestReferenceSpace(spaceType);
                    console.log(`✅ Reference space: ${spaceType}`);
                    break;
                } catch (e) {
                    console.warn(`❌ ${spaceType} not supported, trying next...`);
                }
            }

            if (!referenceSpace) {
                throw new Error('No supported reference space found. Device may not support WebXR AR.');
            }

            // Create reticle (placement indicator)
            const reticleGeometry = new THREE.RingGeometry(0.08, 0.1, 32);
            const reticleMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
            reticle.matrixAutoUpdate = false;
            reticle.visible = false;
            scene.add(reticle);
            reticleRef.current = reticle;

            console.log('✅ Reticle created');

            // Set up hit testing
            let hitTestSource: XRHitTestSource | null = null;
            let hitTestSourceRequested = false;

            // Request hit test source
            session.requestReferenceSpace('viewer').then((viewerSpace) => {
                (session as any).requestHitTestSource({ space: viewerSpace })
                    .then((source: XRHitTestSource) => {
                        hitTestSource = source;
                        console.log('✅ Hit test source created');
                    })
                    .catch((err: any) => {
                        console.warn('Hit test source failed:', err);
                    });
            });

            // Handle taps for placement
            let tapCount = 0;
            const handleSelect = () => {
                if (!reticle.visible) {
                    console.warn('⚠️ No surface detected - move phone to scan surfaces');
                    return;
                }

                tapCount++;
                console.log('👆 Tap detected #', tapCount);

                // Get reticle position
                const position = new THREE.Vector3();
                const rotation = new THREE.Quaternion();
                const scale = new THREE.Vector3();
                reticle.matrix.decompose(position, rotation, scale);

                // Create sphere at reticle position
                const geometry = new THREE.SphereGeometry(0.03, 16, 16);
                const material = new THREE.MeshStandardMaterial({
                    color: new (THREE as any).Color().setHSL(Math.random(), 0.8, 0.6),
                    metalness: 0.5,
                    roughness: 0.3,
                    emissive: new (THREE as any).Color().setHSL(Math.random(), 0.5, 0.2)
                });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.copy(position);
                sphere.position.y += 0.03; // Lift slightly above surface
                sphere.quaternion.copy(rotation);
                scene.add(sphere);

                // Add animation
                let time = 0;
                const animate = () => {
                    if (sphere.parent) {
                        time += 0.02;
                        sphere.rotation.y += 0.02;
                        sphere.position.y = position.y + 0.03 + Math.sin(time) * 0.01;
                        requestAnimationFrame(animate);
                    }
                };
                animate();

                setObjectsPlaced(tapCount);
                console.log('🎯 Sphere placed on detected surface at:', position);
            };

            session.addEventListener('select', handleSelect);

            // Animation loop with hit testing
            const onXRFrame = (time: number, frame: XRFrame) => {
                if (!session) return;

                // Update hit test
                if (hitTestSource) {
                    const hitTestResults = frame.getHitTestResults(hitTestSource);

                    if (hitTestResults.length > 0) {
                        const hit = hitTestResults[0];
                        const pose = hit.getPose(referenceSpace);

                        if (pose) {
                            reticle.visible = true;
                            reticle.matrix.fromArray(pose.transform.matrix);
                            setSurfaceDetected(true);
                        }
                    } else {
                        reticle.visible = false;
                        setSurfaceDetected(false);
                    }
                }

                // Render scene
                renderer.render(scene, camera);
            };

            renderer.setAnimationLoop(onXRFrame);

            // Handle session end
            session.addEventListener('end', () => {
                console.log('AR session ended');
                setIsARActive(false);
                setSurfaceDetected(false);
                hitTestSource = null;
            });

            // Handle window resize
            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', handleResize);

            // Store cleanup
            (container as any)._cleanup = () => {
                session.removeEventListener('select', handleSelect);
                window.removeEventListener('resize', handleResize);
                if (hitTestSource) {
                    hitTestSource.cancel();
                }
                if (session) {
                    session.end();
                }
                if (renderer) {
                    renderer.dispose();
                }
            };

        } catch (err: any) {
            console.error('Advanced WebXR AR Error:', err);
            setError(err.message || 'Failed to start advanced AR');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            const container = containerRef.current;
            if (container && (container as any)._cleanup) {
                (container as any)._cleanup();
            }
        };
    }, []);

    return (
        <div className="w-full h-screen relative bg-black overflow-hidden">
            <div ref={containerRef} className="w-full h-full" />

            {/* Start AR Button */}
            {!isARActive && !isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center">
                        <Button
                            onClick={startAdvancedAR}
                            className="px-8 py-4 text-lg bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                        >
                            🚀 Advanced WebXR AR
                        </Button>
                        <p className="text-white text-sm mt-2">Hit-test + Plane Detection</p>
                        <p className="text-white text-xs mt-1 opacity-70">Objects placed on real surfaces!</p>
                    </div>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                    <div className="text-center text-white">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                        <p className="text-lg">Starting Advanced AR...</p>
                        <p className="text-sm opacity-70">Initializing WebXR with hit-test</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 p-4">
                    <div className="bg-red-600 text-white p-6 rounded-lg max-w-md text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-3" />
                        <h3 className="font-bold mb-2">WebXR AR Error</h3>
                        <p className="text-sm mb-4">{error}</p>
                        <div className="space-y-2 text-xs">
                            <p>✅ Use Chrome on Android</p>
                            <p>✅ Install Google Play Services for AR</p>
                            <p>✅ Allow camera permission</p>
                            <p>✅ Update Chrome to latest version</p>
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
                        <div className="bg-purple-600/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            WebXR AR
                        </div>
                    </div>

                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className={`${surfaceDetected ? 'bg-green-600/80' : 'bg-yellow-600/80'} text-white px-3 py-1 rounded-full text-sm flex items-center gap-1`}>
                            {surfaceDetected ? (
                                <>
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Surface Detected</span>
                                </>
                            ) : (
                                <>
                                    <div className="h-3 w-3 rounded-full bg-white animate-pulse"></div>
                                    <span>Scanning...</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-center max-w-sm">
                            <p className="font-medium">
                                {surfaceDetected ? '👆 Tap to place on surface' : '📱 Move phone to detect surfaces'}
                            </p>
                            <p className="text-sm opacity-80">Objects placed: {objectsPlaced}</p>
                            <p className="text-xs opacity-60">
                                {surfaceDetected ? 'Green ring shows placement location' : 'Point at floors, tables, walls'}
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}