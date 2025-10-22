'use client';

import { Button } from '@/components/ui/button';
import { Headphones, Globe } from 'lucide-react';
import { useT } from '@/lib/locale';

interface NavigationProps {
  activeView: 'audio' | 'cesium';
  onViewChange: (view: 'audio' | 'cesium') => void;
}

export default function Navigation({
  activeView,
  onViewChange,
}: NavigationProps) {
  const t = useT();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border sm:bottom-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:w-[calc(100%-2rem)] sm:max-w-md md:max-w-lg lg:max-w-xl sm:rounded-full sm:border">
      <div className="flex items-center justify-around p-2 sm:p-3">
        <Button
          variant={activeView === 'audio' ? 'default' : 'ghost'}
          size="lg"
          onClick={() => onViewChange('audio')}
          className="flex-1 mx-1 gap-2 min-w-0 py-2 sm:py-3 sm:rounded-full"
        >
          <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="font-medium truncate">{t('nav.audio')}</span>
        </Button>

        <Button
          variant={activeView === 'cesium' ? 'default' : 'ghost'}
          size="lg"
          onClick={() => onViewChange('cesium')}
          className="flex-1 mx-1 gap-2 min-w-0 py-2 sm:py-3 sm:rounded-full"
        >
          <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="font-medium truncate">Cesium</span>
        </Button>
      </div>
    </nav>
  );
}