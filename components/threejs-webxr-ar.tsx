'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Info, AlertCircle } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ThreeJSWebXRARProps {
    modelUrl: string;
    modelTitle?: string;
    onClose?: () => void;
}

/**
 * Three.js WebXR AR Viewer
 * - Android Chrome: WebXR AR (stays in browser)
 * - iOS: Fallback message (WebXR not supported)
 * - Desktop: 3D preview with controls
 */
export default function ThreeJSWebXRAR({
    modelUrl,
    modelTitle = '3D Model',
    onClose
}: ThreeJSWebXRARProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);
    const reticleRef = useRef<THREE.Mesh | null>(null);
    const hitTestSourceRef = useRef<XRHitTestSource | null>(null);
    const hitTestSourceRequestedRef = useRef(false);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isARSupported, setIsARSupported] = useState(false);
    const [isInAR, setIsInAR] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

    useEffect(() => {
        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
        } else if (/android/.test(userAgent)) {
            setPlatform('android');
        }

        // Check WebXR support
        if ('xr' in navigator) {
            (navigator as any).xr?.isSessionSupported('immersive-ar').then((supported: boolean) => {
                setIsARSupported(supported);
                console.log('WebXR AR supported:', supported);
            });
        }

        initThreeJS();

        return () => {
            cleanup();
        };
    }, []);

    const initThreeJS = async () => {
        if (!containerRef.current) return;

        try {
            // Scene
            const scene = new THREE.Scene();
            sceneRef.current = scene;

            // Camera
            const camera = new THREE.PerspectiveCamera(
                70,
                containerRef.current.clientWidth / containerRef.current.clientHeight,
                0.01,
                20
            );
            camera.position.set(0, 1.6, 3);
            cameraRef.current = camera;

            // Renderer
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
            renderer.xr.enabled = true;
            renderer.shadowMap.enabled = true;
            containerRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(0, 10, 10);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            // Controls for non-AR mode
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.target.set(0, 1, 0);
            controls.update();
            controlsRef.current = controls;

            // Ground plane for preview
            const groundGeometry = new THREE.PlaneGeometry(10, 10);
            const groundMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 0.8,
                metalness: 0.2
            });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            scene.add(ground);

            // Reticle for AR placement (invisible in preview mode)
            const reticleGeometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
            const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
            reticle.matrixAutoUpdate = false;
            reticle.visible = false;
            scene.add(reticle);
            reticleRef.current = reticle;

            // Load model
            const loader = new GLTFLoader();
            loader.load(
                modelUrl,
                (gltf) => {
                    const model = gltf.scene;

                    // Center and scale model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());

                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 1.5 / maxDim;
                    model.scale.multiplyScalar(scale);

                    model.position.sub(center.multiplyScalar(scale));
                    model.position.y = 0;

                    // Enable shadows
                    model.traverse((child) => {
                        if ((child as THREE.Mesh).isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    scene.add(model);
                    modelRef.current = model;

                    setIsLoading(false);
                    console.log('✅ Model loaded successfully');
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total) * 100;
                    console.log(`Loading: ${percent.toFixed(0)}%`);
                },
                (error) => {
                    console.error('❌ Error loading model:', error);
                    setError('Failed to load 3D model');
                    setIsLoading(false);
                }
            );

            // Animation loop
            renderer.setAnimationLoop((timestamp, frame) => {
                if (frame && isInAR) {
                    // AR mode
                    handleARFrame(frame);
                } else {
                    // Preview mode
                    controls.update();
                }
                renderer.render(scene, camera);
            });

            // Handle resize
            const handleResize = () => {
                if (!containerRef.current || !camera || !renderer) return;
                camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
            };
            window.addEventListener('resize', handleResize);

        } catch (err) {
            console.error('Three.js initialization error:', err);
            setError('Failed to initialize 3D viewer');
            setIsLoading(false);
        }
    };

    const handleARFrame = (frame: XRFrame) => {
        const session = frame.session;
        const referenceSpace = rendererRef.current?.xr.getReferenceSpace();

        if (!referenceSpace) return;

        // Request hit test source
        if (!hitTestSourceRequestedRef.current) {
            session.requestReferenceSpace('viewer').then((viewerSpace) => {
                const hitTestRequest = session.requestHitTestSource?.({ space: viewerSpace });
                if (hitTestRequest) {
                    hitTestRequest.then((source) => {
                        hitTestSourceRef.current = source;
                    });
                }
            });
            hitTestSourceRequestedRef.current = true;
        }

        // Hit test
        if (hitTestSourceRef.current && reticleRef.current) {
            const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);

            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(referenceSpace);

                if (pose) {
                    reticleRef.current.visible = true;
                    reticleRef.current.matrix.fromArray(pose.transform.matrix);
                }
            } else {
                reticleRef.current.visible = false;
            }
        }
    };

    const startAR = async () => {
        if (!rendererRef.current || !isARSupported) {
            setError('WebXR AR not supported on this device');
            return;
        }

        try {
            const session = await (navigator as any).xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.body }
            });

            await rendererRef.current.xr.setSession(session);
            setIsInAR(true);

            // Show reticle in AR mode
            if (reticleRef.current) {
                reticleRef.current.visible = true;
            }

            // Handle session end
            session.addEventListener('end', () => {
                setIsInAR(false);
                hitTestSourceRef.current = null;
                hitTestSourceRequestedRef.current = false;
                if (reticleRef.current) {
                    reticleRef.current.visible = false;
                }
            });

            // Handle select (tap to place)
            session.addEventListener('select', () => {
                if (reticleRef.current && reticleRef.current.visible && modelRef.current) {
                    // Clone model and place at reticle position
                    const clone = modelRef.current.clone();
                    clone.position.setFromMatrixPosition(reticleRef.current.matrix);
                    sceneRef.current?.add(clone);
                }
            });

            console.log('✅ AR session started');
        } catch (err) {
            console.error('❌ Failed to start AR:', err);
            setError('Failed to start AR session. Make sure you granted camera permission.');
        }
    };

    const cleanup = () => {
        if (controlsRef.current) {
            controlsRef.current.dispose();
        }
        if (rendererRef.current) {
            rendererRef.current.dispose();
            if (containerRef.current?.contains(rendererRef.current.domElement)) {
                containerRef.current.removeChild(rendererRef.current.domElement);
            }
        }
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

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4 z-20">
                <div className="flex items-center justify-between">
                    <div className="text-white">
                        <h2 className="text-lg font-semibold">{modelTitle}</h2>
                        <p className="text-sm text-gray-300">
                            {isInAR ? 'Tap to place model' : 'Three.js WebXR AR'}
                        </p>
                    </div>
                    {onClose && !isInAR && (
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

            {/* 3D Container */}
            <div ref={containerRef} className="flex-1 relative" />

            {/* Loading */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                        <p>Loading 3D model...</p>
                    </div>
                </div>
            )}

            {/* Controls */}
            {!isLoading && !isInAR && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 z-20">
                    {isARSupported ? (
                        <>
                            <Button
                                onClick={startAR}
                                className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mb-4"
                            >
                                🥽 Start AR Experience
                            </Button>
                            <div className="flex items-start gap-2 text-sm text-gray-300">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>
                                    <strong className="text-white">✅ WebXR Ready:</strong> Your browser UI stays visible during AR!
                                    Tap the button to start, then tap on surfaces to place the model.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-start gap-2 text-sm text-gray-300">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                                {platform === 'ios' ? (
                                    <p>
                                        <strong className="text-white">⚠️ iOS Not Supported:</strong> Apple Safari doesn't support WebXR.
                                        Use model-viewer component for iOS AR Quick Look instead.
                                    </p>
                                ) : (
                                    <p>
                                        <strong className="text-white">⚠️ WebXR Not Available:</strong> Update Chrome and enable WebXR flags at chrome://flags
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* AR Instructions */}
            {isInAR && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 z-20">
                    <div className="text-center text-white">
                        <p className="text-lg font-semibold mb-2">👆 Tap to Place Model</p>
                        <p className="text-sm text-gray-300">Point at a surface and tap to place the 3D model</p>
                    </div>
                </div>
            )}
        </div>
    );
}
