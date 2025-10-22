'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Play, Pause, Volume2 } from 'lucide-react';
import { useT } from '@/lib/locale';

export default function AudioGuideView() {
  const t = useT();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Handle play promise to catch errors
        audioRef.current
          .play()
          .then(() => {
            // Play started successfully
          })
          .catch(error => {
            console.error('Audio play error:', error);
            // Reset playing state if play fails
            setIsPlaying(false);
          });
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 pb-28 sm:pb-32 md:pb-36 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-balance">
            {t('audio.title')}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl">
            {t('audio.subtitle')}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary sm:w-6 sm:h-6" />
              <span className="text-lg sm:text-xl">{t('audio.cardTitle')}</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">{t('audio.cardLocation')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('audio.sampleContent')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-base sm:text-lg">{t('audio.overviewTitle')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t('audio.overviewText')}
              </p>
            </div>

            <Button onClick={toggleAudio} className="w-full gap-2" size="lg">
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span className="text-sm sm:text-base">{t('audio.pause')}</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span className="text-sm sm:text-base">{t('audio.play')}</span>
                </>
              )}
            </Button>

            {/* Using a valid audio source or fallback to a data URI for demonstration */}
            <audio ref={audioRef} onEnded={() => setIsPlaying(false)}>
              <source src="/sample-audio.mp3" type="audio/mpeg" />
              {/* Fallback for browsers that don't support MP3 or if the file is missing */}
              <source
                src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFd2xqZ2VjXl1bWFdVU1FPTkxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEA"
                type="audio/wav"
              />
              {t('audio.audioFallback')}
            </audio>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}