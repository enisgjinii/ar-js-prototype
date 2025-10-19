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

      {/* Debug controls */}
      <div className="absolute bottom-6 left-4 z-30">
        <div className="flex flex-col gap-2">
          <Button size="sm" variant={cameraEnabled ? "secondary" : "outline"} onClick={requestCameraPermission}>
            {cameraEnabled ? "Camera enabled" : "Enable camera"}
          </Button>
          <Button size="sm" variant={placingMode ? "secondary" : "outline"} onClick={() => setPlacingMode((s) => !s)}>
            {placingMode ? "Exit placement mode" : "Tap to place"}
          </Button>
          <Button size="sm" variant="outline" onClick={placeInFront}>
            Place model in front
          </Button>
          <Button size="sm" variant="outline" onClick={placeOnSurface}>
            Place on surface
          </Button>
          <Button size="sm" variant="outline" onClick={simulateGPS}>
            Simulate GPS at target
          </Button>
        </div>
      </div>

      <div className="h-24" />
    </div>
  )
}
