'use client';

import { useState, useEffect } from 'react';
import AudioGuideView from '@/components/audio-guide-view';
import ARView from '@/components/ar-view';
import Navigation from '@/components/navigation';
import LocationTest from '@/components/location-test';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Info } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useT } from '@/lib/locale';
import { Spinner } from '@/components/ui/spinner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function Home() {
  const [activeView, setActiveView] = useState<'audio' | 'ar' | 'location'>(
    'audio'
  );
  const { theme, setTheme } = useTheme();
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
      ) : activeView === 'ar' ? (
        <ARView />
      ) : (
        <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
            <LocationTest />
          </div>
        </div>
      )}

      <Navigation
        activeView={activeView === 'location' ? 'audio' : activeView}
        onViewChange={setActiveView}
      />

      {/* Top right buttons */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 items-center">
        {activeView !== 'location' && (
          <button
            onClick={() => setActiveView('location')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm transition-colors hidden sm:block"
          >
            {t('common.testLocation')}
          </button>
        )}
        {activeView === 'location' && (
          <button
            onClick={() => setActiveView('audio')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm transition-colors hidden sm:block"
          >
            {t('common.backToApp')}
          </button>
        )}

        {/* AR Info Tooltip */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 backdrop-blur-sm border border-border"
            >
              <Info className="h-4 w-4" />
              <span className="sr-only">AR Information</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Ready for AR?</h4>
              <p className="text-sm text-muted-foreground">
                Switch to AR View to see 3D models placed at real-world coordinates. 
                Make sure to allow camera and location permissions.
              </p>
            </div>
          </PopoverContent>
        </Popover>

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