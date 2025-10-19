"use client"

import { useState, useEffect } from "react"
import AudioGuideView from "@/components/audio-guide-view"
import ARView from "@/components/ar-view"
import Navigation from "@/components/navigation"
import LocationTest from "@/components/location-test"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useT } from "@/lib/locale"

export default function Home() {
  const [activeView, setActiveView] = useState<"audio" | "ar" | "location">("audio")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  const t = useT()

  if (!mounted) {
    return (
      <main className="relative w-full h-screen overflow-hidden bg-background">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">{t("common.loading")}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative w-full min-h-screen bg-background">
      {activeView === "audio" ? (
        <AudioGuideView />
      ) : activeView === "ar" ? (
        <ARView />
      ) : (
        <div className="flex items-center justify-center min-h-screen p-4">
          <LocationTest />
        </div>
      )}

      <Navigation activeView={activeView === "location" ? "audio" : activeView} onViewChange={setActiveView} />
      
      {/* Theme toggle button */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 items-center">
        {activeView !== "location" && (
          <button
            onClick={() => setActiveView("location")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm transition-colors"
          >
            {t("common.testLocation")}
          </button>
        )}
        {activeView === "location" && (
          <button
            onClick={() => setActiveView("audio")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm transition-colors"
          >
            {t("common.backToApp")}
          </button>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="bg-background/80 backdrop-blur-sm border border-border"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">{t("common.toggleTheme")}</span>
        </Button>
      </div>
    </main>
  )
}