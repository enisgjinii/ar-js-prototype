"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentPosition, isGeolocationSupported } from "@/lib/geolocation"
import { useT } from "@/lib/locale"

export default function LocationTest() {
  const t = useT()
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getLocation = () => {
    setLoading(true)
    setError(null)
    
    // Check if geolocation is available
    if (!isGeolocationSupported()) {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
      return
    }

    // Use our utility function
    getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        console.error("Location error:", err)
        setError(err.message || "An unknown error occurred while retrieving your location.")
        setLoading(false)
      },
      {
        enableHighAccuracy: false, // Try with less accuracy first
        timeout: 15000, // 15 second timeout
        maximumAge: 600000 // Accept positions up to 10 minutes old
      }
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t("locationTest.title")}</CardTitle>
        <CardDescription>{t("locationTest.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={getLocation} disabled={loading} className="w-full">
          {loading ? t("locationTest.getting") : t("locationTest.getLocation")}
        </Button>
        
        {location && (
          <div className="p-4 bg-green-50 rounded-lg dark:bg-green-950">
            <h3 className="font-medium text-green-800 dark:text-green-200">Location Found</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Latitude: {location.lat.toFixed(6)}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Longitude: {location.lon.toFixed(6)}
            </p>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 rounded-lg dark:bg-red-950">
            <h3 className="font-medium text-red-800 dark:text-red-200">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-2">
          <p><strong>{t("locationTest.tipsTitle")}</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            {Array.isArray((t as any)("locationTest.tips"))
              ? ((t as any)("locationTest.tips") as string[]).map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))
              : // Fallback if translation function can't return arrays
                ["Ensure location services are enabled on your device", "Check that your browser has location permissions"].map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}