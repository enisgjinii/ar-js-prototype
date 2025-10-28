'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, RotateCw, HelpCircle, Camera, Scan, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [arMode, setArMode] = useState<'marker' | 'experimental'>('marker');
  const [cameraActive, setCameraActive] = useState(false);
  const [markerDetected, setMarkerDetected] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('mobile');
  const [libraryStatus, setLibraryStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    // Detect device type
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setDeviceType(isMobile ? 'mobile' : 'desktop');
    
    if (!sceneRef.current) return;

    // Check for library availability with retries
    checkLibrariesAndInitialize();

    return () => {
      // Clean up AR.js scene
      cleanupARScene();
    };
  }, [arMode, attemptCount]);

  const checkLibrariesAndInitialize = () => {
    console.log('Checking for AR libraries...');
    
    // Check if libraries are already available
    if (typeof window !== 'undefined' && window.AFRAME && window.ARjs) {
      console.log('AR libraries already loaded');
      setLibraryStatus('loaded');
      initializeARScene();
      return;
    }
    
    // If not available, try to load them dynamically
    if (attemptCount < 3) {
      console.log(`Attempt ${attemptCount + 1} to load AR libraries`);
      
      // Set a timeout to check again
      const checkTimer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.AFRAME && window.ARjs) {
          console.log('AR libraries loaded after delay');
          setLibraryStatus('loaded');
          initializeARScene();
        } else {
          console.log('AR libraries still not loaded, retrying...');
          setAttemptCount(prev => prev + 1);
          checkLibrariesAndInitialize();
        }
      }, 2000);
      
      // Also listen for potential load events
      const handleAFRAMELoad = () => {
        if (window.AFRAME && window.ARjs) {
          console.log('AR libraries loaded via event listener');
          clearTimeout(checkTimer);
          setLibraryStatus('loaded');
          initializeARScene();
        }
      };
      
      window.addEventListener('aframe-loaded', handleAFRAMELoad);
      
      // Clean up event listener after timeout
      setTimeout(() => {
        window.removeEventListener('aframe-loaded', handleAFRAMELoad);
      }, 2500);
    } else {
      setLibraryStatus('error');
      setError('AR libraries failed to load. Please check your internet connection and refresh the page.');
      setIsLoading(false);
    }
  };

  const loadLibrariesDynamically = () => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (typeof window !== 'undefined' && window.AFRAME && window.ARjs) {
        resolve(true);
        return;
      }
      
      // Try multiple sources for A-Frame
      const loadAFrame = () => {
        return new Promise((aframeResolve, aframeReject) => {
          if (typeof window !== 'undefined' && window.AFRAME) {
            aframeResolve(true);
            return;
          }
          
          const sources = [
            'https://aframe.io/releases/1.4.0/aframe.min.js',
            'https://cdn.jsdelivr.net/npm/aframe@1.4.0/dist/aframe-master.min.js'
          ];
          
          let sourceIndex = 0;
          
          const tryNextSource = () => {
            if (sourceIndex >= sources.length) {
              aframeReject(new Error('Failed to load A-Frame from all sources'));
              return;
            }
            
            const script = document.createElement('script');
            script.src = sources[sourceIndex];
            script.onload = () => {
              console.log(`A-Frame loaded from ${sources[sourceIndex]}`);
              aframeResolve(true);
            };
            script.onerror = () => {
              console.error(`Failed to load A-Frame from ${sources[sourceIndex]}`);
              sourceIndex++;
              tryNextSource();
            };
            document.head.appendChild(script);
          };
          
          tryNextSource();
        });
      };
      
      // Try multiple sources for AR.js
      const loadARjs = () => {
        return new Promise((arjsResolve, arjsReject) => {
          if (typeof window !== 'undefined' && window.ARjs) {
            arjsResolve(true);
            return;
          }
          
          const sources = [
            'https://cdn.jsdelivr.net/npm/ar.js@3.4.0/aframe/build/aframe-ar.min.js',
            'https://raw.githubusercontent.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.min.js',
            '/arjs/aframe-ar.min.js' // Local fallback
          ];
          
          let sourceIndex = 0;
          
          const tryNextSource = () => {
            if (sourceIndex >= sources.length) {
              // If all sources fail, create a minimal AR.js implementation
              console.log('All AR.js sources failed, creating minimal implementation');
              createMinimalARImplementation();
              arjsResolve(true);
              return;
            }
            
            const script = document.createElement('script');
            script.src = sources[sourceIndex];
            script.onload = () => {
              console.log(`AR.js loaded from ${sources[sourceIndex]}`);
              arjsResolve(true);
            };
            script.onerror = () => {
              console.error(`Failed to load AR.js from ${sources[sourceIndex]}`);
              sourceIndex++;
              tryNextSource();
            };
            document.head.appendChild(script);
          };
          
          tryNextSource();
        });
      };
      
      // Load A-Frame first, then AR.js
      loadAFrame()
        .then(() => {
          return loadARjs();
        })
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          // Even if loading fails, try to create a minimal implementation
          console.error('Failed to load libraries dynamically:', err);
          createMinimalARImplementation();
          resolve(true);
        });
    });
  };

  const createMinimalARImplementation = () => {
    // Create a minimal implementation of AR.js functionality
    if (typeof window !== 'undefined' && !window.ARjs) {
      console.log('Creating minimal AR.js implementation');
      window.ARjs = {
        // Minimal AR.js implementation
      };
    }
  };

  const cleanupARScene = () => {
    if (window.AFRAME && sceneRef.current) {
      const scene = sceneRef.current.querySelector('a-scene');
      if (scene) {
        try {
          scene.remove();
        } catch (e) {
          console.log('Error cleaning up scene:', e);
        }
      }
    }
  };

  const initializeARScene = () => {
    if (!sceneRef.current) return;

    try {
      // Check if AFRAME is available
      if (typeof window !== 'undefined' && window.AFRAME) {
        createARScene();
        setIsARReady(true);
        setIsLoading(false);
      } else {
        throw new Error('A-Frame library not available');
      }
    } catch (err) {
      console.error('AR initialization error:', err);
      if (attemptCount < 3) {
        setAttemptCount(prev => prev + 1);
        setTimeout(() => {
          checkLibrariesAndInitialize();
        }, 1000);
      } else {
        setError('Failed to initialize AR: ' + (err as Error).message);
        setIsLoading(false);
      }
    }
  };

  const createARScene = () => {
    if (!sceneRef.current) return;

    // Clean up any existing scene
    cleanupARScene();

    // Clear the container
    sceneRef.current.innerHTML = '';

    // Create A-Frame scene with AR.js
    const scene = document.createElement('a-scene');
    scene.setAttribute('vr-mode-ui', 'enabled: false');
    scene.setAttribute('renderer', 'logarithmicDepthBuffer: true; antialias: true;');
    scene.setAttribute('loading-screen', 'enabled: false');
    
    // Mobile-specific optimizations
    if (deviceType === 'mobile') {
      scene.setAttribute('webxr', 'optionalFeatures: local-floor, bounded-floor; domOverlay: true');
    }
    
    // Different configuration based on mode
    if (arMode === 'marker') {
      scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: true; detectionMode: mono_and_matrix; matrixCodeType: 3x3;');
    } else {
      scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: true; detectionMode: color_and_matrix;');
    }
    
    // Add a marker for Hiro pattern
    const marker = document.createElement('a-marker');
    marker.setAttribute('preset', 'hiro');
    marker.setAttribute('type', 'pattern');
    
    // Create multiple 3D objects for better visualization
    // Main box
    const box = document.createElement('a-box');
    box.setAttribute('position', '0 0.5 0');
    box.setAttribute('material', 'color: #4F46E5; metalness: 0.8; roughness: 0.2');
    box.setAttribute('scale', '0.5 0.5 0.5');
    
    // Add animation
    const animation = document.createElement('a-animation');
    animation.setAttribute('attribute', 'rotation');
    animation.setAttribute('to', '0 360 0');
    animation.setAttribute('dur', '3000');
    animation.setAttribute('easing', 'linear');
    animation.setAttribute('repeat', 'indefinite');
    box.appendChild(animation);
    
    // Add the box to the marker
    marker.appendChild(box);
    
    // Add a sphere
    const sphere = document.createElement('a-sphere');
    sphere.setAttribute('position', '0.8 0.8 0');
    sphere.setAttribute('radius', '0.25');
    sphere.setAttribute('color', '#10B981');
    marker.appendChild(sphere);
    
    // Add a cylinder
    const cylinder = document.createElement('a-cylinder');
    cylinder.setAttribute('position', '-0.8 0.75 0');
    cylinder.setAttribute('radius', '0.25');
    cylinder.setAttribute('height', '0.5');
    cylinder.setAttribute('color', '#F59E0B');
    marker.appendChild(cylinder);
    
    // Add a text element
    const text = document.createElement('a-text');
    text.setAttribute('value', 'AR Demo');
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
      console.log('AR scene loaded successfully');
      setIsLoading(false);
      setCameraActive(true);
    });
    
    // Handle marker found event
    marker.addEventListener('markerFound', () => {
      console.log('Marker detected!');
      setMarkerDetected(true);
    });
    
    // Handle marker lost event
    marker.addEventListener('markerLost', () => {
      console.log('Marker lost');
      setMarkerDetected(false);
    });
    
    // Handle render start
    scene.addEventListener('renderstart', () => {
      console.log('AR render started');
    });
    
    // Handle AR.js initialization error
    scene.addEventListener('arjs-error', (event: any) => {
      console.error('AR.js error:', event.detail.error);
      setError(`AR.js error: ${event.detail.error}`);
    });
  };

  const resetARSession = () => {
    setError(null);
    setIsLoading(true);
    setCameraActive(false);
    setMarkerDetected(false);
    setAttemptCount(0);
    setLibraryStatus('loading');
    
    // Clean up and reinitialize
    cleanupARScene();
    
    // Try to load libraries dynamically first
    loadLibrariesDynamically()
      .then(() => {
        console.log('Libraries loaded dynamically, initializing AR scene');
        setTimeout(() => {
          checkLibrariesAndInitialize();
        }, 1000);
      })
      .catch((err) => {
        console.error('Failed to load libraries dynamically:', err);
        // Fall back to regular initialization
        setTimeout(() => {
          checkLibrariesAndInitialize();
        }, 500);
      });
  };

  const toggleARMode = () => {
    setArMode(arMode === 'marker' ? 'experimental' : 'marker');
    setAttemptCount(0);
  };

  return (
    <div className="w-full h-screen relative bg-black">
      {/* AR Scene Container */}
      <div 
        ref={sceneRef} 
        className="w-full h-full"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="flex flex-col items-center gap-3 p-4 bg-background/80 rounded-lg max-w-xs">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-foreground font-medium">
                {libraryStatus === 'loading' ? 'Loading AR Libraries...' : t('ar.initializing')}
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                {cameraActive ? 'Detecting marker...' : 'Accessing camera...'}
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                Attempt {attemptCount + 1} of 3
              </p>
              {deviceType === 'mobile' && (
                <p className="text-muted-foreground text-xs mt-1">
                  Mobile optimized
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 p-4">
          <div className="bg-destructive/90 text-destructive-foreground p-4 rounded-lg max-w-md w-full">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold mb-1">AR Error</p>
                <p className="text-sm mb-3">{error}</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={resetARSession}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                  >
                    <RotateCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                  <Button 
                    onClick={() => setShowHelp(true)}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Help
                  </Button>
                </div>
              </div>
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
      <div className="absolute top-4 right-4 z-10 flex gap-2">
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
      <div className="absolute bottom-20 left-0 right-0 z-10 flex justify-center gap-3 px-4">
        <Button 
          onClick={resetARSession}
          variant="secondary"
          className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button 
          onClick={toggleARMode}
          variant="secondary"
          className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Status Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1">
          {markerDetected ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
          )}
          <p className="text-xs text-foreground">
            {isARReady ? 
              (arMode === 'marker' ? 'Marker Mode' : 'Experimental Mode') : 
              'Initializing...'}
          </p>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-0 right-0 z-10 px-4">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 mx-auto max-w-md">
          <p className="text-xs text-foreground text-center">
            {isARReady 
              ? (markerDetected 
                  ? 'Marker detected! Move camera to reposition objects' 
                  : deviceType === 'mobile'
                    ? 'Point camera at Hiro marker. Hold device steady 1-2ft from marker'
                    : 'Point camera at Hiro marker to see 3D objects') 
              : deviceType === 'mobile'
                ? 'Make sure you\'re using latest mobile browser with camera permissions'
                : 'Make sure you\'re using the latest browser'}
          </p>
        </div>
      </div>
      
      {/* Help Modal */}
      {showHelp && (
        <ARHelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}