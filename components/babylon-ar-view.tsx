'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Square, Circle } from 'lucide-react';
import { useT } from '@/lib/locale';

// Babylon.js imports
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import '@babylonjs/loaders';
import '@babylonjs/materials';
import '@babylonjs/core/XR/features/WebXRPlaneDetector';

export default function BabylonARView() {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const modelRef = useRef<BABYLON.AbstractMesh | null>(null);
  const xrRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [placingMode, setPlacingMode] = useState(false);
  const [detectionMode, setDetectionMode] = useState<'floor' | 'wall' | 'object' | null>(null);
  const [xrReady, setXrReady] = useState(false);
  const placedAutomatically = useRef(false);
  const lastFloorPoseRef = useRef<BABYLON.Vector3 | null>(null);
  const modelBaseHeightRef = useRef<number>(0.1);
  const planeDetectorRef = useRef<BABYLON.WebXRPlaneDetector | null>(null);
  const planeMeshesRootRef = useRef<BABYLON.TransformNode | null>(null);

  // Initialize Babylon.js engine and scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const initBabylon = async () => {
      try {
        // Create engine
        const engine = new BABYLON.Engine(canvasRef.current!, true);
        engineRef.current = engine;

        // Create scene
        const scene = new BABYLON.Scene(engine);
        sceneRef.current = scene;

        // Create camera
        const camera = new BABYLON.ArcRotateCamera(
          "camera",
          -Math.PI / 2,
          Math.PI / 2,
          5,
          new BABYLON.Vector3(0, 0, 0),
          scene
        );
        camera.attachControl(canvasRef.current, true);

        // Create light
        const light = new BABYLON.HemisphericLight(
          "light",
          new BABYLON.Vector3(0, 1, 0),
          scene
        );

        // Create a simple ground for testing
        const ground = BABYLON.MeshBuilder.CreateGround(
          "ground",
          { width: 6, height: 6 },
          scene
        );
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.material = groundMaterial;

        // Load the Duck.glb model
        try {
          const result = await BABYLON.SceneLoader.ImportMeshAsync(
            "",
            "/models/",
            "Duck.glb",
            scene
          );

          // Get the root mesh of the loaded model
          const model = result.meshes[0];
          modelRef.current = model;

          // Remove floor mesh if present
          const removeEmbeddedFloor = () => {
            // Try to find meshes that look like a floor by name or flatness
            const candidateMeshes = result.meshes.filter(child => child !== model);
            candidateMeshes.forEach(mesh => {
              const nameLooksLikeFloor = mesh.name.toLowerCase().includes('floor');
              const boundingInfo = mesh.getBoundingInfo?.();
              const size = boundingInfo?.boundingBox.extendSize;
              const isFlatHorizontal =
                !!size && size.y < 0.01 && size.x > 0.1 && size.z > 0.1;

              if (nameLooksLikeFloor || isFlatHorizontal) {
                mesh.setEnabled(false);
                mesh.dispose();
              }
            });
          };
          removeEmbeddedFloor();

          // Scale the model to a reasonable size
          model.scaling.scaleInPlace(0.5);

          // Position the model above the ground
          model.position.y = 1;
          const boundingHeight = model.getBoundingInfo()?.boundingBox.extendSize.y ?? 0.1;
          modelBaseHeightRef.current = Math.max(boundingHeight, 0.05);

          console.log("Model loaded successfully");
        } catch (loadModelError) {
          console.error("Failed to load model:", loadModelError);
          // Create a simple box as fallback
          const model = BABYLON.MeshBuilder.CreateBox("model", { size: 0.5 }, scene);
          const modelMaterial = new BABYLON.StandardMaterial("modelMaterial", scene);
          modelMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8);
          model.material = modelMaterial;
          model.position.y = 1;
          modelRef.current = model;
          modelBaseHeightRef.current = 0.25;
        }

        // Initialize WebXR
        try {
          const xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
              sessionMode: 'immersive-ar',
              referenceSpaceType: 'local-floor'
            },
            optionalFeatures: true
          });
          xrRef.current = xr;
          setXrReady(true);
          
          // Enable plane detection if available
          if (xr && xr.baseExperience) {
            const featuresManager = xr.baseExperience.featuresManager;
            const planeMeshesRoot = new BABYLON.TransformNode('xr-plane-root', scene);
            planeMeshesRootRef.current = planeMeshesRoot;
            const planeDetector = featuresManager.enableFeature(
              BABYLON.WebXRFeatureName.PLANE_DETECTION,
              'latest',
              {
                worldParentNode: planeMeshesRoot
              }
            ) as BABYLON.WebXRPlaneDetector | null;
            planeDetectorRef.current = planeDetector;

            const up = BABYLON.Vector3.Up();
            const computeWorldCenter = (plane: BABYLON.IWebXRPlane) => {
              const poly = plane.polygonDefinition;
              if (!poly || poly.length === 0 || !plane.transformationMatrix) {
                return null;
              }
              let sum = new BABYLON.Vector3(0, 0, 0);
              for (const point of poly) {
                sum = sum.add(point);
              }
              const average = sum.scale(1 / poly.length);
              return BABYLON.Vector3.TransformCoordinates(average, plane.transformationMatrix);
            };
            const getWorldNormal = (plane: BABYLON.IWebXRPlane) => {
              if (!plane.transformationMatrix) {
                return null;
              }
              const normal = BABYLON.Vector3.TransformNormal(
                BABYLON.Axis.Y,
                plane.transformationMatrix
              ).normalize();
              return normal;
            };
            const isLargeEnough = (plane: BABYLON.IWebXRPlane) => {
              const poly = plane.polygonDefinition;
              if (!poly || poly.length < 3) {
                return false;
              }
              const area = Math.abs(
                poly.reduce((acc, point, index) => {
                  const next = poly[(index + 1) % poly.length];
                  return acc + point.x * next.z - point.z * next.x;
                }, 0) * 0.5
              );
              return area >= 0.1;
            };

            planeDetector?.onPlaneAddedObservable.add((plane: BABYLON.IWebXRPlane) => {
              const normal = getWorldNormal(plane);
              if (!normal) return;
              const orientation = Math.abs(BABYLON.Vector3.Dot(normal, up));
              if (orientation > 0.9 && isLargeEnough(plane)) {
                const center = computeWorldCenter(plane);
                if (!center) return;

                lastFloorPoseRef.current = center.clone();

                if (!placedAutomatically.current && modelRef.current) {
                  modelRef.current.position.set(center.x, center.y + modelBaseHeightRef.current, center.z);
                  placedAutomatically.current = true;
                }
              }
            });

            planeDetector?.onPlaneUpdatedObservable.add((plane: BABYLON.IWebXRPlane) => {
              const normal = getWorldNormal(plane);
              if (!normal) return;
              const orientation = Math.abs(BABYLON.Vector3.Dot(normal, up));
              if (orientation > 0.9 && isLargeEnough(plane)) {
                const center = computeWorldCenter(plane);
                if (!center) return;
                lastFloorPoseRef.current = center.clone();
              }
            });

            planeDetector?.onPlaneRemovedObservable.add((plane: BABYLON.IWebXRPlane) => {
              const normal = getWorldNormal(plane);
              if (!normal) return;
              const orientation = Math.abs(BABYLON.Vector3.Dot(normal, up));
              if (orientation > 0.9) {
                lastFloorPoseRef.current = null;
                placedAutomatically.current = false;
              }
            });
          }
        } catch (xrError) {
          console.warn("WebXR not available:", xrError);
        }

        // Render loop
        engine.runRenderLoop(() => {
          scene.render();
        });

        // Handle window resize
        const resize = () => {
          engine.resize();
        };
        window.addEventListener('resize', resize);

        setIsLoaded(true);

        return () => {
          window.removeEventListener('resize', resize);
          planeDetectorRef.current?.dispose();
          planeDetectorRef.current = null;
          planeMeshesRootRef.current?.dispose(false, true);
          planeMeshesRootRef.current = null;
          engine.dispose();
        };
      } catch (e) {
        console.error('Failed to initialize Babylon.js:', e);
        setError('Failed to initialize 3D engine');
      }
    };

    initBabylon();
  }, []);

  // Handle model placement on surface
  const placeOnSurface = async () => {
    if (!xrRef.current || !modelRef.current || !sceneRef.current) return;

    if (lastFloorPoseRef.current) {
      modelRef.current.position.set(
        lastFloorPoseRef.current.x,
        lastFloorPoseRef.current.y + modelBaseHeightRef.current,
        lastFloorPoseRef.current.z
      );
      return;
    }

    try {
      // Try WebXR hit-test for placement
      const xr = xrRef.current;
      if (xr.baseExperience && xr.baseExperience.sessionManager) {
        const sessionManager = xr.baseExperience.sessionManager;
        const viewerSpace = await sessionManager.session.requestReferenceSpace('viewer');
        const hitTestSource = await sessionManager.session.requestHitTestSource!({ space: viewerSpace });

        // Perform hit test
        sessionManager.session.requestAnimationFrame((time: number, frame: any) => {
          const results = frame.getHitTestResults(hitTestSource);
          if (results.length > 0) {
            const pose = results[0].getPose(frame.getViewerPose(viewerSpace)!.transform);
              if (pose) {
                // Position model at hit point
                modelRef.current!.position.x = pose.transform.position.x;
                modelRef.current!.position.y = pose.transform.position.y + modelBaseHeightRef.current;
                modelRef.current!.position.z = pose.transform.position.z;
                return;
              }
            }
            
          // Fallback to default position
          if (modelRef.current) {
            modelRef.current.position.set(0, modelBaseHeightRef.current, -1.5);
          }
        });
      }
    } catch (e) {
      console.error('placeOnSurface error:', e);
      // Fallback to default position
      if (modelRef.current) {
        modelRef.current.position.set(0, modelBaseHeightRef.current, -1.5);
      }
    }
  };

  // Place model in front of camera
  const placeInFront = () => {
    if (modelRef.current) {
      modelRef.current.position.set(0, modelBaseHeightRef.current, 1.5);
    }
  };

  // Toggle detection mode
  const toggleDetectionMode = (mode: 'floor' | 'wall' | 'object') => {
    if (detectionMode === mode) {
      setDetectionMode(null);
    } else {
      setDetectionMode(mode);
    }
  };

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported in this browser');
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // stop tracks immediately; this was only to trigger permission prompt
      stream.getTracks().forEach(t => t.stop());
      setCameraEnabled(true);
      return true;
    } catch (e) {
      console.warn('Camera permission denied or unavailable:', e);
      setError('Camera permission denied or unavailable');
      return false;
    }
  };

  // Enter AR mode
  const enterAR = async () => {
    if (!xrRef.current) {
      setError('AR not available');
      return;
    }

    try {
      await xrRef.current.baseExperience.enterXRAsync('immersive-ar', 'local-floor');
    } catch (e) {
      console.error('Failed to enter AR mode:', e);
      setError('Failed to enter AR mode');
    }
  };

  if (error) {
    return (
      <div className="relative w-full h-screen bg-black">
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 p-4">
          <Card className="p-6 max-w-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <h3 className="font-semibold">AR Unavailable</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {error}
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
      
      {/* Loading/Error UI */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
          <Card className="p-6 max-w-sm mx-4 bg-card/90 backdrop-blur-sm border border-white/20 shadow-xl">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 animate-spin border-4 rounded-full border-primary border-t-transparent" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg sm:text-xl">Initializing AR Engine…</h3>
                <p className="text-sm text-muted-foreground">
                  Allow camera and location access when prompted.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10 p-4">
          <Card className="p-6 max-w-sm bg-card/90 backdrop-blur-sm border border-white/20 shadow-xl">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg sm:text-xl">AR Unavailable</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {error}
              </p>
              <Button 
                variant="default" 
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Right sidebar control panel */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-2">
        <div className="bg-black/60 backdrop-blur-md rounded-xl p-2 border border-white/20 shadow-lg">
          <div className="flex flex-col gap-2">
            <Button
              className="w-12 h-12 p-0 font-medium border-2 border-white/30"
              variant={cameraEnabled ? 'secondary' : 'default'}
              onClick={requestCameraPermission}
              title={cameraEnabled ? 'Camera enabled' : 'Enable camera'}
            >
              <Camera className="w-5 h-5" />
            </Button>
            <Button
              className="w-12 h-12 p-0 font-medium border-2 border-white/30"
              variant="default"
              onClick={enterAR}
              title="Enter AR mode"
              disabled={!xrReady}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
              </svg>
            </Button>
            <Button
              className="w-12 h-12 p-0 font-medium border-2 border-white/30"
              variant={placingMode ? 'secondary' : 'default'}
              onClick={() => setPlacingMode(s => !s)}
              title={placingMode ? 'Exit placement mode' : 'Tap to place model'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
            <Button
              className="w-12 h-12 p-0 font-medium border-2 border-white/30"
              variant={detectionMode === 'floor' ? 'secondary' : 'default'}
              onClick={() => toggleDetectionMode('floor')}
              title="Floor detection guide"
            >
              <Square className="w-5 h-5" />
            </Button>
            <Button
              className="w-12 h-12 p-0 font-medium border-2 border-white/30"
              variant={detectionMode === 'wall' ? 'secondary' : 'default'}
              onClick={() => toggleDetectionMode('wall')}
              title="Wall detection guide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Button>
            <Button
              className="w-12 h-12 p-0 font-medium border-2 border-white/30"
              variant={detectionMode === 'object' ? 'secondary' : 'default'}
              onClick={() => toggleDetectionMode('object')}
              title="Object detection guide"
            >
              <Circle className="w-5 h-5" />
            </Button>
            <Button
              className="w-12 h-12 p-0 font-medium border-2 border-white/30"
              variant="default"
              onClick={placeInFront}
              title="Place model in front of camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </Button>
            <Button
              className="w-12 h-12 p-0 font-medium border-2 border-white/30"
              variant="default"
              onClick={placeOnSurface}
              title="Place model on surface"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Instruction overlay for mobile users */}
      <div className="pointer-events-none fixed top-4 left-4 right-4 z-30 flex justify-center">
        <div className="bg-black/80 text-white rounded-md px-4 py-3 text-sm sm:text-base backdrop-blur-sm max-w-md font-medium shadow-lg border border-white/20">
          Tap screen to focus and allow camera & location. Use sidebar buttons to control AR model.
        </div>
      </div>

      {/* Detection mode indicator */}
      {detectionMode && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 bg-black/70 text-white rounded-full px-4 py-2 text-sm backdrop-blur-sm border border-white/20">
          {detectionMode === 'floor' && 'Floor Detection Active'}
          {detectionMode === 'wall' && 'Wall Detection Active'}
          {detectionMode === 'object' && 'Object Detection Active'}
        </div>
      )}

      {/* Add padding to prevent content from being hidden behind navigation */}
      <div className="h-24" />
    </div>
  );
}
