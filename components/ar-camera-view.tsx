"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, RotateCw, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';
import ARHelpModal from '@/components/ar-help-modal';

interface ARCameraViewProps {
  onBack?: () => void;
}

// Minimal Babylon-based AR view. Dynamically imports Babylon to avoid SSR issues.
export default function ARCameraView({ onBack }: ARCameraViewProps) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<any>(null);
  const xrRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isARReady, setIsARReady] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [markerDetected, setMarkerDetected] = useState(false);
  const [started, setStarted] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (xrRef.current && xrRef.current.baseExperience && xrRef.current.baseExperience.exitXR) {
          // try to end session gracefully
          xrRef.current.baseExperience.exitXR();
        }
      } catch (e) {
        // ignore
      }
      const eng = engineRef.current;
      if (eng) {
        try {
          eng.stopRenderLoop();
          if (sceneRef.current && !sceneRef.current.isDisposed) sceneRef.current.dispose();
          eng.dispose();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startAR = async () => {
    setError(null);
    setIsLoading(true);
    setStarted(true);

    const canvas = canvasRef.current;
    if (!canvas) {
      setError('Canvas not available');
      setIsLoading(false);
      return;
    }

    try {
      const BABYLON = await import('@babylonjs/core');
      await import('@babylonjs/loaders');

      const Engine = (BABYLON as any).Engine;
      const Scene = (BABYLON as any).Scene;
      const Vector3 = (BABYLON as any).Vector3;

      const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
      engineRef.current = engine;

      const scene = new Scene(engine);
      sceneRef.current = scene;

      // Simple light so the scene isn't totally dark
      new (BABYLON as any).HemisphericLight('hLight', new Vector3(0, 1, 0), scene);

      // Start render loop
      engine.runRenderLoop(() => {
        if (scene && !scene.isDisposed) scene.render();
      });

      window.addEventListener('resize', () => engine.resize());

      // Try to create an immersive-ar session when user explicitly requests it
      if ((scene as any).createDefaultXRExperienceAsync) {
        try {
          const xr = await (scene as any).createDefaultXRExperienceAsync({ uiOptions: { sessionMode: 'immersive-ar' } });
          xrRef.current = xr;
          setIsARReady(true);
          setIsLoading(false);

          // optional: observe state changes
          try {
            xr.baseExperience.onStateChangedObservable.add(() => {});
          } catch (e) {
            // ignore if API differs
          }
        } catch (xrErr) {
          console.warn('WebXR (immersive-ar) not available or failed to start:', xrErr);
          setIsARReady(false);
          setIsLoading(false);
        }
      } else {
        console.warn('createDefaultXRExperienceAsync not available on this Babylon build');
        setIsARReady(false);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Failed to initialize Babylon scene:', err);
      setError(String(err?.message || err));
      setIsLoading(false);
    }
  };

  const resetARSession = () => {
    setError(null);
    setIsLoading(true);
    setIsARReady(false);
    const eng = engineRef.current;
    if (eng) {
      try {
        eng.dispose();
      } catch (e) {}
      engineRef.current = null;
    }
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <div className="w-full h-screen relative bg-black">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Entry button: start AR when the user explicitly clicks */}
      {!started && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <Button onClick={startAR} variant="secondary" className="px-6 py-3 text-lg rounded-lg bg-primary text-white">
            {t?.('ar.enter') || 'Enter AR'}
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="flex flex-col items-center gap-3 p-4 bg-background/80 rounded-lg max-w-xs">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-foreground font-medium">{isARReady ? 'Entering AR...' : 'Initializing AR (Babylon)...'}</p>
              <p className="text-muted-foreground text-xs mt-1">{isARReady ? 'Starting session' : 'Preparing scene'}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 p-4">
          <div className="bg-destructive/90 text-destructive-foreground p-4 rounded-lg max-w-md w-full">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold mb-1">AR Error</p>
                <p className="text-sm mb-3">{error}</p>
                <div className="flex gap-2">
                  <Button onClick={resetARSession} variant="secondary" size="sm" className="flex-1">
                    <RotateCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                  <Button onClick={() => setShowHelp(true)} variant="secondary" size="sm" className="flex-1">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Help
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 z-10">
        <Button onClick={onBack} variant="secondary" className="bg-background/80 backdrop-blur-sm">
          {t('common.back')}
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button onClick={() => setShowHelp(true)} variant="secondary" size="icon" className="bg-background/80 backdrop-blur-sm rounded-full w-12 h-12">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1">
          {markerDetected ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
          )}
          <p className="text-xs text-foreground">{isARReady ? 'AR Ready (Babylon)' : 'Initializing...'}</p>
        </div>
      </div>

      {showHelp && <ARHelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}