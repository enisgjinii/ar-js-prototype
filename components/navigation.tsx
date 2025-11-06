'use client';

import { Button } from '@/components/ui/button';
import { Headphones, Camera } from 'lucide-react';
import { useT } from '@/lib/locale';

interface NavigationProps {
  activeView: 'audio' | 'ar';
  onViewChange: (view: 'audio' | 'ar') => void;
}

export default function Navigation({
  activeView,
  onViewChange,
}: NavigationProps) {
  const t = useT();

  const handleViewChange = (view: 'audio' | 'ar') => {
    // Audio will continue playing in the background
    // Users can control it through the sidebar controls
    onViewChange(view);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border sm:bottom-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:w-[calc(100%-2rem)] sm:max-w-md md:max-w-lg lg:max-w-xl sm:rounded-full sm:border">
      <div className="flex items-center justify-around p-2 sm:p-3">
        <Button
          variant={activeView === 'audio' ? 'default' : 'ghost'}
          size="lg"
          onClick={() => handleViewChange('audio')}
          className="flex-1 mx-1 gap-2 min-w-0 py-2 sm:py-3 sm:rounded-full"
        >
          <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="font-medium truncate">{t('nav.audio')}</span>
        </Button>

        <Button
          variant={activeView === 'ar' ? 'default' : 'ghost'}
          size="lg"
          onClick={() => handleViewChange('ar')}
          className="flex-1 mx-1 gap-2 min-w-0 py-2 sm:py-3 sm:rounded-full"
        >
          <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="font-medium truncate">{t('nav.ar')}</span>
        </Button>
      </div>
    </nav>
  );
}
