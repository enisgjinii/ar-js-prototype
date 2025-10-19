"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, Volume2, Camera } from "lucide-react"
import { useT } from "@/lib/locale"

export default function AudioGuideView() {
  const t = useT()
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        // Handle play promise to catch errors
        audioRef.current.play()
          .then(() => {
            // Play started successfully
          })
          .catch((error) => {
            console.error("Audio play error:", error)
            // Reset playing state if play fails
            setIsPlaying(false)
          })
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 pb-28 md:pb-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">{t("audio.title")}</h1>
          <p className="text-muted-foreground text-base md:text-lg">{t("audio.subtitle")}</p>
        </div>

        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              {t("audio.cardTitle")}
            </CardTitle>
            <CardDescription>{t("audio.cardLocation")}</CardDescription>
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
              <h3 className="font-semibold">{t("audio.overviewTitle")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("audio.overviewText")}</p>
            </div>

            <Button onClick={toggleAudio} className="w-full gap-2" size="lg">
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  {t("audio.pause")}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  {t("audio.play")}
                </>
              )}
            </Button>

            {/* Using a valid audio source or fallback to a data URI for demonstration */}
            <audio 
              ref={audioRef} 
              onEnded={() => setIsPlaying(false)}
            >
              <source src="/sample-audio.mp3" type="audio/mpeg" />
              {/* Fallback for browsers that don't support MP3 or if the file is missing */}
              <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFd2xqZ2VjXl1bWFdVU1FPTkxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEA" type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
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