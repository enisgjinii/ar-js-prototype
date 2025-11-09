'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModelARLauncherButton, { ARLink } from '@/components/model-ar-launcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { detectPlatform, isARSupported, getARCapabilities } from '@/lib/ar-utils';
import { Smartphone, Info, CheckCircle, XCircle } from 'lucide-react';

export default function ARDemoPage() {
    const router = useRouter();
    const [platform, setPlatform] = useState<string>('detecting...');
    const [capabilities, setCapabilities] = useState<any>(null);

    useEffect(() => {
        const detected = detectPlatform();
        setPlatform(detected);

        getARCapabilities().then(caps => {
            setCapabilities(caps);
        });
    }, []);

    const sampleModels = [
        {
            id: 'chair',
            name: 'Modern Chair',
            glbUrl: '/models/chair.glb',
            description: 'A stylish modern chair'
        },
        {
            id: 'table',
            name: 'Coffee Table',
            glbUrl: '/models/table.glb',
            description: 'Wooden coffee table'
        },
        {
            id: 'lamp',
            name: 'Desk Lamp',
            glbUrl: '/models/lamp.glb',
            description: 'Adjustable desk lamp'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Native AR Demo</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Platform-specific AR experiences
                        </p>
                    </div>
                    <Button onClick={() => router.back()} variant="outline">
                        ← Back
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Platform Detection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5" />
                            Device Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Platform:</span>
                            <span className="text-sm bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                                {platform}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Native AR Support:</span>
                            {isARSupported() ? (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <CheckCircle className="w-4 h-4" />
                                    Supported
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                    <XCircle className="w-4 h-4" />
                                    Not Supported
                                </span>
                            )}
                        </div>

                        {capabilities && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Recommended Method:</span>
                                    <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                                        {capabilities.recommendedMethod}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">WebXR Support:</span>
                                    {capabilities.webxrSupported ? (
                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                            <CheckCircle className="w-4 h-4" />
                                            Available
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <XCircle className="w-4 h-4" />
                                            Not Available
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-900 dark:text-blue-100">
                                {platform === 'android' && (
                                    <div>
                                        <p className="font-semibold mb-1">Android AR (Scene Viewer)</p>
                                        <p>Uses Google ARCore to place 3D models in your space. Make sure you have Google Play Services for AR installed.</p>
                                    </div>
                                )}
                                {platform === 'ios' && (
                                    <div>
                                        <p className="font-semibold mb-1">iOS AR (Quick Look)</p>
                                        <p>Uses Apple ARKit to place 3D models in your space. Works on iOS 12+ with Safari browser.</p>
                                    </div>
                                )}
                                {platform === 'other' && (
                                    <div>
                                        <p className="font-semibold mb-1">Desktop Detected</p>
                                        <p>Native AR is only available on iOS and Android devices. Open this page on your phone to try AR!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sample Models */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Try AR with Sample Models</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sampleModels.map(model => (
                            <Card key={model.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{model.name}</CardTitle>
                                    <CardDescription>{model.description}</CardDescription>
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
                </div>

                {/* Usage Examples */}
                <Card>
                    <CardHeader>
                        <CardTitle>Usage Examples</CardTitle>
                        <CardDescription>Different ways to integrate AR</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Button Example */}
                        <div>
                            <h3 className="font-semibold mb-2">1. Button Component</h3>
                            <ModelARLauncherButton
                                modelUrl="/models/sample.glb"
                                modelTitle="Sample Model"
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                🚀 Launch AR
                            </ModelARLauncherButton>
                            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                                {`<ModelARLauncherButton
  modelUrl="/models/sample.glb"
  modelTitle="Sample Model"
>
  🚀 Launch AR
</ModelARLauncherButton>`}
                            </pre>
                        </div>

                        {/* Link Example */}
                        <div>
                            <h3 className="font-semibold mb-2">2. Link Component</h3>
                            <p className="text-sm mb-2">
                                Click this <ARLink modelUrl="/models/sample.glb" modelTitle="Sample">AR link</ARLink> to view in AR
                            </p>
                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                                {`<ARLink 
  modelUrl="/models/sample.glb" 
  modelTitle="Sample"
>
  AR link
</ARLink>`}
                            </pre>
                        </div>

                        {/* Full Page Example */}
                        <div>
                            <h3 className="font-semibold mb-2">3. Full Page View</h3>
                            <Button
                                onClick={() => router.push('/ar')}
                                variant="outline"
                                className="w-full"
                            >
                                Open Full AR Page →
                            </Button>
                            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                                {`<NativeARView 
  modelUrl="/models/sample.glb"
  modelTitle="Sample Model"
  onBack={() => router.back()}
/>`}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-2 text-green-600 dark:text-green-400">
                                    ✅ Android
                                </h3>
                                <ul className="text-sm space-y-1">
                                    <li>• Android 7.0 or later</li>
                                    <li>• Google Play Services for AR</li>
                                    <li>• ARCore-compatible device</li>
                                    <li>• Chrome browser</li>
                                    <li>• GLB/GLTF model format</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
                                    ✅ iOS
                                </h3>
                                <ul className="text-sm space-y-1">
                                    <li>• iOS 12 or later</li>
                                    <li>• iPhone 6s or newer</li>
                                    <li>• iPad (5th gen) or newer</li>
                                    <li>• Safari browser</li>
                                    <li>• USDZ model format</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resources */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm space-y-2">
                            <li>
                                <a
                                    href="https://developers.google.com/ar/develop/scene-viewer"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    → Google AR Scene Viewer Documentation
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://developer.apple.com/augmented-reality/quick-look/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    → iOS AR Quick Look Documentation
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://developers.google.com/ar/devices"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    → ARCore Supported Devices
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/NATIVE_AR_GUIDE.md"
                                    className="text-blue-600 hover:underline"
                                >
                                    → Complete Implementation Guide
                                </a>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
