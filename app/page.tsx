'use client';

import { useState, useEffect } from 'react';
import AudioGuideView from '@/components/audio-guide-view';
import CesiumARView from '@/components/cesium-ar-view';
import Navigation from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
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

export default function Home() {
  const [activeView, setActiveView] = useState<'audio' | 'cesium'>('audio');
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const t = useT();

  if (!mounted) {
    return (
      <main className="relative w-full h-screen overflow-hidden bg-background">
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="h-5 w-5 animate-spin text-primary" />
            <span>{t('common.loading')}</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-background">
      {activeView === 'audio' ? (
        <AudioGuideView />
      ) : (
        <CesiumARView />
      )}

      <Navigation
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Top right buttons */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 items-center">
        {/* Language Switcher with Flags */}
        <Select value={locale} onValueChange={(v: string) => setLocale(v as any)}>
          <SelectTrigger className="w-12 bg-background/80 backdrop-blur-sm border border-border p-0 flex items-center justify-center mx-1">
            <SelectValue>
              {locale === 'en' ? (
                <span className="text-lg">🇺🇸</span>
              ) : (
                <span className="text-lg">🇩🇪</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
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

        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="bg-background/80 backdrop-blur-sm border border-border"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">{t('common.toggleTheme')}</span>
        </Button>
      </div>
    </main>
  );
}