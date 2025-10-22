'use client';

import { useState, useEffect } from 'react';
import AudioGuideView from '@/components/audio-guide-view';
import CesiumARView from '@/components/cesium-ar-view';
import Navigation from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Languages } from 'lucide-react';
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
            <span>{t('common.loading') || 'Loading...'}</span>
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

      {/* Middle left sidebar for theme and language switchers */}
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
          <Select value={locale} onValueChange={(v: string) => setLocale(v as any)}>
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
      </div>

      <Navigation
        activeView={activeView}
        onViewChange={setActiveView}
      />
    </main>
  );
}
