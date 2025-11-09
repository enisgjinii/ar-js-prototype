'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModelARLauncherButton from '@/components/model-ar-launcher';
import { detectPlatform, isARSupported } from '@/lib/ar-utils';
import {
    Box,
    Smartphone,
    AlertCircle,
    Menu,
    X,
    Play,
    Pause,
    Volume2,
    VolumeX,
    SkipBack,
    SkipForward,
    Home,
    Grid3x3,
    Mic
} from 'lucide-react';
import Link from 'next/link';

interface Model {
    id: string;
    name: string;
    description: string | null;
    file_url: string;
    usdz_url?: string | null;
    file_type: string;
    is_active: boolean;
    conversion_status?: string | null;
}

interface Voice {
    id: string;
    name: string;
    description: string | null;
    file_url: string;
    is_active: boolean;
}

interface ARViewerWithAudioProps {
    models: Model[];
    voices: Voice[];
    selectedModelId?: string;
    onBack?: () => void;
}

/**
 * Enhanced AR Viewer with Audio Playback and Sidebar
 */
export default function ARViewerWithAudio({
    models,
    voices,
    selectedModelId,
    onBack
}: ARViewerWithAudioProps) {
    const [selectedModel, setSelectedModel] = useState<Model | null>(null);
    const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
    const [platform, setPlatform] = useState<string>('detecting...');
    const [arSupported, setArSupported] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Audio state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const detected = detectPlatform();
        setPlatform(detected);
        setArSupported(isARSupported());

        // Auto-select model if ID provided
        if (selectedModelId) {
            const model = models.find(m => m.id === selectedModelId);
            if (model) setSelectedModel(model);
        } else if (models.length > 0) {
            setSelectedModel(models[0]);
        }

        // Auto-select first voice
        if (voices.length > 0) {
            setSelectedVoice(voices[0]);
        }
    }, [selectedModelId, models, voices]);

    // Audio controls
    useEffect(() => {
        if (selectedVoice && audioRef.current) {
            audioRef.current.src = selectedVoice.file_url;
            audioRef.current.load();
        }
    }, [selectedVoice]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const skipVoice = (direction: 'prev' | 'next') => {
        if (!selectedVoice) return;
        const currentIndex = voices.findIndex(v => v.id === selectedVoice.id);
        let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (newIndex < 0) newIndex = voices.length - 1;
        if (newIndex >= voices.length) newIndex = 0;

        setSelectedVoice(voices[newIndex]);
        setIsPlaying(false);
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:relative lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="text-xl font-bold">AR Experience</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Navigation Links */}
                    <div className="p-4 border-b space-y-2">
                        <Link href="/">
                            <Button variant="ghost" className="w-full justify-start">
                                <Home className="w-4 h-4 mr-2" />
                                Home
                            </Button>
                        </Link>
                        <Link href="/models">
                            <Button variant="ghost" className="w-full justify-start">
                                <Grid3x3 className="w-4 h-4 mr-2" />
                                Model Gallery
                            </Button>
                        </Link>
                        <Link href="/ar-viewer">
                            <Button variant="ghost" className="w-full justify-start">
                                <Box className="w-4 h-4 mr-2" />
                                AR Viewer
                            </Button>
                        </Link>
                    </div>

                    {/* Models List */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Box className="w-4 h-4" />
                                3D Models ({models.length})
                            </h3>
                            <div className="space-y-2">
                                {models.map(model => (
                                    <button
                                        key={model.id}
                                        onClick={() => setSelectedModel(model)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${selectedModel?.id === model.id
                                                ? 'bg-blue-50 dark:bg-blue-950 border-blue-500'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="font-medium truncate text-sm">{model.name}</div>
                                        {model.description && (
                                            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                                                {model.description}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Voices List */}
                        {voices.length > 0 && (
                            <div className="p-4 border-t">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Mic className="w-4 h-4" />
                                    Audio Guides ({voices.length})
                                </h3>
                                <div className="space-y-2">
                                    {voices.map(voice => (
                                        <button
                                            key={voice.id}
                                            onClick={() => {
                                                setSelectedVoice(voice);
                                                setIsPlaying(false);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${selectedVoice?.id === voice.id
                                                    ? 'bg-purple-50 dark:bg-purple-950 border-purple-500'
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                                }`}
                                        >
                                            <div className="font-medium truncate text-sm">{voice.name}</div>
                                            {voice.description && (
                                                <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                                                    {voice.description}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <div className="bg-white dark:bg-gray-800 border-b p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden"
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold">AR Viewer with Audio</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Platform: {platform === 'ios' ? 'iOS' : platform === 'android' ? 'Android' : 'Desktop'}
                                </p>
                            </div>
                        </div>
                        {onBack && (
                            <Button onClick={onBack} variant="outline">
                                ← Back
                            </Button>
                        )}
                    </div>
                </div>

                {/* AR Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {selectedModel ? (
                        <Card className="max-w-4xl mx-auto">
                            <CardContent className="p-6">
                                {/* Model Info */}
                                <div className="mb-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <h2 className="text-2xl font-bold">{selectedModel.name}</h2>
                                        <Badge variant={selectedModel.is_active ? 'default' : 'secondary'}>
                                            {selectedModel.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    {selectedModel.description && (
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {selectedModel.description}
                                        </p>
                                    )}
                                </div>

                                {/* Platform Info */}
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                {arSupported ? 'AR Ready!' : 'Mobile Device Required'}
                                            </p>
                                            <p className="text-blue-800 dark:text-blue-200">
                                                {arSupported
                                                    ? platform === 'android'
                                                        ? 'Uses Google AR (Scene Viewer) with ARCore'
                                                        : 'Uses AR Quick Look with ARKit'
                                                    : 'Open this page on your iPhone or Android phone to view in AR'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* AR Launch Button */}
                                {arSupported ? (
                                    <ModelARLauncherButton
                                        modelUrl={selectedModel.file_url}
                                        usdzUrl={selectedModel.usdz_url || undefined}
                                        modelTitle={selectedModel.name}
                                        className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        📱 View in AR
                                    </ModelARLauncherButton>
                                ) : (
                                    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <h3 className="font-semibold mb-2">Mobile Device Required</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            To view this model in AR, open this page on your iPhone or Android phone.
                                        </p>
                                    </div>
                                )}

                                {/* Conversion Status */}
                                {selectedModel.conversion_status && selectedModel.conversion_status !== 'completed' && (
                                    <div className="mt-4 text-sm text-center">
                                        {selectedModel.conversion_status === 'converting' && (
                                            <p className="text-blue-600">🔄 Converting to USDZ for iOS...</p>
                                        )}
                                        {selectedModel.conversion_status === 'pending' && (
                                            <p className="text-gray-600">⏳ USDZ conversion pending</p>
                                        )}
                                        {selectedModel.conversion_status === 'failed' && (
                                            <p className="text-red-600">❌ USDZ conversion failed</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="max-w-4xl mx-auto">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Box className="h-16 w-16 text-gray-400 mb-4" />
                                <p className="text-gray-500">Select a model from the sidebar</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Audio Player (Fixed Bottom) */}
                {selectedVoice && (
                    <div className="bg-white dark:bg-gray-800 border-t p-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-4">
                                {/* Audio Controls */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => skipVoice('prev')}
                                        disabled={voices.length <= 1}
                                    >
                                        <SkipBack className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="icon"
                                        onClick={togglePlay}
                                        className="w-12 h-12"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-5 h-5" />
                                        ) : (
                                            <Play className="w-5 h-5" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => skipVoice('next')}
                                        disabled={voices.length <= 1}
                                    >
                                        <SkipForward className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleMute}
                                    >
                                        {isMuted ? (
                                            <VolumeX className="w-4 h-4" />
                                        ) : (
                                            <Volume2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>

                                {/* Audio Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-sm">
                                        {selectedVoice.name}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <span>{formatTime(currentTime)}</span>
                                        <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 transition-all"
                                                style={{ width: `${(currentTime / duration) * 100}%` }}
                                            />
                                        </div>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hidden Audio Element */}
                <audio ref={audioRef} />
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
