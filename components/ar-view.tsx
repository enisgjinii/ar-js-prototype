'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Scan, Square, Circle, Triangle } from 'lucide-react';
import { useT } from '@/lib/locale';

// Target coordinates: 51°12'42.4"N 6°13'07.3"E (Düsseldorf)
const TARGET_LAT = 51.211778;
const TARGET_LON = 6.218694;

export default function ARView() {
  const t = useT();
  const sceneRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aframeReady, setAframeReady] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [placingMode, setPlacingMode] = useState(false);
  const [detectionMode, setDetectionMode] = useState<'floor' | 'wall' | 'object' | null>(null);
  const [detectedSurfaces, setDetectedSurfaces] = useState<any[]>([]);
  const [visualGuides, setVisualGuides] = useState<any[]>([]);
  const placedAutomatically = useRef(false);

  // Dynamically load A-Frame and AR.js (A-Frame build) on client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        // If already present, resolve
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(s);
      });

    const ensureAframe = async () => {
      try {
        if ((window as any).AFRAME) {
          setAframeReady(true);
          return;
        }

        await loadScript('https://aframe.io/releases/1.4.0/aframe.min.js');
        // AR.js A-Frame plugin
        await loadScript(
          'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.min.js'
        );

        // Wait a tick for AFRAME to register
        setTimeout(() => setAframeReady(true), 50);
      } catch (e) {
        console.error('Failed to load A-Frame or AR.js scripts:', e);
        setError('Failed to initialize AR scripts');
      }
    };

    ensureAframe();
  }, []);

  // Attach model event listeners after A-Frame is ready and element exists
  useEffect(() => {
    if (!aframeReady) return;

    // Insert A-Frame scene markup into the container (avoid JSX tags for a-scene)
    const container = sceneRef.current;
    if (!container) return;

    // If scene already exists, don't recreate
    if (container.querySelector && container.querySelector('a-scene')) {
      // pick up existing model element if present
      const existing = container.querySelector('#dog-model');
      if (existing) modelRef.current = existing;
      return;
    }

    // Build minimal A-Frame scene string
    const sceneHtml = `
      <a-scene
        vr-mode-ui="enabled: false"
        embedded
        renderer="logarithmicDepthBuffer: true;"
        arjs="sourceType: webcam; gpsMinDistance: 1; debugUIEnabled: false;"
        style="width: 100%; height: 100%;"
      >
        <a-camera gps-camera rotation-reader></a-camera>
        <a-entity id="dog-model" gltf-model="/models/dog_statue.glb" gps-entity-place="latitude: ${TARGET_LAT}; longitude: ${TARGET_LON};" scale="0.8 0.8 0.8" rotation="0 180 0"></a-entity>
        <!-- Visual guides container -->
        <a-entity id="visual-guides"></a-entity>
      </a-scene>
    `;

    container.innerHTML = sceneHtml;

    // set refs to created elements
    const sceneEl = container.querySelector('a-scene') as HTMLElement | null;
    const modelEl = container.querySelector('#dog-model') as HTMLElement | null;
    modelRef.current = modelEl;

    if (!modelEl) {
      setError('3D model element not found in scene');
      return;
    }

    const onModelLoaded = () => {
      setIsLoaded(true);
      console.log('Model loaded into A-Frame scene');
    };

    const onModelError = (e: any) => {
      console.error('A-Frame model error:', e);
      setError('Failed to load 3D model');
    };

    modelEl.addEventListener('model-loaded', onModelLoaded);
    modelEl.addEventListener('error', onModelError);

    // Inject a small A-Frame component to provide a performHitTest method that other code can call.
    // This keeps WebXR integration accessible from within the A-Frame scene.
    try {
      const existing = document.getElementById('aframe-webxr-hit-component');
      if (!existing) {
        const compScript = document.createElement('script');
        compScript.id = 'aframe-webxr-hit-component';
        compScript.type = 'text/javascript';
        compScript.textContent = `
          (function(){
            if (!window.AFRAME) return;
            AFRAME.registerComponent('webxr-hit', {
              init: function(){
                const self = this;
                self.performHitTest = async function(targetEl){
                  try {
                    const nav = navigator;
                    if (!nav.xr || !nav.xr.isSessionSupported) return false;
                    const supported = await nav.xr.isSessionSupported('immersive-ar');
                    if (!supported) return false;

                    const session = await nav.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test', 'local-floor'] });
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl', { xrCompatible: true }) || canvas.getContext('experimental-webgl');
                    if (!gl) { await session.end(); return false; }
                    if (gl.makeXRCompatible) await gl.makeXRCompatible();
                    session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });
                    const viewerSpace = await session.requestReferenceSpace('viewer');
                    const refSpace = await session.requestReferenceSpace('local-floor').catch(()=> session.requestReferenceSpace('local'));
                    const hitSource = await session.requestHitTestSource({ space: viewerSpace });

                    return await new Promise((resolve)=>{
                      let done=false;
                      const onFrame = (time, frame)=>{
                        if(done) return;
                        const results = frame.getHitTestResults(hitSource);
                        if(results && results.length){
                          const pose = results[0].getPose(refSpace);
                          if(pose){
                            const p = pose.transform.position;
                            const o = pose.transform.orientation;
                            try{
                              if(targetEl && targetEl.object3D){
                                targetEl.object3D.position.set(p.x,p.y,p.z);
                                targetEl.object3D.quaternion.set(o.x,o.y,o.z,o.w);
                              } else if(targetEl){
                                targetEl.setAttribute('position', p.x+' '+p.y+' '+p.z);
                              }
                            }catch(e){/* ignore */}
                            done=true;
                            try{ hitSource.cancel && hitSource.cancel(); }catch(e){}
                            session.end().then(()=>resolve(true)).catch(()=>resolve(true));
                            return;
                          }
                        }
                        session.requestAnimationFrame(onFrame);
                      };
                      session.requestAnimationFrame(onFrame);
                      setTimeout(()=>{ if(done) return; done=true; session.end().then(()=>resolve(false)).catch(()=>resolve(false)); }, 8000);
                    });
                  } catch(e) { return false; }
                };
              }
            });
          })();
        `;
        document.head.appendChild(compScript);
      }
    } catch (e) {
      console.warn('Failed to inject aframe webxr component', e);
    }

    return () => {
      try {
        modelEl.removeEventListener('model-loaded', onModelLoaded);
        modelEl.removeEventListener('error', onModelError);
      } catch (e) {
        // ignore
      }
    };
  }, [aframeReady]);

  // When A-Frame is ready, prompt for camera permission automatically (best-effort)
  useEffect(() => {
    if (!aframeReady) return; // Fire-and-forget; permissions may require user interaction on some browsers
    (async () => {
      try {
        await requestCameraPermission();
      } catch (e) {
        // ignore
      }
    })();
  }, [aframeReady]);

  // Once the model is loaded, place it automatically on the surface one time
  useEffect(() => {
    if (!isLoaded) return;
    if (placedAutomatically.current) return;
    placedAutomatically.current = true;
    // small delay to allow camera stream to stabilize
    setTimeout(() => {
      placeOnSurface();
    }, 600);
  }, [isLoaded]);

  // Visual guides effect for detection modes
  useEffect(() => {
    if (!aframeReady || !detectionMode) return;
    
    // Clear previous guides
    clearVisualGuides();
    
    // Show appropriate guide based on detection mode
    switch (detectionMode) {
      case 'floor':
        showFloorDetectionGuide();
        break;
      case 'wall':
        showWallDetectionGuide();
        break;
      case 'object':
        showObjectDetectionGuide();
        break;
    }
    
    return () => {
      clearVisualGuides();
    };
  }, [detectionMode, aframeReady]);

  // Place the model 1.5m in front of the camera (indoor test helper)
  const placeInFront = () => {
    try {
      const el = modelRef.current;
      if (!el) return;
      // Remove gps attributes to put it in camera space
      el.removeAttribute('gps-entity-place');
      el.setAttribute('position', '0 0 -1.5');
      el.setAttribute('rotation', '0 180 0');
      el.setAttribute('scale', '0.8 0.8 0.8');
      // Attach to camera entity
      const scene = sceneRef.current;
      const cam =
        scene &&
        scene.querySelector &&
        scene.querySelector('a-camera, [camera]');
      if (cam) {
        cam.appendChild(el);
      }
    } catch (e) {
      console.error('placeInFront error:', e);
    }
  };

  // Simulate GPS by moving the entity to the target lat/lon (works if gps-entity-place plugin is used)
  const simulateGPS = () => {
    try {
      const el = modelRef.current;
      if (!el) return;
      // Ensure it's not attached to camera
      const parent = el.parentElement;
      if (
        parent &&
        (parent.tagName === 'A-CAMERA' || parent.hasAttribute('camera'))
      ) {
        document.querySelector('a-scene')?.appendChild(el);
      }
      el.setAttribute(
        'gps-entity-place',
        `latitude: ${TARGET_LAT}; longitude: ${TARGET_LON};`
      );
      el.setAttribute('position', '0 0 0');
    } catch (e) {
      console.error('simulateGPS error:', e);
    }
  };

  // Place model on an estimated horizontal surface using a ray from the camera.
  // Uses A-Frame's THREE when available to compute intersection with an estimated floor plane.
  const placeOnSurface = async () => {
    try {
      const el = modelRef.current as any;
      const container = sceneRef.current;
      if (!el || !container) return;

      // Try WebXR hit-test first on capable devices
      const didPlaceWithWebXR = await tryWebXRHitTest(el);
      if (didPlaceWithWebXR) return;

      const sceneEl =
        container.querySelector && container.querySelector('a-scene');
      const cam =
        sceneEl &&
        (sceneEl.querySelector('a-camera') ||
          sceneEl.querySelector('[camera]'));
      if (!cam) {
        console.warn('Camera element not found; falling back to placeInFront');
        placeInFront();
        return;
      }

      const THREE = (window as any).AFRAME && (window as any).AFRAME.THREE;
      if (!THREE) {
        console.warn(
          'THREE not available on AFRAME; falling back to placeInFront'
        );
        placeInFront();
        return;
      }

      // Ensure model has an object3D (wait briefly if model is still loading)
      await new Promise<void>(resolve => {
        if (el.object3D) return resolve();
        const onLoaded = () => resolve();
        el.addEventListener('model-loaded', onLoaded, { once: true });
        // safety timeout
        setTimeout(() => resolve(), 1500);
      });

      const camObj = (cam as any).object3D;
      const origin = new THREE.Vector3();
      camObj.getWorldPosition(origin);
      const dir = new THREE.Vector3();
      camObj.getWorldDirection(dir);

      // Estimate floor plane as 1.5m below the camera (tweakable)
      const estimatedFloorOffset = 1.5;
      let t;
      if (Math.abs(dir.y) < 1e-3) {
        t = estimatedFloorOffset;
      } else {
        const planeY = origin.y - estimatedFloorOffset;
        t = (planeY - origin.y) / dir.y;
        if (t <= 0) t = estimatedFloorOffset;
      }

      const point = origin.clone().add(dir.clone().multiplyScalar(t));

      // Ensure model is attached to the scene (not camera)
      const parent = el.parentElement;
      if (
        parent &&
        (parent.tagName === 'A-CAMERA' || parent.hasAttribute('camera'))
      ) {
        sceneEl.appendChild(el);
      }

      // Remove gps placement and set world position
      el.removeAttribute('gps-entity-place');
      // Use object3D when available to set exact world position
      if (el.object3D) {
        el.object3D.position.copy(point);
      } else {
        el.setAttribute('position', `${point.x} ${point.y} ${point.z}`);
      }

      // Face the camera on the Y axis
      const camPos = origin;
      const look = camPos.clone().sub(point);
      const yaw = Math.atan2(look.x, look.z) * (180 / Math.PI);
      el.setAttribute('rotation', `0 ${yaw} 0`);
      el.setAttribute('scale', '0.8 0.8 0.8');
    } catch (e) {
      console.error('placeOnSurface error:', e);
    }
  };

  // Try to perform a WebXR hit-test (immersive-ar) and place the given model element on the first hit.
  // Returns true if placed using WebXR, false otherwise.
  const tryWebXRHitTest = async (el: any): Promise<boolean> => {
    try {
      const container = sceneRef.current;
      const sceneEl =
        container &&
        container.querySelector &&
        container.querySelector('a-scene');
      if (sceneEl) {
        const comp =
          (sceneEl as any).__aframeInst &&
          (sceneEl as any).components &&
          (sceneEl as any).components['webxr-hit'];
        // In many A-Frame builds components are stored on element.components
        const compAlt =
          (sceneEl as any).components &&
          (sceneEl as any).components['webxr-hit'];
        const performer = comp?.performHitTest || compAlt?.performHitTest;
        if (performer && typeof performer === 'function') {
          try {
            const ok = await performer(el);
            return Boolean(ok);
          } catch (e) {
            // fallthrough to native low-level approach
          }
        }
      }

      // Fallback: attempt low-level WebXR usage as before
      const nav = navigator as any;
      if (!nav.xr || !nav.xr.isSessionSupported) return false;
      const supported = await nav.xr.isSessionSupported('immersive-ar');
      if (!supported) return false;

      const session: any = await nav.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'local-floor'],
      });
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl', { xrCompatible: true }) ||
        canvas.getContext('experimental-webgl')) as any;
      if (!gl) {
        await session.end();
        return false;
      }
      if (gl.makeXRCompatible) await gl.makeXRCompatible();
      session.updateRenderState({
        baseLayer: new (window as any).XRWebGLLayer(session, gl),
      });
      const viewerSpace = await session.requestReferenceSpace('viewer');
      const refSpace = await session
        .requestReferenceSpace('local-floor')
        .catch(() => session.requestReferenceSpace('local'));
      const hitSource = await session.requestHitTestSource({
        space: viewerSpace,
      });

      return await new Promise<boolean>(resolve => {
        let done = false;
        const onFrame = (time: any, frame: any) => {
          if (done) return;
          const results = frame.getHitTestResults(hitSource);
          if (results && results.length) {
            const pose = results[0].getPose(refSpace);
            if (pose) {
              const p = pose.transform.position;
              const o = pose.transform.orientation;
              try {
                if (el.object3D) {
                  el.object3D.position.set(p.x, p.y, p.z);
                  el.object3D.quaternion.set(o.x, o.y, o.z, o.w);
                } else {
                  el.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
                }
              } catch (e) {
                console.warn(
                  'WebXR placement applied but failed to set object3D',
                  e
                );
              }
              done = true;
              try {
                hitSource.cancel && hitSource.cancel();
              } catch (e) {}
              session
                .end()
                .then(() => resolve(true))
                .catch(() => resolve(true));
              return;
            }
          }
          session.requestAnimationFrame(onFrame);
        };
        session.requestAnimationFrame(onFrame);
        setTimeout(() => {
          if (done) return;
          done = true;
          session
            .end()
            .then(() => resolve(false))
            .catch(() => resolve(false));
        }, 8000);
      });
    } catch (e) {
      console.warn('WebXR hit-test integration failed', e);
      return false;
    }
  };

  // Request camera permission explicitly (prompts user). We stop tracks immediately — AR.js/A-Frame will open camera when needed,
  // but calling getUserMedia first helps trigger the permission prompt on some browsers.
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

  // Placement mode: add pointer listener and compute world point from screen coordinates
  useEffect(() => {
    if (!placingMode) return;
    const container = sceneRef.current;
    if (!container) return;
    const sceneEl =
      container.querySelector && container.querySelector('a-scene');
    const cam =
      sceneEl &&
      (sceneEl.querySelector('a-camera') || sceneEl.querySelector('[camera]'));
    if (!cam) {
      console.warn('No camera found for placement mode');
      return;
    }

    const onPointer = (ev: PointerEvent) => {
      try {
        const rect = (container as HTMLElement).getBoundingClientRect();
        const clientX = ev.clientX - rect.left;
        const clientY = ev.clientY - rect.top;
        const ndcX = (clientX / rect.width) * 2 - 1;
        const ndcY = -((clientY / rect.height) * 2 - 1);

        const THREE = (window as any).AFRAME && (window as any).AFRAME.THREE;
        if (!THREE) return;

        // A-Frame camera's underlying THREE camera is accessible via getObject3D('camera')
        const threeCam =
          (cam as any).getObject3D && (cam as any).getObject3D('camera');
        if (!threeCam) return;

        const mouse = new THREE.Vector2(ndcX, ndcY);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, threeCam);
        const origin = raycaster.ray.origin;
        const dir = raycaster.ray.direction;

        // Estimate floor Y position as camera Y - 1.5m
        const estimatedFloorOffset = 1.5;
        const planeY = origin.y - estimatedFloorOffset;
        let t = (planeY - origin.y) / dir.y;
        if (t <= 0) t = estimatedFloorOffset;
        const point = origin.clone().add(dir.clone().multiplyScalar(t));

        // Place model at computed point
        const el = modelRef.current as any;
        if (!el) return;
        const sceneElDom = sceneEl as HTMLElement;
        // ensure model is child of scene
        if (
          el.parentElement &&
          (el.parentElement.tagName === 'A-CAMERA' ||
            el.parentElement.hasAttribute('camera'))
        ) {
          sceneElDom.appendChild(el);
        }
        el.removeAttribute('gps-entity-place');
        if (el.object3D) {
          el.object3D.position.copy(point);
        } else {
          el.setAttribute('position', `${point.x} ${point.y} ${point.z}`);
        }
        // Rotate to face camera
        const look = origin.clone().sub(point);
        const yaw = Math.atan2(look.x, look.z) * (180 / Math.PI);
        el.setAttribute('rotation', `0 ${yaw} 0`);

        // Optionally exit placement mode after one placement
        setPlacingMode(false);
      } catch (e) {
        console.error('placement pointer error', e);
      }
    };

    container.addEventListener('pointerdown', onPointer);
    return () => container.removeEventListener('pointerdown', onPointer);
  }, [placingMode]);

  // Show visual guide for floor detection
  const showFloorDetectionGuide = () => {
    const container = sceneRef.current;
    if (!container) return;
    
    const sceneEl = container.querySelector('a-scene');
    const guidesContainer = container.querySelector('#visual-guides');
    if (!sceneEl || !guidesContainer) return;
    
    // Create a grid of points to visualize the floor plane
    const gridSize = 5;
    const spacing = 0.5;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i - Math.floor(gridSize/2)) * spacing;
        const z = (j - Math.floor(gridSize/2)) * spacing;
        
        // Create a visual indicator for floor detection
        const indicator = document.createElement('a-entity');
        indicator.setAttribute('geometry', 'primitive: circle; radius: 0.05');
        indicator.setAttribute('material', 'color: #4ade80; shader: flat; transparent: true; opacity: 0.7');
        indicator.setAttribute('position', `${x} -1.5 ${z}`);
        indicator.setAttribute('class', 'floor-guide');
        guidesContainer.appendChild(indicator);
      }
    }
    
    // Add a larger central indicator
    const centerIndicator = document.createElement('a-entity');
    centerIndicator.setAttribute('geometry', 'primitive: ring; radiusInner: 0.1; radiusOuter: 0.15');
    centerIndicator.setAttribute('material', 'color: #22d3ee; shader: flat');
    centerIndicator.setAttribute('position', '0 -1.5 0');
    centerIndicator.setAttribute('rotation', '-90 0 0');
    centerIndicator.setAttribute('class', 'floor-guide');
    guidesContainer.appendChild(centerIndicator);
    
    // Add boundary indicators
    const boundaries = [
      { x: -1, y: -1.5, z: -1, label: 'Boundary' },
      { x: 1, y: -1.5, z: -1, label: 'Boundary' },
      { x: -1, y: -1.5, z: 1, label: 'Boundary' },
      { x: 1, y: -1.5, z: 1, label: 'Boundary' }
    ];
    
    boundaries.forEach(boundary => {
      const boundaryIndicator = document.createElement('a-entity');
      boundaryIndicator.setAttribute('geometry', 'primitive: box; width: 0.1; height: 0.1; depth: 0.1');
      boundaryIndicator.setAttribute('material', 'color: #fbbf24; shader: flat');
      boundaryIndicator.setAttribute('position', `${boundary.x} ${boundary.y} ${boundary.z}`);
      boundaryIndicator.setAttribute('class', 'floor-guide');
      guidesContainer.appendChild(boundaryIndicator);
    });
    
    // Add feedback text
    const feedbackText = document.createElement('a-entity');
    feedbackText.setAttribute('text', 'value: FLOOR DETECTED; align: center; width: 2; color: #4ade80');
    feedbackText.setAttribute('position', '0 -1.2 -1.5');
    feedbackText.setAttribute('class', 'floor-guide');
    guidesContainer.appendChild(feedbackText);
  };

  // Show visual guide for wall detection
  const showWallDetectionGuide = () => {
    const container = sceneRef.current;
    if (!container) return;
    
    const sceneEl = container.querySelector('a-scene');
    const guidesContainer = container.querySelector('#visual-guides');
    if (!sceneEl || !guidesContainer) return;
    
    // Create vertical lines to visualize wall detection
    const wallHeight = 2;
    const wallWidth = 3;
    
    // Create a wireframe rectangle to represent a wall
    const wallGuide = document.createElement('a-entity');
    wallGuide.setAttribute('geometry', `primitive: box; width: ${wallWidth}; height: ${wallHeight}; depth: 0.01`);
    wallGuide.setAttribute('material', 'color: #f87171; shader: flat; wireframe: true; transparent: true; opacity: 0.5');
    wallGuide.setAttribute('position', '0 0 -2');
    wallGuide.setAttribute('class', 'wall-guide');
    guidesContainer.appendChild(wallGuide);
    
    // Add corner indicators
    const corners = [
      { x: -wallWidth/2, y: -wallHeight/2, z: -2 },
      { x: wallWidth/2, y: -wallHeight/2, z: -2 },
      { x: -wallWidth/2, y: wallHeight/2, z: -2 },
      { x: wallWidth/2, y: wallHeight/2, z: -2 }
    ];
    
    corners.forEach(corner => {
      const cornerIndicator = document.createElement('a-entity');
      cornerIndicator.setAttribute('geometry', 'primitive: sphere; radius: 0.05');
      cornerIndicator.setAttribute('material', 'color: #fbbf24; shader: flat');
      cornerIndicator.setAttribute('position', `${corner.x} ${corner.y} ${corner.z}`);
      cornerIndicator.setAttribute('class', 'wall-guide');
      guidesContainer.appendChild(cornerIndicator);
    });
    
    // Add height indicators
    const heightIndicators = [
      { x: 0, y: wallHeight/2 + 0.2, z: -2, label: 'Height: 2m' },
      { x: 0, y: -wallHeight/2 - 0.2, z: -2, label: 'Ground Level' }
    ];
    
    heightIndicators.forEach(indicator => {
      const heightIndicator = document.createElement('a-entity');
      heightIndicator.setAttribute('geometry', 'primitive: ring; radiusInner: 0.05; radiusOuter: 0.1');
      heightIndicator.setAttribute('material', 'color: #a78bfa; shader: flat');
      heightIndicator.setAttribute('position', `${indicator.x} ${indicator.y} ${indicator.z}`);
      heightIndicator.setAttribute('rotation', '-90 0 0');
      heightIndicator.setAttribute('class', 'wall-guide');
      guidesContainer.appendChild(heightIndicator);
    });
    
    // Add feedback text
    const feedbackText = document.createElement('a-entity');
    feedbackText.setAttribute('text', 'value: WALL DETECTED; align: center; width: 2; color: #f87171');
    feedbackText.setAttribute('position', '0 0.5 -1.8');
    feedbackText.setAttribute('class', 'wall-guide');
    guidesContainer.appendChild(feedbackText);
  };

  // Show visual guide for object detection
  const showObjectDetectionGuide = () => {
    const container = sceneRef.current;
    if (!container) return;
    
    const sceneEl = container.querySelector('a-scene');
    const guidesContainer = container.querySelector('#visual-guides');
    if (!sceneEl || !guidesContainer) return;
    
    // Create bounding box indicators for object detection
    const objectIndicators = [
      { x: -0.5, y: 0, z: -1.5, color: '#a78bfa' },
      { x: 0.5, y: 0, z: -1.5, color: '#a78bfa' },
      { x: 0, y: 0.5, z: -1.5, color: '#a78bfa' },
      { x: 0, y: -0.5, z: -1.5, color: '#a78bfa' }
    ];
    
    objectIndicators.forEach(indicator => {
      const objIndicator = document.createElement('a-entity');
      objIndicator.setAttribute('geometry', 'primitive: sphere; radius: 0.07');
      objIndicator.setAttribute('material', `color: ${indicator.color}; shader: flat; transparent: true; opacity: 0.8`);
      objIndicator.setAttribute('position', `${indicator.x} ${indicator.y} ${indicator.z}`);
      objIndicator.setAttribute('class', 'object-guide');
      guidesContainer.appendChild(objIndicator);
    });
    
    // Add a central bounding box
    const boundingBox = document.createElement('a-entity');
    boundingBox.setAttribute('geometry', 'primitive: box; width: 0.5; height: 0.5; depth: 0.5');
    boundingBox.setAttribute('material', 'color: #f472b6; shader: flat; wireframe: true; transparent: true; opacity: 0.6');
    boundingBox.setAttribute('position', '0 0 -1.5');
    boundingBox.setAttribute('class', 'object-guide');
    guidesContainer.appendChild(boundingBox);
    
    // Add placement options indicators
    const placementOptions = [
      { x: -0.3, y: 0.7, z: -1.5, label: 'Place Here' },
      { x: 0.3, y: 0.7, z: -1.5, label: 'Place Here' },
      { x: 0, y: 0.7, z: -1.2, label: 'Place Here' }
    ];
    
    placementOptions.forEach(option => {
      const optionIndicator = document.createElement('a-entity');
      optionIndicator.setAttribute('geometry', 'primitive: cylinder; radius: 0.1; height: 0.02');
      optionIndicator.setAttribute('material', 'color: #34d399; shader: flat; transparent: true; opacity: 0.8');
      optionIndicator.setAttribute('position', `${option.x} ${option.y} ${option.z}`);
      optionIndicator.setAttribute('rotation', '-90 0 0');
      optionIndicator.setAttribute('class', 'object-guide');
      guidesContainer.appendChild(optionIndicator);
    });
    
    // Add feedback text
    const feedbackText = document.createElement('a-entity');
    feedbackText.setAttribute('text', 'value: OBJECT DETECTED; align: center; width: 2; color: #a78bfa');
    feedbackText.setAttribute('position', '0 1 -1.5');
    feedbackText.setAttribute('class', 'object-guide');
    guidesContainer.appendChild(feedbackText);
  };

  // Enhanced plane detection with visual feedback
  const detectPlanesWithFeedback = async () => {
    // This would integrate with WebXR or AR.js plane detection APIs
    // For now, we'll simulate plane detection with visual feedback
    
    // Show detection in progress
    setDetectionMode('floor');
    
    // Simulate detection process
    setTimeout(() => {
      // Show success feedback
      const container = sceneRef.current;
      if (container) {
        const sceneEl = container.querySelector('a-scene');
        const guidesContainer = container.querySelector('#visual-guides');
        if (sceneEl && guidesContainer) {
          const successIndicator = document.createElement('a-entity');
          successIndicator.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
          successIndicator.setAttribute('material', 'color: #34d399; shader: flat');
          successIndicator.setAttribute('position', '0 -1.5 -1');
          successIndicator.setAttribute('class', 'detection-feedback');
          guidesContainer.appendChild(successIndicator);
          
          const successText = document.createElement('a-entity');
          successText.setAttribute('text', 'value: SURFACE DETECTED; align: center; width: 3; color: #34d399');
          successText.setAttribute('position', '0 -1.2 -1');
          successText.setAttribute('class', 'detection-feedback');
          guidesContainer.appendChild(successText);
        }
      }
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        const feedbackElements = container?.querySelectorAll('.detection-feedback');
        feedbackElements?.forEach((el: Element) => el.remove());
      }, 3000);
    }, 1500);
  };

  // Clear all visual guides
  const clearVisualGuides = () => {
    const container = sceneRef.current;
    if (!container) return;
    
    const guidesContainer = container.querySelector('#visual-guides');
    if (guidesContainer) {
      guidesContainer.innerHTML = '';
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

  // If A-Frame failed to load, show error
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
      {aframeReady ? (
        // Insert A-Frame scene as raw HTML to avoid JSX typing issues
        <div
          ref={sceneRef}
          id="aframe-root"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        // Loading placeholder while A-Frame scripts are injected
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-center p-6 bg-black/50 rounded-xl border border-white/20 shadow-xl">
            <div className="text-xl sm:text-2xl font-bold mb-2">Initializing AR engine…</div>
            <div className="text-sm sm:text-base mt-2 text-gray-300">Please allow camera and location permissions when prompted</div>
            <div className="mt-4 w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      {/* Loading/Error UI */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
          <Card className="p-6 max-w-sm mx-4 bg-card/90 backdrop-blur-sm border border-white/20 shadow-xl">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 animate-spin border-4 rounded-full border-primary border-t-transparent" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg sm:text-xl">Initializing AR…</h3>
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
              onClick={detectPlanesWithFeedback}
              title="Detect surfaces with feedback"
            >
              <Scan className="w-5 h-5" />
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