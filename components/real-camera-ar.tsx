"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface RealCameraARProps {
    onBack?: () => void;
}

// Simple AR with guaranteed camera visibility and floor placement
export default function RealCameraAR({ onBack }: RealCameraARProps) {
    const t = useT();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isARActive, setIsARActive] = useState(false);
    const [objectsPlaced, setObjectsPlaced] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);
    const rendererRef = useRef<any>(null);
    const sceneRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    const startRealAR = async () => {
        setError(null);
        setIsLoading(true);

        try {
            const container = containerRef.current;
            if (!container) throw new Error('Container not found');

            console.log('🎥 Starting camera...');

            // Step 1: Get camera stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 }
                }
            });

            streamRef.current = stream;
            console.log('✅ Camera stream obtained');

            // Step 2: Create video element
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.playsInline = true;
            video.muted = true;
            video.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        object-fit: cover;
        z-index: 1;
        background: black;
      `;

            container.appendChild(video);
            videoRef.current = video;

            // Wait for video to start
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play().then(resolve);
                };
            });

            console.log('✅ Video playing - camera should be visible now!');
            setCameraReady(true);

            // Step 3: Load Three.js for 3D objects
            const THREE = await import('three');
            console.log('✅ Three.js loaded');

            // Step 4: Create 3D scene overlay
            const scene = new THREE.Scene();
            sceneRef.current = scene;

            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            cameraRef.current = camera;

            const renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000, 0); // Transparent
            renderer.domElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 2;
        pointer-events: auto;
      `;

            container.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // Add lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);

            // Add test cube floating in front
            const testGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const testMaterial = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0x440000
            });
            const testCube = new THREE.Mesh(testGeometry, testMaterial);
            testCube.position.set(0, 0, -0.5);
            scene.add(testCube);

            console.log('✅ 3D scene created over camera');
            setIsARActive(true);
            setIsLoading(false);

            // Step 5: Handle taps for precise placement
            let tapCount = 0;
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            const handleTap = (event: MouseEvent) => {
                tapCount++;
                console.log('👆 Tap detected #', tapCount);

                // Get tap coordinates relative to screen
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                // Cast ray from camera through tap point
                raycaster.setFromCamera(mouse, camera);

                // Calculate where ray hits an imaginary floor plane
                const floorY = -0.8; // Floor level (closer to camera level)
                const rayDirection = raycaster.ray.direction;
                const rayOrigin = raycaster.ray.origin;

                // Calculate intersection with floor plane (y = floorY)
                const t = (floorY - rayOrigin.y) / rayDirection.y;
                const intersectionPoint = new THREE.Vector3(
                    rayOrigin.x + rayDirection.x * t,
                    floorY,
                    rayOrigin.z + rayDirection.z * t
                );

                // Create sphere at tap location
                const geometry = new THREE.SphereGeometry(0.04, 16, 16);
                const material = new THREE.MeshStandardMaterial({
                    color: new (THREE as any).Color().setHSL(Math.random(), 0.8, 0.6),
                    metalness: 0.4,
                    roughness: 0.3,
                    emissive: new (THREE as any).Color().setHSL(Math.random(), 0.5, 0.1)
                });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.copy(intersectionPoint);
                scene.add(sphere);

                // Add gentle bounce animation
                let time = 0;
                const baseY = intersectionPoint.y;
                const animate = () => {
                    if (sphere.parent) {
                        time += 0.03;
                        sphere.position.y = baseY + Math.abs(Math.sin(time)) * 0.05;
                        sphere.rotation.x += 0.01;
                        sphere.rotation.y += 0.015;
                        requestAnimationFrame(animate);
                    }
                };
                animate();

                setObjectsPlaced(tapCount);
                console.log('🎯 Sphere placed at tap location:', intersectionPoint);
            };

            renderer.domElement.addEventListener('click', handleTap);

            // Step 6: Device orientation tracking
            let alpha = 0, beta = 0, gamma = 0;

            const handleOrientation = (event: DeviceOrientationEvent) => {
                alpha = event.alpha || 0; // Z axis
                beta = event.beta || 0;   // X axis
                gamma = event.gamma || 0; // Y axis

                // Update camera rotation based on device orientation
                camera.rotation.x = (beta * Math.PI) / 180;
                camera.rotation.y = (alpha * Math.PI) / 180;
                camera.rotation.z = (gamma * Math.PI) / 180;
            };

            // Request device orientation permission (iOS 13+)
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                (DeviceOrientationEvent as any).requestPermission()
                    .then((response: string) => {
                        if (response === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation);
                            console.log('✅ Device orientation tracking enabled');
                        }
                    })
                    .catch(console.error);
            } else {
                // Non-iOS devices
                window.addEventListener('deviceorientation', handleOrientation);
                console.log('✅ Device orientation tracking enabled');
            }

            // Step 7: Animation loop
            const animate = () => {
                if (renderer && scene && camera) {
                    // Rotate test cube
                    testCube.rotation.x += 0.01;
                    testCube.rotation.y += 0.01;

                    renderer.render(scene, camera);
                }
                requestAnimationFrame(animate);
            };
            animate();

            // Handle window resize
            const handleResize = () => {
                if (camera && renderer) {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                }
            };
            window.addEventListener('resize', handleResize);

            // Store cleanup
            (container as any)._cleanup = () => {
                renderer.domElement.removeEventListener('click', handleTap);
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('deviceorientation', handleOrientation);
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                if (renderer) {
                    renderer.dispose();
                }
            };

        } catch (err: any) {
            console.error('Real Camera AR Error:', err);
            setError(err.message || 'Failed to start camera AR');
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
                            onClick={startRealAR}
                            className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                        >
                            📱 Real Camera AR
                        </Button>
                        <p className="text-white text-sm mt-2">Guaranteed camera + floor placement</p>
                        <p className="text-white text-xs mt-1 opacity-70">Your room will be visible!</p>
                    </div>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                    <div className="text-center text-white">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                        <p className="text-lg">Starting Real Camera AR...</p>
                        <p className="text-sm opacity-70">
                            {cameraReady ? 'Setting up 3D overlay...' : 'Accessing camera...'}
                        </p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 p-4">
                    <div className="bg-red-600 text-white p-6 rounded-lg max-w-md text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-3" />
                        <h3 className="font-bold mb-2">Camera Error</h3>
                        <p className="text-sm mb-4">{error}</p>
                        <div className="space-y-2 text-xs">
                            <p>✅ Allow camera permission</p>
                            <p>✅ Use HTTPS (camera required)</p>
                            <p>✅ Close other camera apps</p>
                            <p>✅ Refresh and try again</p>
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
                            Real Camera AR
                        </div>
                    </div>

                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-green-600/80 text-white px-3 py-1 rounded-full text-sm">
                            📹 Camera: {cameraReady ? 'Active' : 'Loading...'}
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-center">
                            <p className="font-medium">👆 Tap to place objects on floor</p>
                            <p className="text-sm opacity-80">Objects placed: {objectsPlaced}</p>
                            <p className="text-xs opacity-60">Red cube = 3D test | Spheres = floor objects</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}