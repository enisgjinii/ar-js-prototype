'use client';

import React from 'react';
import ModelARLauncherButton from '@/components/model-ar-launcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface ARModel {
    id: string;
    name: string;
    description: string;
    glbUrl: string;
    usdzUrl?: string;
    thumbnail?: string;
    category?: string;
}

interface ARModelGalleryProps {
    models: ARModel[];
    columns?: 1 | 2 | 3 | 4;
    showCategory?: boolean;
}

/**
 * Gallery component to display multiple AR models
 * Perfect for product catalogs, model libraries, etc.
 */
export default function ARModelGallery({
    models,
    columns = 3,
    showCategory = false
}: ARModelGalleryProps) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-2 lg:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-4'
    };

    return (
        <div className={`grid gap-4 ${gridCols[columns]}`}>
            {models.map(model => (
                <Card key={model.id} className="overflow-hidden">
                    {/* Thumbnail */}
                    {model.thumbnail && (
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                            <img
                                src={model.thumbnail}
                                alt={model.name}
                                className="w-full h-full object-cover"
                            />
                            {showCategory && model.category && (
                                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {model.category}
                                </div>
                            )}
                        </div>
                    )}

                    <CardHeader>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        {model.description && (
                            <CardDescription>{model.description}</CardDescription>
                        )}
                    </CardHeader>

                    <CardContent>
                        <ModelARLauncherButton
                            modelUrl={model.glbUrl}
                            modelTitle={model.name}
                            className="w-full"
                        >
                            📱 View in AR
                        </ModelARLauncherButton>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

/**
 * Compact list view for AR models
 */
export function ARModelList({ models }: { models: ARModel[] }) {
    return (
        <div className="space-y-2">
            {models.map(model => (
                <div
                    key={model.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border"
                >
                    <div className="flex items-center gap-3">
                        {model.thumbnail && (
                            <img
                                src={model.thumbnail}
                                alt={model.name}
                                className="w-12 h-12 rounded object-cover"
                            />
                        )}
                        <div>
                            <h3 className="font-semibold">{model.name}</h3>
                            {model.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {model.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <ModelARLauncherButton
                        modelUrl={model.glbUrl}
                        modelTitle={model.name}
                        className="flex-shrink-0"
                    >
                        View in AR
                    </ModelARLauncherButton>
                </div>
            ))}
        </div>
    );
}
