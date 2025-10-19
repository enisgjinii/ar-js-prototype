"use client"

import { useState } from "react"
import AudioGuideView from "@/components/audio-guide-view"
import ARView from "@/components/ar-view"
import Navigation from "@/components/navigation"

export default function Home() {
  const [activeView, setActiveView] = useState<"audio" | "ar">("audio")

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {activeView === "audio" ? <AudioGuideView /> : <ARView />}

      <Navigation activeView={activeView} onViewChange={setActiveView} />
    </main>
  )
}
