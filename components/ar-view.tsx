"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { AlertCircle, MapPin, Loader2, NavigationIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { watchPosition, isGeolocationSupported } from "@/lib/geolocation"
import { useT } from "@/lib/locale"

// Target coordinates: 51°12'42.4"N 6°13'07.3"E (Düsseldorf)
const TARGET_LAT = 51.211778
const TARGET_LON = 6.218694

export default function ARView() {
  const t = useT()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [cameraPermission, setCameraPermission] = useState<"pending" | "granted" | "denied">("pending")
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const arLocationRef = useRef<any>(null)

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  useEffect(() => {
    // Check if running in browser
    if (typeof window === "undefined") return

    let watchId: number | null = null

    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach((track) => track.stop())
        setCameraPermission("granted")
      } catch (err) {
        console.error("Camera permission denied:", err)
        setCameraPermission("denied")
        setError("Camera access denied. Please enable camera permissions in your browser settings.")
        setIsLoading(false)
      }
    }

    const requestLocationPermission = () => {
      if (!isGeolocationSupported()) {
        setError("Geolocation is not supported by your browser.")
        setIsLoading(false)
        return
      }

      // Use our utility function
      watchId = watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          }
          setUserLocation(newLocation)

          // Calculate distance to target
          const dist = calculateDistance(newLocation.lat, newLocation.lon, TARGET_LAT, TARGET_LON)
          setDistance(dist)
          setIsLoading(false)
        },
        (err) => {
          console.error("Location error:", err)
          setError(err.message || "An unknown error occurred while retrieving your location.")
          setIsLoading(false)
        },
        {
          enableHighAccuracy: false, // Try with less accuracy first
          maximumAge: 60000, // Use cached position up to 1 minute old
          timeout: 15000, // 15 second timeout
        }
      )
    }

    const initAR = async () => {
      try {
        // Wait for THREE to be available
        if (typeof window.THREE === "undefined") {
          setTimeout(initAR, 100)
          return
        }

        const THREE = window.THREE

        // Create scene
        const scene = new THREE.Scene()
        sceneRef.current = scene

        // Create camera with wider FOV for AR
        const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 10000)
        cameraRef.current = camera

        // Create renderer with alpha for camera overlay
        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
        })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setClearColor(0x000000, 0)
        rendererRef.current = renderer

        if (containerRef.current) {
          containerRef.current.appendChild(renderer.domElement)
        }

        const video = document.createElement("video")
        video.setAttribute("autoplay", "")
        video.setAttribute("playsinline", "")
        video.style.position = "absolute"
        video.style.top = "0"
        video.style.left = "0"
        video.style.width = "100%"
        video.style.height = "100%"
        video.style.objectFit = "cover"
        video.style.zIndex = "-1"

        if (containerRef.current) {
          containerRef.current.insertBefore(video, containerRef.current.firstChild)
        }

        // Start camera stream
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          })
          video.srcObject = stream
        } catch (err) {
          console.error("Camera stream error:", err)
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(10, 20, 10)
        directionalLight.castShadow = true
        scene.add(directionalLight)

        const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5)
        scene.add(hemisphereLight)

        const createMonument = () => {
          const group = new THREE.Group()

          // Base platform
          const baseGeometry = new THREE.CylinderGeometry(3, 3.5, 0.5, 8)
          const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            metalness: 0.2,
            roughness: 0.8,
          })
          const base = new THREE.Mesh(baseGeometry, baseMaterial)
          base.position.y = 0.25
          group.add(base)

          // Main column
          const columnGeometry = new THREE.CylinderGeometry(1.5, 1.5, 8, 12)
          const columnMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.6,
            roughness: 0.3,
          })
          const column = new THREE.Mesh(columnGeometry, columnMaterial)
          column.position.y = 4.5
          group.add(column)

          // Top sphere (decorative element)
          const sphereGeometry = new THREE.SphereGeometry(1.2, 16, 16)
          const sphereMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d7a4f,
            metalness: 0.7,
            roughness: 0.2,
          })
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
          sphere.position.y = 9.2
          group.add(sphere)

          // Add decorative rings
          for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(1.7, 0.1, 8, 16)
            const ringMaterial = new THREE.MeshStandardMaterial({
              color: 0xc0c0c0,
              metalness: 0.8,
              roughness: 0.2,
            })
            const ring = new THREE.Mesh(ringGeometry, ringMaterial)
            ring.position.y = 2 + i * 2.5
            ring.rotation.x = Math.PI / 2
            group.add(ring)
          }

          return group
        }

        const monument = createMonument()
        monument.position.set(0, 0, -20) // Position in front of camera
        monument.scale.set(1.5, 1.5, 1.5)
        scene.add(monument)

        const createLabel = () => {
          const canvas = document.createElement("canvas")
          const context = canvas.getContext("2d")!
          canvas.width = 512
          canvas.height = 128

          context.fillStyle = "rgba(0, 0, 0, 0.7)"
          context.fillRect(0, 0, canvas.width, canvas.height)

          context.font = "bold 36px Arial"
          context.fillStyle = "white"
          context.textAlign = "center"
          context.fillText("Historic Monument", canvas.width / 2, 50)
          context.font = "24px Arial"
          context.fillText("Düsseldorf, Germany", canvas.width / 2, 90)

          const texture = new THREE.CanvasTexture(canvas)
          const material = new THREE.SpriteMaterial({ map: texture })
          const sprite = new THREE.Sprite(material)
          sprite.scale.set(8, 2, 1)
          sprite.position.set(0, 12, -20)

          return sprite
        }

        const label = createLabel()
        scene.add(label)

        let animationId: number
        const animate = () => {
          animationId = requestAnimationFrame(animate)

          // Gentle rotation of monument
          monument.rotation.y += 0.005

          renderer.render(scene, camera)
        }

        animate()
        setIsLoading(false)

        // Handle window resize
        const handleResize = () => {
          if (cameraRef.current && rendererRef.current) {
            cameraRef.current.aspect = window.innerWidth / window.innerHeight
            cameraRef.current.updateProjectionMatrix()
            rendererRef.current.setSize(window.innerWidth, window.innerHeight)
          }
        }
        window.addEventListener("resize", handleResize)

        return () => {
          window.removeEventListener("resize", handleResize)
          cancelAnimationFrame(animationId)
          if (containerRef.current && rendererRef.current?.domElement) {
            try {
              containerRef.current.removeChild(rendererRef.current.domElement)
            } catch (e) {
              // Element already removed
            }
          }
          if (video.srcObject) {
            const tracks = (video.srcObject as MediaStream).getTracks()
            tracks.forEach((track) => track.stop())
          }
        }
      } catch (err) {
        console.error("AR initialization error:", err)
        setError("Failed to initialize AR view. Please try again.")
        setIsLoading(false)
      }
    }

    // Start initialization sequence
    requestCameraPermission().then(() => {
      if (cameraPermission !== "denied") {
        requestLocationPermission()
        initAR()
      }
    })

    return () => {
      // Cleanup location watch
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
      // Cleanup renderer
      if (rendererRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement)
        } catch (e) {
          // Element already removed
        }
      }
    }
  }, [])

  return (
    <div className="relative w-full h-screen bg-black">
      {/* AR Scene Container */}
      <div ref={containerRef} className="ar-container w-full h-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <Card className="p-6 max-w-sm mx-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <div className="space-y-2">
                <h3 className="font-semibold">{t("ar.initializing")}</h3>
                <p className="text-sm text-muted-foreground">{t("ar.allow")}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 p-4">
          <Card className="p-6 max-w-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <div className="space-y-2">
                <h3 className="font-semibold">{t("ar.unavailableTitle")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-2">
                {t("ar.retry")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Info Overlay */}
      {!isLoading && !error && (
        <div className="absolute top-4 left-4 right-4 z-20">
      <Card className="bg-card/95 backdrop-blur-sm border-primary/20">
        <div className="p-3 md:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">{t("ar.targetLocation")}</span>
                  </div>
                {distance !== null && (
                  <div className="flex items-center gap-1 text-xs font-medium text-primary">
                    <NavigationIcon className="w-3 h-3" />
                    {distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-mono">{t("ar.coords")}</p>
                <p className="leading-relaxed">{t("ar.pointHint")}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom padding for navigation */}
      <div className="h-24" />
    </div>
  )
}