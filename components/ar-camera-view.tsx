"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, RotateCw, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';
import ARHelpModal from '@/components/ar-help-modal';

interface ARCameraViewProps {
  onBack?: () => void;
}

// Babylon.js WebXR AR view with comprehensive AR features
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
  const [planesDetected, setPlanesDetected] = useState(false);
  const [started, setStarted] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (xrRef.current && xrRef.current.baseExperience && xrRef.current.baseExperience.exitXR) {
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
      try {
        if (xrRef.current) {
          const r: any = xrRef.current._reticle;
          const hitTest: any = xrRef.current._hitTest;
          const onTap: any = xrRef.current._onTap;
          if (r && !r.isDisposed) r.dispose();
          if (hitTest && hitTest.dispose) hitTest.dispose();
          if (onTap && canvasRef.current) canvasRef.current.removeEventListener('click', onTap);
        }
      } catch (e) {
        // ignore
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
      const Color3 = (BABYLON as any).Color3;
      const Color4 = (BABYLON as any).Color4;
      const MeshBuilder = (BABYLON as any).MeshBuilder;
      const StandardMaterial = (BABYLON as any).StandardMaterial;
      const PBRMaterial = (BABYLON as any).PBRMaterial;

      const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
      engineRef.current = engine;

      const scene = new Scene(engine);
      scene.clearColor = new Color4(0, 0, 0, 0);
      sceneRef.current = scene;

      // Create default lighting (will be enhanced by light estimation)
      const light = new (BABYLON as any).HemisphericLight('defaultLight', new Vector3(0, 1, 0), scene);
      light.intensity = 0.7;

      // Start render loop
      engine.runRenderLoop(() => {
        if (scene && !scene.isDisposed) scene.render();
      });

      window.addEventListener('resize', () => engine.resize());

      // Check WebXR support
      let immersiveArSupported = false;
      try {
        if (navigator && (navigator as any).xr && (navigator as any).xr.isSessionSupported) {
          immersiveArSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
        }
      } catch (e) {
        console.error('WebXR check failed:', e);
      }

      if (!immersiveArSupported) {
        setError('WebXR AR not supported. Please use a compatible device and browser (e.g., Chrome on Android)');
        setIsLoading(false);
        return;
      }

      // Create WebXR experience with comprehensive AR features
      const xr = await (scene as any).createDefaultXRExperienceAsync({
        uiOptions: {
          sessionMode: 'immersive-ar',
          referenceSpaceType: 'local-floor'
        },
        optionalFeatures: [
          'hit-test',
          'anchors',
          'plane-detection',
          'light-estimation',
          'dom-overlay',
          'hand-tracking',
          'depth-sensing'
        ]
      });

      xrRef.current = xr;
      const fm = xr.baseExperience.featuresManager;

      // Enter AR session
      await xr.baseExperience.enterXRAsync('immersive-ar', 'local-floor');
      setIsARReady(true);
      setIsLoading(false);

      // --- WebXR Hit Test Feature ---
      try {
        const WebXRHitTest = (BABYLON as any).WebXRHitTest;
        const hitTest = fm.enableFeature(WebXRHitTest, 'latest', {
          entityTypes: ['plane', 'point', 'mesh'],
          offsetRay: { x: 0, y: 0, z: 0 },
          useReferenceSpace: true
        });

        // Create placement reticle
        const reticle = MeshBuilder.CreateTorus('reticle', {
          diameter: 0.3,
          thickness: 0.02,
          tessellation: 32
        }, scene);

        const reticleMat = new StandardMaterial('reticleMat', scene);
        reticleMat.diffuseColor = new Color3(0.2, 0.8, 1);
        reticleMat.emissiveColor = new Color3(0.2, 0.8, 1);
        reticleMat.alpha = 0.8;
        reticle.material = reticleMat;
        reticle.isVisible = false;

        let lastHitPose: { position: any; rotationQuaternion: any } | null = null;

        hitTest.onHitTestResultObservable.add((results: any[]) => {
          if (!results || results.length === 0) {
            reticle.isVisible = false;
            lastHitPose = null;
            setPlanesDetected(false);
            return;
          }

          const hit = results[0];
          const transformMatrix = hit.transformationMatrix;

          if (transformMatrix) {
            const matrix = (BABYLON as any).Matrix.FromArray(transformMatrix);
            const position = new Vector3();
            const rotation = new (BABYLON as any).Quaternion();
            const scale = new Vector3();

            matrix.decompose(scale, rotation, position);

            reticle.position.copyFrom(position);
            reticle.rotationQuaternion = rotation;
            reticle.isVisible = true;
            lastHitPose = { position: position.clone(), rotationQuaternion: rotation.clone() };
            setPlanesDetected(true);
          }
        });

        // Place object on tap
        const onTap = () => {
          if (!lastHitPose) return;

          // Create a 3D model at the hit location
          const box = MeshBuilder.CreateBox('placedBox-' + Date.now(), {
            size: 0.15
          }, scene);

          box.position = lastHitPose.position.clone();
          box.position.y += 0.075; // Lift slightly above surface
          box.rotationQuaternion = lastHitPose.rotationQuaternion.clone();

          const boxMat = new PBRMaterial('boxMat', scene);
          boxMat.albedoColor = new Color3(
            Math.random(),
            Math.random(),
            Math.random()
          );
          boxMat.metallic = 0.2;
          boxMat.roughness = 0.3;
          box.material = boxMat;

          // Add simple animation
          let time = 0;
          scene.registerBeforeRender(() => {
            if (box && !box.isDisposed()) {
              time += 0.02;
              box.rotation.y = time;
            }
          });
        };

        canvas.addEventListener('click', onTap);
        (xrRef.current as any)._reticle = reticle;
        (xrRef.current as any)._hitTest = hitTest;
        (xrRef.current as any)._onTap = onTap;
      } catch (e) {
        console.warn('Hit-test feature failed:', e);
      }

      // --- WebXR Plane Detection Feature ---
      try {
        const WebXRPlaneDetector = (BABYLON as any).WebXRPlaneDetector;
        if (WebXRPlaneDetector) {
          const planeDetector = fm.enableFeature(WebXRPlaneDetector, 'latest');

          planeDetector.onPlaneAddedObservable.add((plane: any) => {
            console.log('Plane detected:', plane);
            setPlanesDetected(true);

            // Visualize detected planes
            const planeMesh = MeshBuilder.CreatePlane('detectedPlane-' + plane.id, {
              width: 1,
              height: 1
            }, scene);

            planeMesh.rotationQuaternion = plane.rotationQuaternion;
            planeMesh.position = plane.position;

            const planeMat = new StandardMaterial('planeMat', scene);
            planeMat.diffuseColor = new Color3(0.5, 0.5, 1);
            planeMat.alpha = 0.3;
            planeMat.wireframe = true;
            planeMesh.material = planeMat;

            plane.polygonDefinition.forEach((point: any) => {
              planeMesh.scaling.x = Math.max(planeMesh.scaling.x, Math.abs(point.x) * 2);
              planeMesh.scaling.y = Math.max(planeMesh.scaling.y, Math.abs(point.z) * 2);
            });
          });

          planeDetector.onPlaneRemovedObservable.add((plane: any) => {
            console.log('Plane removed:', plane);
          });
        }
      } catch (e) {
        console.warn('Plane detection feature not available:', e);
      }

      // --- WebXR Light Estimation Feature ---
      try {
        const WebXRLightEstimation = (BABYLON as any).WebXRLightEstimation;
        if (WebXRLightEstimation) {
          const lightEstimation = fm.enableFeature(WebXRLightEstimation, 'latest', {
            setSceneEnvironmentTexture: true,
            createDirectionalLightSource: true,
            reflectionFormat: 'srgba8',
            disableCubeMapReflection: false
          });

          lightEstimation.onReflectionCubeMapUpdatedObservable.add(() => {
            console.log('Light estimation updated');
          });
        }
      } catch (e) {
        console.warn('Light estimation feature not available:', e);
      }

      // --- WebXR Anchors Feature ---
      try {
        const WebXRAnchorSystem = (BABYLON as any).WebXRAnchorSystem;
        if (WebXRAnchorSystem) {
          const anchorSystem = fm.enableFeature(WebXRAnchorSystem, 'latest');

          anchorSystem.onAnchorAddedObservable.add((anchor: any) => {
            console.log('Anchor added:', anchor);
          });

          anchorSystem.onAnchorRemovedObservable.add((anchor: any) => {
            console.log('Anchor removed:', anchor);
          });
        }
      } catch (e) {
        console.warn('Anchor system feature not available:', e);
      }

      // --- WebXR Background Remover ---
      try {
        const WebXRBackgroundRemover = (BABYLON as any).WebXRBackgroundRemover;
        if (WebXRBackgroundRemover) {
          fm.enableFeature(WebXRBackgroundRemover, 'latest', {
            backgroundMeshes: [scene.getMeshByName('skyBox')],
            ignoreEnvironmentHelper: true
          });
        }
      } catch (e) {
        console.warn('Background remover not available:', e);
      }

      // Monitor XR state changes
      xr.baseExperience.onStateChangedObservable.add((state: any) => {
        console.log('XR State changed:', state);
      });

    } catch (err: any) {
      console.error('Failed to initialize AR:', err);
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
      } catch (e) { }
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
              <p className="text-foreground font-medium">{isARReady ? 'Entering AR...' : 'Initializing WebXR AR...'}</p>
              <p className="text-muted-foreground text-xs mt-1">{isARReady ? 'Starting session' : 'Loading features'}</p>
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
          {planesDetected ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></div>
          )}
          <p className="text-xs text-foreground">
            {isARReady ? (planesDetected ? 'Surfaces Detected' : 'Scanning...') : 'Initializing...'}
          </p>
        </div>
      </div>

      {isARReady && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
            <p className="text-sm text-foreground font-medium">Tap to place objects</p>
            <p className="text-xs text-muted-foreground mt-1">Move device to detect surfaces</p>
          </div>
        </div>
      )}

      {showHelp && <ARHelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
