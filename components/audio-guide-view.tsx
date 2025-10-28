'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Play, Pause, Volume2, Square } from 'lucide-react';
import { useT } from '@/lib/locale';

interface AudioGuideViewProps {
  onPause?: () => void;
  onStop?: () => void;
  onPlay?: () => void;
  isPlaying?: boolean;
}

export default function AudioGuideView({
  onPause,
  onStop,
  onPlay,
  isPlaying = false,
}: AudioGuideViewProps) {
  const t = useT();

  const toggleAudio = () => {
    if (isPlaying) {
      onPause && onPause();
    } else {
      onPlay && onPlay();
    }
  };

  const stopAudio = () => {
    onStop && onStop();
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
            <CardDescription className="text-sm sm:text-base">
              {t('audio.cardLocation')}
            </CardDescription>
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
              <h3 className="font-semibold text-base sm:text-lg">
                {t('audio.overviewTitle')}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t('audio.overviewText')}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={toggleAudio} className="flex-1 gap-2" size="lg">
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span className="text-sm sm:text-base">
                      {t('audio.pause')}
                    </span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span className="text-sm sm:text-base">
                      {t('audio.play')}
                    </span>
                  </>
                )}
              </Button>

              {isPlaying && (
                <Button
                  onClick={stopAudio}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Square className="w-5 h-5" />
                  <span className="sr-only sm:not-sr-only text-sm sm:text-base">
                    {t('common.stop')}
                  </span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
