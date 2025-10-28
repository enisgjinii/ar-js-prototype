'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, RotateCw, HelpCircle } from 'lucide-react';
import ARHelpModal from '@/components/ar-help-modal';

declare global {
  interface Window {
    AFRAME: any;
    ARjs: any;
  }
}

interface ARCameraViewProps {
  onBack?: () => void;
}

export default function ARCameraView({ onBack }: ARCameraViewProps) {
  const t = useT();
  const sceneRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isARReady, setIsARReady] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!sceneRef.current) return;

    initializeARScene();

    return () => {
      // Clean up AR.js scene
      if (window.AFRAME && sceneRef.current) {
        const scene = sceneRef.current.querySelector('a-scene');
        if (scene) {
          scene.remove();
        }
      }
    };
  }, []);

  const initializeARScene = () => {
    if (!sceneRef.current) return;

    try {
      // Check if AFRAME is available
      if (typeof window !== 'undefined' && window.AFRAME && window.ARjs) {
        createARScene();
        setIsARReady(true);
        setIsLoading(false);
      } else {
        // Fallback to basic camera implementation
        createBasicCameraScene();
      }
    } catch (err) {
      console.error('AR initialization error:', err);
      // Fallback to basic camera implementation
      createBasicCameraScene();
    }
  };

  const createARScene = () => {
    if (!sceneRef.current) return;

    // Clear the container
    sceneRef.current.innerHTML = '';

    // Create A-Frame scene with AR.js
    const scene = document.createElement('a-scene');
    scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false;');
    scene.setAttribute(
      'renderer',
      'logarithmicDepthBuffer: true; antialias: true;'
    );
    scene.setAttribute('vr-mode-ui', 'enabled: false');

    // Add a marker for Hiro pattern
    const marker = document.createElement('a-marker');
    marker.setAttribute('preset', 'hiro');

    // Create a box as a sample 3D object
    const box = document.createElement('a-box');
    box.setAttribute('position', '0 0.5 0');
    box.setAttribute(
      'material',
      'color: #4F46E5; metalness: 0.8; roughness: 0.2'
    );

    // Add animation
    const animation = document.createElement('a-animation');
    animation.setAttribute('attribute', 'rotation');
    animation.setAttribute('to', '0 360 0');
    animation.setAttribute('dur', '2000');
    animation.setAttribute('easing', 'linear');
    animation.setAttribute('repeat', 'indefinite');
    box.appendChild(animation);

    // Add the box to the marker
    marker.appendChild(box);

    // Add a text element
    const text = document.createElement('a-text');
    text.setAttribute('value', 'AR Object');
    text.setAttribute('position', '0 1.5 0');
    text.setAttribute('align', 'center');
    text.setAttribute('color', '#ffffff');
    text.setAttribute('scale', '1.5 1.5 1.5');
    marker.appendChild(text);

    // Add marker to scene
    scene.appendChild(marker);

    // Add a camera entity
    const camera = document.createElement('a-entity');
    camera.setAttribute('camera', '');
    scene.appendChild(camera);

    // Add scene to container
    sceneRef.current.appendChild(scene);

    // Handle scene loaded event
    scene.addEventListener('loaded', () => {
      setIsLoading(false);
    });
  };

  const createBasicCameraScene = () => {
    if (!sceneRef.current) return;

    // Clear the container
    sceneRef.current.innerHTML = '';

    // Create a container for the camera feed
    const videoContainer = document.createElement('div');
    videoContainer.style.position = 'absolute';
    videoContainer.style.top = '0';
    videoContainer.style.left = '0';
    videoContainer.style.width = '100%';
    videoContainer.style.height = '100%';
    videoContainer.style.overflow = 'hidden';
    videoContainer.style.zIndex = '1';

    // Create video element for camera feed
    const video = document.createElement('video');
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    videoContainer.appendChild(video);
    sceneRef.current.appendChild(videoContainer);

    // Create overlay for AR content
    const overlay = document.createElement('div');
    overlay.id = 'ar-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '2';
    overlay.style.pointerEvents = 'none';

    sceneRef.current.appendChild(overlay);

    // Start camera
    startCamera(video);
  };

  const startCamera = async (video: HTMLVideoElement) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      video.srcObject = stream;
      setIsLoading(false);
    } catch (err) {
      setError('Camera access denied: ' + (err as Error).message);
      setIsLoading(false);
    }
  };

  const placeObject = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isARReady) return;

    const overlay = document.getElementById('ar-overlay');
    if (!overlay) return;

    // Get click position relative to the overlay
    const rect = overlay.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Create a new object
    const objectId = `ar-object-${Date.now()}`;

    // Create the visual element
    const objectElement = document.createElement('div');
    objectElement.id = objectId;
    objectElement.style.position = 'absolute';
    objectElement.style.left = `${x}%`;
    objectElement.style.top = `${y}%`;
    objectElement.style.transform = 'translate(-50%, -50%)';
    objectElement.style.width = '80px';
    objectElement.style.height = '80px';
    objectElement.style.pointerEvents = 'auto';
    objectElement.style.zIndex = '3';

    // Create the AR object
    const arObject = document.createElement('div');
    arObject.style.width = '100%';
    arObject.style.height = '100%';
    arObject.style.backgroundColor = 'rgba(79, 70, 229, 0.9)';
    arObject.style.borderRadius = '8px';
    arObject.style.boxShadow = '0 0 20px rgba(79, 70, 229, 0.7)';
    arObject.style.display = 'flex';
    arObject.style.alignItems = 'center';
    arObject.style.justifyContent = 'center';
    arObject.style.color = 'white';
    arObject.style.fontWeight = 'bold';
    arObject.style.fontSize = '12px';
    arObject.style.textAlign = 'center';
    arObject.textContent = 'AR Object';

    // Add animation
    arObject.style.animation = 'pulse 2s infinite';

    // Add CSS for animation if not already added
    if (!document.getElementById('ar-animations')) {
      const style = document.createElement('style');
      style.id = 'ar-animations';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
      `;
      document.head.appendChild(style);
    }

    // Add remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = '×';
    removeButton.style.position = 'absolute';
    removeButton.style.top = '-10px';
    removeButton.style.right = '-10px';
    removeButton.style.width = '24px';
    removeButton.style.height = '24px';
    removeButton.style.borderRadius = '50%';
    removeButton.style.backgroundColor = '#ef4444';
    removeButton.style.color = 'white';
    removeButton.style.border = 'none';
    removeButton.style.cursor = 'pointer';
    removeButton.style.fontSize = '16px';
    removeButton.style.fontWeight = 'bold';
    removeButton.style.display = 'flex';
    removeButton.style.alignItems = 'center';
    removeButton.style.justifyContent = 'center';
    removeButton.onclick = () => {
      objectElement.remove();
    };

    objectElement.appendChild(arObject);
    objectElement.appendChild(removeButton);
    overlay.appendChild(objectElement);
  };

  const resetARSession = () => {
    setError(null);

    // Clear all placed objects
    const overlay = document.getElementById('ar-overlay');
    if (overlay) {
      while (overlay.firstChild) {
        overlay.removeChild(overlay.firstChild);
      }
    }
  };

  return (
    <div className="w-full h-screen relative bg-black">
      {/* AR Scene Container */}
      <div ref={sceneRef} className="w-full h-full" onClick={placeObject} />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="text-white">{t('ar.initializing')}</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="bg-red-500/90 text-white p-4 rounded-lg max-w-md text-center">
            <p className="font-bold mb-2">AR Error</p>
            <p className="mb-4 text-sm">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
                size="sm"
              >
                {t('ar.retry')}
              </Button>
              <Button onClick={resetARSession} variant="secondary" size="sm">
                <RotateCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={onBack}
          variant="secondary"
          className="bg-background/80 backdrop-blur-sm"
        >
          {t('common.back')}
        </Button>
      </div>

      {/* Help Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={() => setShowHelp(true)}
          variant="secondary"
          size="icon"
          className="bg-background/80 backdrop-blur-sm rounded-full w-12 h-12"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>

      {/* AR Controls */}
      <div className="absolute bottom-20 left-0 right-0 z-10 flex justify-center gap-4">
        {isARReady ? (
          <>
            <Button
              onClick={resetARSession}
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg"
            >
              <RotateCw className="h-4 w-4 mr-1" />
              Clear Objects
            </Button>
          </>
        ) : (
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full shadow-lg"
          >
            Retry AR Initialization
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-0 right-0 z-10 text-center">
        <div className="inline-block bg-background/80 backdrop-blur-sm rounded-lg p-3 mx-auto">
          <p className="text-sm text-foreground">
            {isARReady
              ? 'Point camera at a Hiro marker to see AR objects'
              : 'AR.js is initializing...'}
          </p>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && <ARHelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
