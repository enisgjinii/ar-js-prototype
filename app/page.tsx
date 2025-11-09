'use client';

import { useState, useEffect, useRef } from 'react';
import AudioGuideView from '@/components/audio-guide-view';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import { Button } from '@/components/ui/button';
import {
  Sun,
  Moon,
  Languages,
  Play,
  Pause,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useT, useLocale } from '@/lib/locale';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ARHelpModal from '@/components/ar-help-modal';

export default function Home() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'audio' | 'ar'>('audio');
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const t = useT();

  // Handle view change without automatically pausing audio
  const handleViewChange = (view: 'audio' | 'ar') => {
    // Switch between audio and AR view without navigation
    // Audio will continue playing in the background
    // Users can control it through the sidebar controls
    setActiveView(view);
  };

  const handleAudioPlay = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsAudioPlaying(true);
        })
        .catch(error => {
          console.error('Audio play error:', error);
          setIsAudioPlaying(false);
        });
    }
  };

  const handleAudioPause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  };

  const handleAudioReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
    }
  };

  if (!mounted) {
    return (
      <main className="relative w-full h-screen overflow-hidden bg-background">
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="h-5 w-5 animate-spin text-primary" />
            <span>{t('common.loading') || 'Loading...'}</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-background">
      {/* Persistent audio element that survives tab switches */}
      <audio ref={audioRef} onEnded={() => setIsAudioPlaying(false)}>
        <source src="/sample-audio.mp3" type="audio/mpeg" />
        {/* Fallback for browsers that don't support MP3 or if the file is missing */}
        <source
          src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFd2xqZ2VjXl1bWFdVU1FPTkxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEA"
          type="audio/wav"
        />
        {t('audio.audioFallback')}
      </audio>

      <AudioGuideView
        isPlaying={isAudioPlaying}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onStop={handleAudioReset}
        showARView={activeView === 'ar'}
      />

      {/* Middle left sidebar for theme, language switchers, and audio controls */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-3 items-center">
        {/* Theme Switcher */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-12 h-12 bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">{t('common.toggleTheme')}</span>
        </Button>

        {/* Language Switcher */}
        <div className="relative group">
          <Select
            value={locale}
            onValueChange={(v: string) => setLocale(v as any)}
          >
            <SelectTrigger className="w-12 h-12 bg-background/80 backdrop-blur-sm border border-border p-0 flex items-center justify-center mx-1 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
              <SelectValue>
                {locale === 'en' ? (
                  <span className="text-lg">🇺🇸</span>
                ) : (
                  <span className="text-lg">🇩🇪</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              side="right"
              align="center"
              className="ml-2 min-w-[120px] bg-background/90 backdrop-blur-sm border border-border rounded-md shadow-lg"
            >
              <SelectItem value="en">
                <span className="flex items-center gap-2">
                  <span>🇺🇸</span>
                  <span>English</span>
                </span>
              </SelectItem>
              <SelectItem value="de">
                <span className="flex items-center gap-2">
                  <span>🇩🇪</span>
                  <span>Deutsch</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          {/* Language indicator tooltip */}
          <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 hidden group-hover:block bg-background/90 backdrop-blur-sm border border-border rounded-md px-2 py-1 text-xs whitespace-nowrap shadow-lg">
            {t('settings.languageLabel')}
          </div>
        </div>

        {/* Audio Controls in Sidebar */}
        <div className="flex flex-col gap-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
          {!isAudioPlaying ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAudioPlay}
              className="w-10 h-10"
              title={t('audio.play')}
            >
              <Play className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAudioPause}
              className="w-10 h-10"
              title={t('audio.pause')}
            >
              <Pause className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAudioReset}
            className="w-10 h-10"
            title={t('common.reset')}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Help Button (only visible in AR view) */}
        {activeView === 'ar' && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowHelp(true)}
            className="w-12 h-12 bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
            title="AR Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Navigation activeView={activeView} onViewChange={handleViewChange} />

      {/* Help Modal */}
      {showHelp && <ARHelpModal onClose={() => setShowHelp(false)} />}
    </main>
  );
}
