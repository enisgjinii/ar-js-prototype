'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Play, Pause, Volume2, Square, Eye, Box } from 'lucide-react';
import { useT } from '@/lib/locale';
import ModelARLauncherButton from '@/components/model-ar-launcher';
import { detectPlatform, isARSupported } from '@/lib/ar-utils';
import { Badge } from '@/components/ui/badge';

interface AudioGuideViewProps {
  onPause?: () => void;
  onStop?: () => void;
  onPlay?: () => void;
  isPlaying?: boolean;
  showARView?: boolean; // Controlled by Navigation component
}

interface Model {
  id: string;
  name: string;
  description: string | null;
  file_url: string;
  usdz_url?: string | null;
  file_type: string;
  is_active: boolean;
}

export default function AudioGuideView({
  onPause,
  onStop,
  onPlay,
  isPlaying = false,
  showARView = false, // Controlled by parent (Navigation)
}: AudioGuideViewProps) {
  const t = useT();
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [platform, setPlatform] = useState<string>('detecting...');
  const [arSupported, setArSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);
    setArSupported(isARSupported());
  }, []);

  // Fetch models when AR view is opened
  useEffect(() => {
    if (showARView && models.length === 0) {
      fetchModels();
    }
  }, [showARView]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/models');
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
        if (data.models && data.models.length > 0) {
          setSelectedModel(data.models[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

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
            {showARView ? t('ar.title') : t('audio.title')}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl">
            {showARView ? t('ar.subtitle') : t('audio.subtitle')}
          </p>
        </div>

        {!showARView ? (
          // Audio Guide View
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
        ) : (
          // AR View
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="w-5 h-5 text-primary sm:w-6 sm:h-6" />
                <span className="text-lg sm:text-xl">{t('ar.title')}</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {t('ar.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                      <Box className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('ar.loadingModels')}
                    </p>
                  </div>
                </div>
              ) : models.length === 0 ? (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2 p-4">
                    <Box className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('ar.noModelsAvailable')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('ar.uploadModels')}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Model Selector */}
                  {models.length > 1 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('ar.selectModel')}:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {models.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => setSelectedModel(model)}
                            className={`p-3 rounded-lg border text-left transition-all ${selectedModel?.id === model.id
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted border-border'
                              }`}
                          >
                            <div className="font-medium text-sm truncate">
                              {model.name}
                            </div>
                            {model.description && (
                              <div className="text-xs opacity-80 truncate mt-1">
                                {model.description}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Model Display */}
                  {selectedModel && (
                    <>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                            <Box className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                          </div>
                          <p className="text-xs sm:text-sm font-medium">
                            {selectedModel.name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {selectedModel.file_type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {selectedModel.description && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base sm:text-lg">
                            {t('ar.aboutModel')}
                          </h3>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            {selectedModel.description}
                          </p>
                        </div>
                      )}

                      {/* Platform Info */}
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          {t('ar.platform')}: {platform === 'ios' ? 'iOS' : platform === 'android' ? 'Android' : 'Desktop'}
                        </p>
                        <p className="text-blue-800 dark:text-blue-200 text-xs">
                          {arSupported
                            ? platform === 'android'
                              ? t('ar.platformInfo.android')
                              : t('ar.platformInfo.ios')
                            : t('ar.platformInfo.desktop')}
                        </p>
                      </div>

                      {/* AR Launch Button */}
                      {arSupported ? (
                        <ModelARLauncherButton
                          modelUrl={selectedModel.file_url}
                          usdzUrl={selectedModel.usdz_url || undefined}
                          modelTitle={selectedModel.name}
                          className="w-full gap-2"
                        >
                          <Eye className="w-5 h-5" />
                          <span className="text-sm sm:text-base">
                            {t('ar.viewInAR')}
                          </span>
                        </ModelARLauncherButton>
                      ) : (
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">
                            📱 {t('ar.mobileRequiredDesc')}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
