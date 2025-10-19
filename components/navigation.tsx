"use client"

import { Button } from "@/components/ui/button"
import { Headphones, Camera, MapPin } from "lucide-react"
import { useT } from "@/lib/locale"

interface NavigationProps {
  activeView: "audio" | "ar" | "location"
  onViewChange: (view: "audio" | "ar" | "location") => void
}

export default function Navigation({ activeView, onViewChange }: NavigationProps) {
  const t = useT()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="flex items-center justify-around p-2 max-w-3xl mx-auto md:max-w-md">
        <Button
          variant={activeView === "audio" ? "default" : "ghost"}
          size="lg"
          onClick={() => onViewChange("audio")}
          className="flex-1 mx-1 gap-2 min-w-0 py-2"
        >
          <Headphones className="w-5 h-5" />
          <span className="font-medium truncate">{t("nav.audio")}</span>
        </Button>

        <Button
          variant={activeView === "ar" ? "default" : "ghost"}
          size="lg"
          onClick={() => onViewChange("ar")}
          className="flex-1 mx-1 gap-2 min-w-0 py-2"
        >
          <Camera className="w-5 h-5" />
          <span className="font-medium truncate">{t("nav.ar")}</span>
        </Button>
      </div>
    </nav>
  )
}