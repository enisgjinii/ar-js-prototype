'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/locale';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface ThreeJSARViewProps {
  onBack?: () => void;
}

// Three.js + WebXR AR implementation - most reliable for mobile AR
export default function ThreeJSARView({ onBack }: ThreeJSARViewProps) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [objectsPlaced, setObjectsPlaced] = useState(0);
  const [surfacesDetected, setSurfacesDetected] = useState(false);
  const [placementMessage, setPlacementMessage] = useState<string | null>(null);
  const [placementType, setPlacementType] = useState<
    'anchored' | 'floating' | null
  >(null);
  const [placements, setPlacements] = useState<
    Array<{ id: string; anchored: boolean; matrix?: number[] }>
  >([]);
  const runtimePlacementsRef = useRef<
    Map<string, { anchor?: any; mesh?: any }>
  >(new Map());

  useEffect(() => {
    return () => {
      // Cleanup
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Load persisted placements from sessionStorage (if any) so UI knows about them before AR session starts
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ar_placements');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setPlacements(parsed);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Undo last placement (remove mesh/anchor if present and update storage)
  const undoLastPlacement = () => {
    setPlacements(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const runtime = runtimePlacementsRef.current.get(last.id);
      if (runtime) {
        try {
          if (runtime.anchor && typeof runtime.anchor.delete === 'function') {
            runtime.anchor.delete();
          }
        } catch (e) {
          // ignore
        }
        try {
          if (runtime.mesh && runtime.mesh.parent)
            runtime.mesh.parent.remove(runtime.mesh);
        } catch (e) {}
        runtimePlacementsRef.current.delete(last.id);
      }
      const updated = prev.slice(0, -1);
      try {
        sessionStorage.setItem('ar_placements', JSON.stringify(updated));
      } catch (e) {}
      setPlacementMessage('Removed last');
      setPlacementType(null);
      setTimeout(() => setPlacementMessage(null), 1500);
      return updated;
    });
  };

  const startThreeJSAR = async () => {
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
          'AR not supported. Install Google Play Services for AR from Play Store.'
        );
      }

      // Dynamic import Three.js to avoid SSR issues
      const THREE = await import('three');

      const container = containerRef.current;
      if (!container) throw new Error('Container not found');

      console.log('✅ Three.js loaded, creating AR scene...');

      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.01,
        20
      );
      cameraRef.current = camera;

      // Create renderer with XR support
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.xr.enabled = true;
      renderer.setClearColor(0x000000, 0); // Transparent background for AR
      rendererRef.current = renderer;

      container.appendChild(renderer.domElement);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      console.log('✅ Three.js scene created');

      // Add test cube to verify 3D rendering
      const testGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const testMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0x440000,
      });
      const testCube = new THREE.Mesh(testGeometry, testMaterial);
      testCube.position.set(0, 0, -0.5);
      scene.add(testCube);

      // Animate test cube
      const animateTestCube = () => {
        testCube.rotation.x += 0.01;
        testCube.rotation.y += 0.01;
      };

      console.log('✅ Test cube added at (0, 0, -0.5)');

      // Start XR session with more compatible settings
      const session = await navigator.xr.requestSession('immersive-ar', {
        optionalFeatures: [
          'hit-test',
          'dom-overlay',
          'light-estimation',
          'local',
          'local-floor',
          'bounded-floor',
        ],
      });

      await renderer.xr.setSession(session);
      console.log('✅ AR session started with Three.js');

      setIsARActive(true);
      setIsLoading(false);

      // Set up hit testing for surface detection with fallback reference spaces
      let hitTestSource: XRHitTestSource | null = null;
      let reticle: any = null;
      let referenceSpace: XRReferenceSpace | null = null;
      // Store the last hit result for anchor creation on tap
      let lastHitResult: XRHitTestResult | null = null;
      // Anchors created via hit.createAnchor() (if supported) and their meshes
      const anchors: Array<{ anchor: any; mesh: any }> = [];

      // Try different reference space types in order of preference
      const referenceSpaceTypes = ['local-floor', 'local', 'viewer'];

      for (const spaceType of referenceSpaceTypes) {
        try {
          referenceSpace = await session.requestReferenceSpace(
            spaceType as XRReferenceSpaceType
          );
          console.log(`✅ Reference space created: ${spaceType}`);
          break;
        } catch (e) {
          console.warn(`Reference space '${spaceType}' not supported:`, e);
        }
      }

      if (!referenceSpace) {
        throw new Error('No supported reference space found');
      }

      // Set up hit test source
      try {
        if (session.requestHitTestSource) {
          const source = await session.requestHitTestSource({
            space: referenceSpace,
          });
          hitTestSource = source || null;
          console.log('✅ Hit test source created');

          // Create reticle (placement indicator)
          const reticleGeometry = new THREE.RingGeometry(0.1, 0.11, 32);
          const reticleMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8,
          });
          reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
          reticle.matrixAutoUpdate = false;
          reticle.visible = false;
          scene.add(reticle);
          console.log('✅ Reticle created');
          // Recreate any persisted placements from sessionStorage into the scene
          try {
            const raw = sessionStorage.getItem('ar_placements');
            if (raw) {
              const stored = JSON.parse(raw) as Array<{ id: string; anchored: boolean; matrix?: number[] }>;
              if (Array.isArray(stored) && stored.length > 0) {
                stored.forEach((p) => {
                  try {
                    const boxGeoStored = new THREE.BoxGeometry(0.1, 0.1, 0.1);
                    const boxMatStored = new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()), metalness: 0.3, roughness: 0.4 });
                    const boxMeshStored = new THREE.Mesh(boxGeoStored, boxMatStored);
                    if (p.matrix && Array.isArray(p.matrix) && p.matrix.length === 16) {
                      boxMeshStored.matrixAutoUpdate = false;
                      boxMeshStored.matrix.fromArray(p.matrix);
                      boxMeshStored.matrix.decompose(boxMeshStored.position, boxMeshStored.quaternion, boxMeshStored.scale);
                    }
                    scene.add(boxMeshStored);
                    runtimePlacementsRef.current.set(p.id, { mesh: boxMeshStored });
                  } catch (e) {
                    // ignore per-placement errors
                  }
                });
                // update count
                setObjectsPlaced((c) => c + stored.length);
                console.log('✅ Recreated persisted placements:', stored.length);
              }
            }
          } catch (e) {
            console.warn('Failed to recreate persisted placements:', e);
          }
        } else {
          console.warn('Hit test not supported on this device');
        }
      } catch (e) {
        console.warn('Hit test setup failed:', e);
      }

      // Handle screen taps for object placement
      let tapCount = 0;
      const handleTap = async () => {
        if (!reticle || !reticle.visible) {
          console.warn('No surface detected for placement');
          return;
        }

        tapCount++;
        console.log('👆 Tap detected #', tapCount);

        // If lastHitResult supports createAnchor(), create an XRAnchor so the cube stays fixed in the world
        if (
          lastHitResult &&
          typeof (lastHitResult as any).createAnchor === 'function'
        ) {
          try {
            const anchor = await (lastHitResult as any).createAnchor();
            // Create a box mesh and add to scene; position will be updated each frame from the anchor
            const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const boxMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color(
                Math.random(),
                Math.random(),
                Math.random()
              ),
              metalness: 0.3,
              roughness: 0.4,
            });
            const boxMesh = new THREE.Mesh(boxGeo, boxMat);
            // initialize from reticle matrix
            boxMesh.matrixAutoUpdate = false;
            boxMesh.matrix.fromArray(
              reticle.matrix.elements || reticle.matrix.toArray()
            );
            boxMesh.matrix.decompose(
              boxMesh.position,
              boxMesh.quaternion,
              boxMesh.scale
            );
            scene.add(boxMesh);
                anchors.push({ anchor, mesh: boxMesh });
                // create a persistent placement record
                const id = String(Date.now());
                runtimePlacementsRef.current.set(id, { anchor, mesh: boxMesh });
                const matrix = boxMesh.matrix ? Array.from(boxMesh.matrix.toArray ? boxMesh.matrix.toArray() : (boxMesh.matrix.elements || [])) : undefined;
                const record = { id, anchored: true, matrix };
                setPlacements((prev) => {
                  const next = [...prev, record];
                  try { sessionStorage.setItem('ar_placements', JSON.stringify(next)); } catch (e) {}
                  return next;
                });
                setObjectsPlaced(tapCount);
                console.log('🎯 Anchor created and cube placed');
                // show placement feedback
                setPlacementType('anchored');
                setPlacementMessage('Placed (anchored)');
                setTimeout(() => setPlacementMessage(null), 2000);
            return;
          } catch (e) {
            console.warn(
              'Failed to create anchor, falling back to non-anchored placement',
              e
            );
          }
        }

        // Fallback: place a cube at the reticle position (not anchored)
        const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const boxMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(Math.random(), Math.random(), Math.random()),
          metalness: 0.3,
          roughness: 0.4,
        });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.setFromMatrixPosition(reticle.matrix);
        scene.add(box);
        // persist placement
        const id = String(Date.now());
        runtimePlacementsRef.current.set(id, { mesh: box });
        const m = box.matrix && (box.matrix.elements || null);
        const record = { id, anchored: false, matrix: m ? Array.from(m) : undefined };
        setPlacements((prev) => {
          const next = [...prev, record];
          try { sessionStorage.setItem('ar_placements', JSON.stringify(next)); } catch (e) {}
          return next;
        });
        setObjectsPlaced(tapCount);
        console.log('🎯 Cube placed at:', box.position);
        setPlacementType('floating');
        setPlacementMessage('Placed (floating)');
        setTimeout(() => setPlacementMessage(null), 2000);

        // Add a small bob/rotation animation
        let time = 0;
        const animateBox = () => {
          if (box.parent) {
            time += 0.05;
            box.position.y += Math.sin(time) * 0.0008;
            box.rotation.y += 0.02;
          }
        };
        (box as any).animate = animateBox;
      };

      renderer.domElement.addEventListener('click', handleTap);

      // Animation loop
      const animate = () => {
        // Animate test cube
        animateTestCube();

        // Animate placed spheres
        scene.children.forEach((child: any) => {
          if (child.animate) {
            child.animate();
          }
        });

        renderer.render(scene, camera);
      };

      renderer.setAnimationLoop(animate);

      // Handle XR frame updates for hit testing
      const onXRFrame = (time: number, frame: XRFrame) => {
        if (hitTestSource && reticle && referenceSpace) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);

          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);

            if (pose) {
              reticle.visible = true;
              reticle.matrix.fromArray(pose.transform.matrix);
              // Store the hit so taps can create anchors
              lastHitResult = hit;
              setSurfacesDetected(true);
            }
          } else {
            reticle.visible = false;
            setSurfacesDetected(false);
            lastHitResult = null;
          }
          // Update any anchors' attached meshes from their anchorSpace poses
          if (anchors.length > 0 && referenceSpace) {
            anchors.forEach(entry => {
              try {
                const anchorPose = frame.getPose(
                  entry.anchor.anchorSpace,
                  referenceSpace!
                );
                if (anchorPose) {
                  entry.mesh.matrix.fromArray(anchorPose.transform.matrix);
                  entry.mesh.matrix.decompose(
                    entry.mesh.position,
                    entry.mesh.quaternion,
                    entry.mesh.scale
                  );
                }
              } catch (e) {
                // ignore per-frame anchor update errors
              }
            });
          }
        }
      };

      session.requestAnimationFrame(function onFrame(time, frame) {
        onXRFrame(time, frame);
        session.requestAnimationFrame(onFrame);
      });

      // Handle session end
      session.addEventListener('end', () => {
        console.log('AR session ended');
        setIsARActive(false);
        setSurfacesDetected(false);
        renderer.domElement.removeEventListener('click', handleTap);
        if (hitTestSource) {
          hitTestSource.cancel();
        }
      });

      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);
    } catch (err: any) {
      console.error('Three.js AR Error:', err);
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
              onClick={startThreeJSAR}
              className="px-8 py-4 text-lg bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
            >
              🚀 Start Three.js AR
            </Button>
            <p className="text-white text-sm mt-2">
              Professional AR with Three.js + WebXR
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center text-white">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading Three.js AR...</p>
            <p className="text-sm opacity-70">Setting up WebXR session</p>
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
              <p>✅ Update Chrome to latest version</p>
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
            <div className="bg-purple-600/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Three.js AR
            </div>
          </div>

          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              {surfacesDetected ? (
                <CheckCircle className="h-3 w-3 text-green-400" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse"></div>
              )}
              <span>{surfacesDetected ? 'Surface Ready' : 'Scanning...'}</span>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-center">
              <p className="font-medium">
                {surfacesDetected
                  ? '👆 Tap to place cubes'
                  : '📱 Move phone to scan surfaces'}
              </p>
              <p className="text-sm opacity-80">
                Objects placed: {objectsPlaced}
              </p>
              <p className="text-xs opacity-60">Look for spinning red cube!</p>
            </div>
          </div>
          {/* Placement toast */}
          {placementMessage && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-black/90 text-white px-4 py-2 rounded-md text-sm">
                {placementMessage}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
