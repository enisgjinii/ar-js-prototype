"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, Volume2, Camera } from "lucide-react"

export default function AudioGuideView() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 pb-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-balance">Cultural AR Experience</h1>
          <p className="text-muted-foreground text-lg">
            Discover history through immersive audio and augmented reality
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              Audio Guide
            </CardTitle>
            <CardDescription>Location: Düsseldorf, Germany</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Volume2 className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Sample audio guide content</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Historical Site Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Welcome to this historic location. This audio guide will take you through the fascinating history and
                cultural significance of this site. Switch to AR view to see 3D reconstructions at their original
                locations.
              </p>
            </div>

            <Button onClick={toggleAudio} className="w-full gap-2" size="lg">
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause Audio
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Play Audio Guide
                </>
              )}
            </Button>

            <audio ref={audioRef} src="/sample-audio.mp3" onEnded={() => setIsPlaying(false)} />
          </CardContent>
        </Card>

        <Card className="bg-accent/50 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Camera className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Ready for AR?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Switch to AR View to see 3D models placed at real-world coordinates. Make sure to allow camera and
                  location permissions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
