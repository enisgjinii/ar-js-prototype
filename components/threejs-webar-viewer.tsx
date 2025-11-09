'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Maximize2, RotateCcw } from 'lucide-react';

interface ThreeJSWebARViewerProps {
    modelUrl: string;
    usdzUrl?: string;
    modelTitle?: string;
    onClose?: () => void;
}

/**
 * Three.js WebAR Viewer
 * - Android Chrome: WebXR AR (stays in browser)
 * - iOS: Falls back to native AR Quick Look
 * - Desktop: 3D preview with controls
 */
export default function ThreeJSWebARViewer({
    modelUrl,
    usdzUrl,
    modelTitle = '3D Model',
    onClose
}: ThreeJSWebARViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isARSupported, setIsARSupported] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Check WebXR support
        if ('xr' in navigator) {
            (navigator as any).xr?.isSessionSupported('immersive-ar').then((supported: boolean) => {
                setIsARSupported(supported);
            });
        }

        // Load Three.js dynamically
        loadThreeJS();
    }, []);

    const loadThreeJS = async () => {
        try {
            setIsLoading(true);

            // Import Three.js modules
            const THREE = await import('three');
            const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
            const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

            if (!containerRef.current) return;

            // Setup scene
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf0f0f0);

            // Camera
            const camera = new THREE.PerspectiveCamera(
                75,
                containerRef.current.clientWidth / containerRef.current.clientHeight,
                0.1,
                1000
            );
            camera.position.set(0, 1, 3);

            // Renderer
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.xr.enabled = true;
            containerRef.current.appendChild(renderer.domElement);

            // Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 10, 7.5);
            scene.add(directionalLight);

            // Grid helper for reference
            const gridHelper = new THREE.GridHelper(10, 10);
            scene.add(gridHelper);

            // Controls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;

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
                    const scale = 2 / maxDim;
                    model.scale.multiplyScalar(scale);

                    model.position.sub(center.multiplyScalar(scale));

                    scene.add(model);
                    setIsLoading(false);

                    // Store model reference for AR
                    (window as any).__arModel = model;
                },
                undefined,
                (error) => {
                    console.error('Error loading model:', error);
                    setError('Failed to load 3D model');
                    setIsLoading(false);
                }
            );

            // Animation loop
            function animate() {
                renderer.setAnimationLoop(() => {
                    controls.update();
                    renderer.render(scene, camera);
                });
            }
            animate();

            // Handle resize
            const handleResize = () => {
                if (!containerRef.current) return;
                camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
            };
            window.addEventListener('resize', handleResize);

            // Cleanup
            return () => {
                window.removeEventListener('resize', handleResize);
                renderer.dispose();
                if (containerRef.current?.contains(renderer.domElement)) {
                    containerRef.current.removeChild(renderer.domElement);
                }
            };
        } catch (err) {
            console.error('Three.js error:', err);
            setError('Failed to initialize 3D viewer');
            setIsLoading(false);
        }
    };

    const startWebXRAR = async () => {
        try {
            if (!('xr' in navigator)) {
                throw new Error('WebXR not supported');
            }

            const xr = (navigator as any).xr;
            const session = await xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.body }
            });

            // WebXR session started - your UI stays visible!
            console.log('WebXR AR session started');

            // Note: Full WebXR implementation would go here
            // This is a simplified version

        } catch (err: any) {
            console.error('WebXR error:', err);
            setError('Failed to start AR. Try using Chrome on Android.');
        }
    };

    const launchIOSAR = () => {
        const iosUrl = usdzUrl || modelUrl.replace(/\.glb$/i, '.usdz');

        if (!iosUrl.endsWith('.usdz')) {
            setError('USDZ file not available for iOS');
            return;
        }

        const anchor = document.createElement('a');
        anchor.rel = 'ar';
        anchor.href = iosUrl;
        const img = document.createElement('img');
        anchor.appendChild(img);
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };

    const handleARClick = () => {
        if (isIOS) {
            launchIOSAR();
        } else if (isARSupported) {
            startWebXRAR();
        } else {
            setError('AR not supported on this device. Try Chrome on Android or Safari on iOS.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Header with controls */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                    <div className="text-white">
                        <h2 className="text-lg font-semibold">{modelTitle}</h2>
                        <p className="text-sm text-gray-300">
                            {isIOS ? 'iOS - Native AR' : isARSupported ? 'WebXR Ready' : '3D Preview'}
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

            {/* 3D Viewer Container */}
            <div ref={containerRef} className="w-full h-full" />

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
                {isLoading ? (
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
                        <p>Loading 3D model...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 mb-4">
                        <p>{error}</p>
                    </div>
                ) : null}

                <div className="flex gap-3">
                    <Button
                        onClick={handleARClick}
                        className="flex-1 py-6 text-lg bg-blue-600 hover:bg-blue-700"
                        disabled={isLoading || (!isARSupported && !isIOS)}
                    >
                        {isIOS ? '📱 View in AR (Quick Look)' : '🥽 View in AR (WebXR)'}
                    </Button>
                </div>

                {!isARSupported && !isIOS && (
                    <p className="text-center text-sm text-gray-400 mt-3">
                        AR requires Chrome on Android or Safari on iOS
                    </p>
                )}
            </div>
        </div>
    );
}
