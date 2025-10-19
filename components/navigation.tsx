"use client"

import { Button } from "@/components/ui/button"
import { Headphones, Camera } from "lucide-react"

interface NavigationProps {
  activeView: "audio" | "ar"
  onViewChange: (view: "audio" | "ar") => void
}

export default function Navigation({ activeView, onViewChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="flex items-center justify-around p-4 max-w-md mx-auto">
        <Button
          variant={activeView === "audio" ? "default" : "ghost"}
          size="lg"
          onClick={() => onViewChange("audio")}
          className="flex-1 mx-2 gap-2"
        >
          <Headphones className="w-5 h-5" />
          <span className="font-medium">Audio Guide</span>
        </Button>

        <Button
          variant={activeView === "ar" ? "default" : "ghost"}
          size="lg"
          onClick={() => onViewChange("ar")}
          className="flex-1 mx-2 gap-2"
        >
          <Camera className="w-5 h-5" />
          <span className="font-medium">AR View</span>
        </Button>
      </div>
    </nav>
  )
}
