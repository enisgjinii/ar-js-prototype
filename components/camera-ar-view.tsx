'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, AlertCircle } from 'lucide-react';

interface CameraARViewProps {
  onBack?: () => void;
}

// Simple AR with visible camera feed
export default function CameraARView({ onBack }: CameraARViewProps) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [objectsPlaced, setObjectsPlaced] = useState(0);

  const startCameraAR = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const container = containerRef.current;
      if (!container) throw new Error('Container not found');

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log('✅ Camera stream obtained');

      // Create video element for camera feed
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      video.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 1;
      `;

      container.appendChild(video);
      videoRef.current = video;

      await video.play();
      console.log('✅ Video playing');

      // Load A-Frame
      await loadAFrame();
      console.log('✅ A-Frame loaded');

      // Create A-Frame scene overlay
      const sceneHTML = `
        <a-scene 
          embedded 
          background="transparent"
          vr-mode-ui="enabled: false"
          renderer="alpha: true; antialias: true;"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; pointer-events: auto;"
        >
          <!-- Test cube -->
          <a-box 
            id="test-cube"
            position="0 0 -1" 
            rotation="0 45 0" 
            color="#ff0000" 
            scale="0.1 0.1 0.1"
            animation="property: rotation; to: 360 405 360; loop: true; dur: 4000">
          </a-box>

          <!-- Camera (no video, just for 3D positioning) -->
          <a-camera 
            id="ar-camera"
            look-controls-enabled="true"
            wasd-controls-enabled="false"
            position="0 0 0">
          </a-camera>

          <!-- Lighting -->
          <a-light type="ambient" color="#404040"></a-light>
          <a-light type="directional" position="1 1 1" color="#ffffff"></a-light>
        </a-scene>
      `;

      const sceneDiv = document.createElement('div');
      sceneDiv.innerHTML = sceneHTML;
      container.appendChild(sceneDiv);

      // Wait for A-Frame to load
      const scene = sceneDiv.querySelector('a-scene') as any;
      await new Promise(resolve => {
        if (scene.hasLoaded) {
          resolve(true);
        } else {
          scene.addEventListener('loaded', resolve);
        }
      });

      console.log('✅ A-Frame scene loaded over camera');
      setIsARActive(true);
      setIsLoading(false);

      // Add tap handler for placing objects
      let tapCount = 0;
      const handleTap = (event: MouseEvent) => {
        tapCount++;
        console.log('👆 Tap detected #', tapCount);

        // Get camera
        const camera = scene.querySelector('#ar-camera');
        const cameraPosition = camera.getAttribute('position');
        const cameraRotation = camera.getAttribute('rotation');

        // Calculate position in front of camera
        const distance = 0.5 + Math.random() * 0.5;
        const angle = (cameraRotation.y * Math.PI) / 180;

        const x =
          cameraPosition.x +
          Math.sin(angle) * distance +
          (Math.random() - 0.5) * 0.3;
        const y = cameraPosition.y + (Math.random() - 0.5) * 0.2;
        const z = cameraPosition.z - Math.cos(angle) * distance;

        // Create sphere
        const sphere = document.createElement('a-sphere');
        sphere.setAttribute('position', `${x} ${y} ${z}`);
        sphere.setAttribute('radius', '0.05');
        sphere.setAttribute('color', `hsl(${Math.random() * 360}, 70%, 60%)`);
        sphere.setAttribute('metalness', '0.3');
        sphere.setAttribute('roughness', '0.4');
        sphere.setAttribute(
          'animation',
          'property: rotation; to: 0 360 0; loop: true; dur: 3000'
        );

        scene.appendChild(sphere);
        setObjectsPlaced(tapCount);

        console.log('🎯 Sphere placed at:', x, y, z);
      };

      container.addEventListener('click', handleTap);

      // Store cleanup
      (container as any)._cleanup = () => {
        container.removeEventListener('click', handleTap);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };
    } catch (err: any) {
      console.error('Camera AR Error:', err);
      setError(err.message || 'Failed to start camera AR');
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

      const script = document.createElement('script');
      script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load A-Frame'));
      document.head.appendChild(script);
    });
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
    <div className="w-full h-screen relative bg-black">
      <div ref={containerRef} className="w-full h-full" />

      {/* Start AR Button */}
      {!isARActive && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <Button
              onClick={startCameraAR}
              className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white rounded-xl"
            >
              📹 Camera AR
            </Button>
            <p className="text-white text-sm mt-2">Camera feed + 3D objects</p>
            <p className="text-white text-xs mt-1 opacity-70">
              Guaranteed camera visibility
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center text-white">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Starting Camera AR...</p>
            <p className="text-sm opacity-70">Setting up camera feed</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 p-4">
          <div className="bg-red-600 text-white p-6 rounded-lg max-w-md text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-3" />
            <h3 className="font-bold mb-2">Camera AR Error</h3>
            <p className="text-sm mb-4">{error}</p>
            <div className="space-y-2 text-xs">
              <p>✅ Allow camera permission</p>
              <p>✅ Use HTTPS (required for camera)</p>
              <p>✅ Try refreshing the page</p>
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
              📹 Camera AR Active
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-center">
              <p className="font-medium">👆 Tap to place spheres</p>
              <p className="text-sm opacity-80">
                Objects placed: {objectsPlaced}
              </p>
              <p className="text-xs opacity-60">Camera feed + 3D overlay</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
