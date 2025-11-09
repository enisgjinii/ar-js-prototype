'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModelARLauncherButton from '@/components/model-ar-launcher';
import { detectPlatform, isARSupported } from '@/lib/ar-utils';
import { Box, Smartphone, AlertCircle, Loader2 } from 'lucide-react';

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

interface ARModelViewerProps {
    models: Model[];
    selectedModelId?: string;
    onBack?: () => void;
    showInactive?: boolean;
}

/**
 * AR Model Viewer - Displays models from Supabase and allows AR viewing
 * Similar to audio player but for 3D models
 */
export default function ARModelViewer({
    models: initialModels,
    selectedModelId,
    onBack,
    showInactive = false
}: ARModelViewerProps) {
    const [models, setModels] = useState<Model[]>(
        showInactive ? initialModels : initialModels.filter(m => m.is_active)
    );
    const [selectedModel, setSelectedModel] = useState<Model | null>(null);
    const [platform, setPlatform] = useState<string>('detecting...');
    const [arSupported, setArSupported] = useState(false);

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
    }, [selectedModelId, models]);

    if (models.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center p-6">
                <Card className="max-w-md w-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Box className="h-16 w-16 text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No Models Available</h2>
                        <p className="text-gray-500 text-center">
                            No 3D models have been uploaded yet.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">AR Model Viewer</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                View 3D models in augmented reality
                            </p>
                        </div>
                        {onBack && (
                            <Button onClick={onBack} variant="outline">
                                ← Back
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Model List Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="font-semibold mb-4 flex items-center gap-2">
                                    <Box className="w-4 h-4" />
                                    Available Models ({models.length})
                                </h2>
                                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                    {models.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => setSelectedModel(model)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${selectedModel?.id === model.id
                                                ? 'bg-blue-50 dark:bg-blue-950 border-blue-500'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <Box className="w-4 h-4 mt-1 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{model.name}</div>
                                                    {model.description && (
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                                            {model.description}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {model.file_type.toUpperCase()}
                                                        </Badge>
                                                        {!model.is_active && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Viewer */}
                    <div className="lg:col-span-2">
                        {selectedModel ? (
                            <Card>
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
                                                    Platform: {platform === 'ios' ? 'iOS' : platform === 'android' ? 'Android' : 'Desktop'}
                                                </p>
                                                {arSupported ? (
                                                    <p className="text-blue-800 dark:text-blue-200">
                                                        {platform === 'android' && 'Uses Google AR (Scene Viewer) with ARCore'}
                                                        {platform === 'ios' && 'Uses AR Quick Look with ARKit'}
                                                    </p>
                                                ) : (
                                                    <p className="text-blue-800 dark:text-blue-200">
                                                        AR is only available on iOS and Android devices. Open this page on your phone to view in AR.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AR Launch Button */}
                                    {arSupported ? (
                                        <div className="space-y-4">
                                            <ModelARLauncherButton
                                                modelUrl={selectedModel.file_url}
                                                usdzUrl={selectedModel.usdz_url || undefined}
                                                modelTitle={selectedModel.name}
                                                className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                            >
                                                📱 View in AR
                                            </ModelARLauncherButton>

                                            {/* Conversion Status */}
                                            {selectedModel.conversion_status && selectedModel.conversion_status !== 'completed' && (
                                                <div className="text-sm text-center">
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

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => window.open(selectedModel.file_url, '_blank')}
                                                    className="w-full"
                                                >
                                                    Open File
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(selectedModel.file_url);
                                                    }}
                                                    className="w-full"
                                                >
                                                    Copy URL
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <h3 className="font-semibold mb-2">Mobile Device Required</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                To view this model in AR, open this page on your iPhone or Android phone.
                                            </p>
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(selectedModel.file_url, '_blank')}
                                            >
                                                Download Model File
                                            </Button>
                                        </div>
                                    )}

                                    {/* Model Details */}
                                    <div className="mt-6 pt-6 border-t">
                                        <h3 className="font-semibold mb-3">Model Details</h3>
                                        <dl className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <dt className="text-gray-600 dark:text-gray-400">Format</dt>
                                                <dd className="font-medium">{selectedModel.file_type.toUpperCase()}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-600 dark:text-gray-400">Status</dt>
                                                <dd className="font-medium">
                                                    {selectedModel.is_active ? 'Active' : 'Inactive'}
                                                </dd>
                                            </div>
                                            <div className="col-span-2">
                                                <dt className="text-gray-600 dark:text-gray-400 mb-1">File URL</dt>
                                                <dd className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                                                    {selectedModel.file_url}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Box className="h-16 w-16 text-gray-400 mb-4" />
                                    <p className="text-gray-500">Select a model to view</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
