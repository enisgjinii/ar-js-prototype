'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, AlertCircle } from 'lucide-react';

interface SimpleMobileARProps {
  onBack?: () => void;
}

// Ultra-simple AR that works on most devices
export default function SimpleMobileAR({ onBack }: SimpleMobileARProps) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [objectsPlaced, setObjectsPlaced] = useState(0);

  const startSimpleAR = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Check WebXR support
      if (!navigator.xr) {
        throw new Error('WebXR not supported. Please use Chrome on Android.');
      }

      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      if (!supported) {
        throw new Error(
          'AR not supported. Install Google Play Services for AR.'
        );
      }

      // Load Three.js
      const THREE = await import('three');

      const container = containerRef.current;
      if (!container) throw new Error('Container not found');

      console.log('✅ Starting simple AR with Three.js...');

      // Create scene
      const scene = new THREE.Scene();

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.01,
        20
      );

      // Create renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.xr.enabled = true;
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;

      container.appendChild(renderer.domElement);

      // Add lighting
      const light = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
      scene.add(light);

      // Add test cube
      const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: false,
      });
      const testCube = new THREE.Mesh(geometry, material);
      testCube.position.set(0, 0, -0.5);
      scene.add(testCube);

      console.log('✅ Test cube created');

      // Start XR session with minimal requirements
      const session = await navigator.xr.requestSession('immersive-ar');
      await renderer.xr.setSession(session);

      console.log('✅ AR session started');
      setIsARActive(true);
      setIsLoading(false);

      // Simple tap handler - place objects in front of camera
      let tapCount = 0;
      const handleTap = () => {
        tapCount++;
        console.log('👆 Tap detected #', tapCount);

        // Create sphere in front of camera
        const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({
          color: new (THREE as any).Color(
            Math.random(),
            Math.random(),
            Math.random()
          ),
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

        // Place in front of camera with some randomness
        const x = (Math.random() - 0.5) * 0.4;
        const y = (Math.random() - 0.5) * 0.2;
        const z = -0.3 - Math.random() * 0.4;

        sphere.position.set(x, y, z);
        scene.add(sphere);

        setObjectsPlaced(tapCount);
        console.log('🎯 Sphere placed at:', x, y, z);
      };

      renderer.domElement.addEventListener('click', handleTap);

      // Animation loop
      const animate = () => {
        testCube.rotation.x += 0.01;
        testCube.rotation.y += 0.01;
        renderer.render(scene, camera);
      };

      renderer.setAnimationLoop(animate);

      // Handle session end
      session.addEventListener('end', () => {
        console.log('AR session ended');
        setIsARActive(false);
        renderer.domElement.removeEventListener('click', handleTap);
      });
    } catch (err: any) {
      console.error('Simple AR Error:', err);
      setError(err.message || 'Failed to start AR');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen relative bg-black">
      <div ref={containerRef} className="w-full h-full" />

      {/* Start AR Button */}
      {!isARActive && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <Button
              onClick={startSimpleAR}
              className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white rounded-xl"
            >
              ✨ Simple AR
            </Button>
            <p className="text-white text-sm mt-2">
              Basic AR - No surface detection needed
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center text-white">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Starting Simple AR...</p>
            <p className="text-sm opacity-70">
              No complex features, just basics
            </p>
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
              ✨ Simple AR Active
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-center">
              <p className="font-medium">👆 Tap anywhere to place spheres</p>
              <p className="text-sm opacity-80">
                Objects placed: {objectsPlaced}
              </p>
              <p className="text-xs opacity-60">Look for spinning red cube!</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
