"use client"

import React, { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/locale"

// Target coordinates: 51°12'42.4"N 6°13'07.3"E (Düsseldorf)
const TARGET_LAT = 51.211778
const TARGET_LON = 6.218694

export default function ARView() {
  const t = useT()
  const sceneRef = useRef<any>(null)
  const modelRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aframeReady, setAframeReady] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [placingMode, setPlacingMode] = useState(false)
  const placedAutomatically = useRef(false)

  // Dynamically load A-Frame and AR.js (A-Frame build) on client
  useEffect(() => {
    if (typeof window === "undefined") return

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        // If already present, resolve
        if (document.querySelector(`script[src="${src}"]`)) return resolve()
        const s = document.createElement("script")
        s.src = src
        s.async = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error(`Failed to load script: ${src}`))
        document.head.appendChild(s)
      })

    const ensureAframe = async () => {
      try {
        if ((window as any).AFRAME) {
          setAframeReady(true)
          return
        }

        await loadScript("https://aframe.io/releases/1.4.0/aframe.min.js")
        // AR.js A-Frame plugin
        await loadScript("https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.min.js")

        // Wait a tick for AFRAME to register
        setTimeout(() => setAframeReady(true), 50)
      } catch (e) {
        console.error("Failed to load A-Frame or AR.js scripts:", e)
        setError("Failed to initialize AR scripts")
      }
    }

    ensureAframe()
  }, [])

  // Attach model event listeners after A-Frame is ready and element exists
  useEffect(() => {
    if (!aframeReady) return

    // Insert A-Frame scene markup into the container (avoid JSX tags for a-scene)
    const container = sceneRef.current
    if (!container) return

    // If scene already exists, don't recreate
    if (container.querySelector && container.querySelector("a-scene")) {
      // pick up existing model element if present
      const existing = container.querySelector("#dog-model")
      if (existing) modelRef.current = existing
      return
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
      </a-scene>
    `

    container.innerHTML = sceneHtml

    // set refs to created elements
    const sceneEl = container.querySelector("a-scene") as HTMLElement | null
    const modelEl = container.querySelector("#dog-model") as HTMLElement | null
    modelRef.current = modelEl

    if (!modelEl) {
      setError("3D model element not found in scene")
      return
    }

    const onModelLoaded = () => {
      setIsLoaded(true)
      console.log("Model loaded into A-Frame scene")
    }

    const onModelError = (e: any) => {
      console.error("A-Frame model error:", e)
      setError("Failed to load 3D model")
    }

    modelEl.addEventListener("model-loaded", onModelLoaded)
    modelEl.addEventListener("error", onModelError)

    return () => {
      try {
        modelEl.removeEventListener("model-loaded", onModelLoaded)
        modelEl.removeEventListener("error", onModelError)
      } catch (e) {
        // ignore
      }
    }
  }, [aframeReady])

  // When A-Frame is ready, prompt for camera permission automatically (best-effort)
  useEffect(() => {
    if (!aframeReady) return
    // Fire-and-forget; permissions may require user interaction on some browsers
    ;(async () => {
      try {
        await requestCameraPermission()
      } catch (e) {
        // ignore
      }
    })()
  }, [aframeReady])

  // Once the model is loaded, place it automatically on the surface one time
  useEffect(() => {
    if (!isLoaded) return
    if (placedAutomatically.current) return
    placedAutomatically.current = true
    // small delay to allow camera stream to stabilize
    setTimeout(() => {
      placeOnSurface()
    }, 600)
  }, [isLoaded])

  // Place the model 1.5m in front of the camera (indoor test helper)
  const placeInFront = () => {
    try {
      const el = modelRef.current
      if (!el) return
      // Remove gps attributes to put it in camera space
      el.removeAttribute("gps-entity-place")
      el.setAttribute("position", "0 0 -1.5")
      el.setAttribute("rotation", "0 180 0")
      el.setAttribute("scale", "0.8 0.8 0.8")
      // Attach to camera entity
      const scene = sceneRef.current
      const cam = scene && scene.querySelector && scene.querySelector("a-camera, [camera]")
      if (cam) {
        cam.appendChild(el)
      }
    } catch (e) {
      console.error("placeInFront error:", e)
    }
  }

  // Simulate GPS by moving the entity to the target lat/lon (works if gps-entity-place plugin is used)
  const simulateGPS = () => {
    try {
      const el = modelRef.current
      if (!el) return
      // Ensure it's not attached to camera
      const parent = el.parentElement
      if (parent && (parent.tagName === "A-CAMERA" || parent.hasAttribute("camera"))) {
        document.querySelector("a-scene")?.appendChild(el)
      }
      el.setAttribute("gps-entity-place", `latitude: ${TARGET_LAT}; longitude: ${TARGET_LON};`)
      el.setAttribute("position", "0 0 0")
    } catch (e) {
      console.error("simulateGPS error:", e)
    }
  }

  // Place model on an estimated horizontal surface using a ray from the camera.
  // Uses A-Frame's THREE when available to compute intersection with an estimated floor plane.
  const placeOnSurface = async () => {
    try {
      const el = modelRef.current as any
      const container = sceneRef.current
      if (!el || !container) return

      // Try WebXR hit-test first on capable devices
      const didPlaceWithWebXR = await tryWebXRHitTest(el)
      if (didPlaceWithWebXR) return

      const sceneEl = container.querySelector && container.querySelector("a-scene")
      const cam = sceneEl && (sceneEl.querySelector("a-camera") || sceneEl.querySelector("[camera]"))
      if (!cam) {
        console.warn("Camera element not found; falling back to placeInFront")
        placeInFront()
        return
      }

      const THREE = (window as any).AFRAME && (window as any).AFRAME.THREE
      if (!THREE) {
        console.warn("THREE not available on AFRAME; falling back to placeInFront")
        placeInFront()
        return
      }

      // Ensure model has an object3D (wait briefly if model is still loading)
      await new Promise<void>((resolve) => {
        if (el.object3D) return resolve()
        const onLoaded = () => resolve()
        el.addEventListener("model-loaded", onLoaded, { once: true })
        // safety timeout
        setTimeout(() => resolve(), 1500)
      })

      const camObj = (cam as any).object3D
      const origin = new THREE.Vector3()
      camObj.getWorldPosition(origin)
      const dir = new THREE.Vector3()
      camObj.getWorldDirection(dir)

      // Estimate floor plane as 1.5m below the camera (tweakable)
      const estimatedFloorOffset = 1.5
      let t
      if (Math.abs(dir.y) < 1e-3) {
        t = estimatedFloorOffset
      } else {
        const planeY = origin.y - estimatedFloorOffset
        t = (planeY - origin.y) / dir.y
        if (t <= 0) t = estimatedFloorOffset
      }

      const point = origin.clone().add(dir.clone().multiplyScalar(t))

      // Ensure model is attached to the scene (not camera)
      const parent = el.parentElement
      if (parent && (parent.tagName === "A-CAMERA" || parent.hasAttribute("camera"))) {
        sceneEl.appendChild(el)
      }

      // Remove gps placement and set world position
      el.removeAttribute("gps-entity-place")
      // Use object3D when available to set exact world position
      if (el.object3D) {
        el.object3D.position.copy(point)
      } else {
        el.setAttribute("position", `${point.x} ${point.y} ${point.z}`)
      }

      // Face the camera on the Y axis
      const camPos = origin
      const look = camPos.clone().sub(point)
      const yaw = Math.atan2(look.x, look.z) * (180 / Math.PI)
      el.setAttribute("rotation", `0 ${yaw} 0`)
      el.setAttribute("scale", "0.8 0.8 0.8")
    } catch (e) {
      console.error("placeOnSurface error:", e)
    }
  }

  // Try to perform a WebXR hit-test (immersive-ar) and place the given model element on the first hit.
  // Returns true if placed using WebXR, false otherwise.
  const tryWebXRHitTest = async (el: any): Promise<boolean> => {
    try {
      const nav = navigator as any
      if (!nav.xr || !nav.xr.isSessionSupported) return false
      const supported = await nav.xr.isSessionSupported("immersive-ar")
      if (!supported) return false

      // Request an immersive AR session with hit-test
      const session: any = await nav.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test", "local-floor"],
      })

      // Create an offscreen canvas and WebGL context compatible with XR
      const canvas = document.createElement("canvas")
      const gl = (canvas.getContext("webgl", { xrCompatible: true }) || canvas.getContext("experimental-webgl")) as any
      if (!gl) {
        await session.end()
        return false
      }

      if (gl.makeXRCompatible) await gl.makeXRCompatible()

      // @ts-ignore - XRWebGLLayer may not be typed here
      session.updateRenderState({ baseLayer: new (window as any).XRWebGLLayer(session, gl) })

      const viewerSpace = await session.requestReferenceSpace("viewer")
      const refSpace = await session.requestReferenceSpace("local-floor").catch(() => session.requestReferenceSpace("local"))
      const hitSource = await session.requestHitTestSource({ space: viewerSpace })

      return await new Promise<boolean>((resolve) => {
        let done = false
        const onFrame = (time: any, frame: any) => {
          if (done) return
          const results = frame.getHitTestResults(hitSource)
          if (results && results.length) {
            const pose = results[0].getPose(refSpace)
            if (pose) {
              const p = pose.transform.position
              const o = pose.transform.orientation
              // Place model in world coordinates
              try {
                if (el.object3D) {
                  el.object3D.position.set(p.x, p.y, p.z)
                  el.object3D.quaternion.set(o.x, o.y, o.z, o.w)
                } else {
                  el.setAttribute("position", `${p.x} ${p.y} ${p.z}`)
                  // approximate rotation from quaternion
                  el.setAttribute("rotation", `0 0 0`)
                }
              } catch (e) {
                console.warn("WebXR placement applied but failed to set object3D", e)
              }

              done = true
              // end hit test and session
              try {
                hitSource.cancel && hitSource.cancel()
              } catch (e) {}
              session.end().then(() => resolve(true)).catch(() => resolve(true))
              return
            }
          }
          session.requestAnimationFrame(onFrame)
        }

        session.requestAnimationFrame(onFrame)

        // safety timeout
        setTimeout(() => {
          if (done) return
          done = true
          session.end().then(() => resolve(false)).catch(() => resolve(false))
        }, 8000)
      })
    } catch (e) {
      console.warn("WebXR hit-test not available or failed:", e)
      return false
    }
  }

  // Request camera permission explicitly (prompts user). We stop tracks immediately — AR.js/A-Frame will open camera when needed,
  // but calling getUserMedia first helps trigger the permission prompt on some browsers.
  const requestCameraPermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera not supported in this browser")
        return false
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // stop tracks immediately; this was only to trigger permission prompt
      stream.getTracks().forEach((t) => t.stop())
      setCameraEnabled(true)
      return true
    } catch (e) {
      console.warn("Camera permission denied or unavailable:", e)
      setError("Camera permission denied or unavailable")
      return false
    }
  }

  // Placement mode: add pointer listener and compute world point from screen coordinates
  useEffect(() => {
    if (!placingMode) return
    const container = sceneRef.current
    if (!container) return
    const sceneEl = container.querySelector && container.querySelector("a-scene")
    const cam = sceneEl && (sceneEl.querySelector("a-camera") || sceneEl.querySelector("[camera]"))
    if (!cam) {
      console.warn("No camera found for placement mode")
      return
    }

    const onPointer = (ev: PointerEvent) => {
      try {
        const rect = (container as HTMLElement).getBoundingClientRect()
        const clientX = ev.clientX - rect.left
        const clientY = ev.clientY - rect.top
        const ndcX = (clientX / rect.width) * 2 - 1
        const ndcY = -((clientY / rect.height) * 2 - 1)

        const THREE = (window as any).AFRAME && (window as any).AFRAME.THREE
        if (!THREE) return

        // A-Frame camera's underlying THREE camera is accessible via getObject3D('camera')
        const threeCam = (cam as any).getObject3D && (cam as any).getObject3D('camera')
        if (!threeCam) return

        const mouse = new THREE.Vector2(ndcX, ndcY)
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, threeCam)
        const origin = raycaster.ray.origin
        const dir = raycaster.ray.direction

        // Estimate floor Y position as camera Y - 1.5m
        const estimatedFloorOffset = 1.5
        const planeY = origin.y - estimatedFloorOffset
        let t = (planeY - origin.y) / dir.y
        if (t <= 0) t = estimatedFloorOffset
        const point = origin.clone().add(dir.clone().multiplyScalar(t))

        // Place model at computed point
        const el = modelRef.current as any
        if (!el) return
        const sceneElDom = sceneEl as HTMLElement
        // ensure model is child of scene
        if (el.parentElement && (el.parentElement.tagName === 'A-CAMERA' || el.parentElement.hasAttribute('camera'))) {
          sceneElDom.appendChild(el)
        }
        el.removeAttribute('gps-entity-place')
        if (el.object3D) {
          el.object3D.position.copy(point)
        } else {
          el.setAttribute('position', `${point.x} ${point.y} ${point.z}`)
        }
        // Rotate to face camera
        const look = origin.clone().sub(point)
        const yaw = Math.atan2(look.x, look.z) * (180 / Math.PI)
        el.setAttribute('rotation', `0 ${yaw} 0`)

        // Optionally exit placement mode after one placement
        setPlacingMode(false)
      } catch (e) {
        console.error('placement pointer error', e)
      }
    }

    container.addEventListener('pointerdown', onPointer)
    return () => container.removeEventListener('pointerdown', onPointer)
  }, [placingMode])

  // If A-Frame failed to load, show error
  if (error) {
    return (
      <div className="relative w-full h-screen bg-black">
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 p-4">
          <Card className="p-6 max-w-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <h3 className="font-semibold">AR Unavailable</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {aframeReady ? (
        // Insert A-Frame scene as raw HTML to avoid JSX typing issues
        <div
          ref={sceneRef}
          id="aframe-root"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        // Loading placeholder while A-Frame scripts are injected
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Initializing AR engine…</div>
        </div>
      )}

      {/* Loading/Error UI */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <Card className="p-6 max-w-sm mx-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-8 h-8 animate-spin border-2 rounded-full border-primary" />
              <div className="space-y-2">
                <h3 className="font-semibold">Initializing AR…</h3>
                <p className="text-sm text-muted-foreground">Allow camera and location access when prompted.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 p-4">
          <Card className="p-6 max-w-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <h3 className="font-semibold">AR Unavailable</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Mobile-friendly bottom control bar */}
      <div className="fixed left-0 right-0 bottom-0 z-40 p-4 pb-safe bg-gradient-to-t from-black/70 via-black/30 to-transparent backdrop-blur-sm">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-2">{isLoaded ? "Model loaded" : "Initializing AR…"}</div>
              <div className="flex gap-2">
                <Button className="flex-1 py-3 text-sm" size="sm" variant={cameraEnabled ? "secondary" : "outline"} onClick={requestCameraPermission}>
                  {cameraEnabled ? "Camera" : "Enable camera"}
                </Button>
                <Button className="flex-1 py-3 text-sm" size="sm" variant={placingMode ? "secondary" : "outline"} onClick={() => setPlacingMode((s) => !s)}>
                  {placingMode ? "Exit" : "Tap to place"}
                </Button>
              </div>
            </div>
            <div className="ml-3 hidden sm:flex sm:flex-col sm:gap-2">
              <Button size="sm" className="py-3" variant="outline" onClick={placeInFront}>
                In front
              </Button>
              <Button size="sm" className="py-3" variant="outline" onClick={placeOnSurface}>
                Surface
              </Button>
            </div>
          </div>
          <div className="mt-3 flex gap-2 sm:hidden">
            <Button className="flex-1 py-3 text-sm" size="sm" variant="outline" onClick={placeInFront}>
              In front
            </Button>
            <Button className="flex-1 py-3 text-sm" size="sm" variant="outline" onClick={placeOnSurface}>
              Surface
            </Button>
          </div>
        </div>
      </div>

      {/* Instruction overlay for mobile users */}
      <div className="pointer-events-none fixed top-4 left-4 right-4 z-30 flex justify-center">
        <div className="bg-black/60 text-white rounded-md px-3 py-2 text-sm backdrop-blur-sm">
          Tap screen to focus and allow camera & location. Use "Tap to place" to drop the model.
        </div>
      </div>

      <div className="h-24" />
    </div>
  )
}
