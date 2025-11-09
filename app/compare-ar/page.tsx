'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ModelViewerWebAR from '@/components/model-viewer-webar';
import ThreeJSWebXRAR from '@/components/threejs-webxr-ar';
import ARjsMarkerAR from '@/components/arjs-marker-ar';

type ARType = 'none' | 'model-viewer' | 'threejs' | 'arjs';

export default function CompareARPage() {
    const [activeAR, setActiveAR] = useState<ARType>('none');

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">WebAR Solutions Comparison</h1>
                <p className="text-gray-400 mb-8">
                    Compare model-viewer vs Three.js WebXR implementations
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* model-viewer Card */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">model-viewer</h2>
                                    <p className="text-sm text-gray-400">Google's Solution</p>
                                </div>
                                <div className="text-3xl">📦</div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div>
                                    <h3 className="font-semibold text-green-400 mb-2">✅ Pros:</h3>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                        <li>• Easy to implement</li>
                                        <li>• Auto-handles all platforms</li>
                                        <li>• iOS fallback (AR Quick Look)</li>
                                        <li>• Android fallback (Scene Viewer)</li>
                                        <li>• Google-maintained</li>
                                        <li>• Smaller bundle size</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Cons:</h3>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                        <li>• Less control over AR</li>
                                        <li>• Limited customization</li>
                                        <li>• Black box implementation</li>
                                    </ul>
                                </div>

                                <div className="pt-3 border-t border-gray-700">
                                    <p className="text-xs text-gray-400">
                                        <strong>Best for:</strong> Quick implementation, maximum compatibility,
                                        when you need iOS support
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setActiveAR('model-viewer')}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                Test model-viewer
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Three.js Card */}
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Three.js WebXR</h2>
                                    <p className="text-sm text-gray-400">Custom Implementation</p>
                                </div>
                                <div className="text-3xl">🎮</div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div>
                                    <h3 className="font-semibold text-green-400 mb-2">✅ Pros:</h3>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                        <li>• Full control over AR</li>
                                        <li>• Custom interactions</li>
                                        <li>• Multiple model placement</li>
                                        <li>• Advanced Three.js features</li>
                                        <li>• Hit testing & reticle</li>
                                        <li>• No external dependencies</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Cons:</h3>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                        <li>• Android Chrome only</li>
                                        <li>• No iOS support</li>
                                        <li>• More complex code</li>
                                        <li>• Manual fallbacks needed</li>
                                    </ul>
                                </div>

                                <div className="pt-3 border-t border-gray-700">
                                    <p className="text-xs text-gray-400">
                                        <strong>Best for:</strong> Android-only apps, custom AR experiences,
                                        when you need full control
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setActiveAR('threejs')}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                                Test Three.js WebXR
                            </Button>
                        </CardContent>
                    </Card>

                    {/* AR.js Card */}
                    <Card className="bg-gray-800 border-red-700">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">AR.js</h2>
                                    <p className="text-sm text-red-400">⚠️ Not Recommended</p>
                                </div>
                                <div className="text-3xl">⚠️</div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div>
                                    <h3 className="font-semibold text-red-400 mb-2">❌ Cons:</h3>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                        <li>• Requires printed markers</li>
                                        <li>• No plane detection</li>
                                        <li>• Outdated (2019)</li>
                                        <li>• Poor performance</li>
                                        <li>• Bad user experience</li>
                                        <li>• Limited support</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Only Good For:</h3>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                        <li>• Museum exhibits with markers</li>
                                        <li>• Educational posters</li>
                                        <li>• Print advertising</li>
                                    </ul>
                                </div>

                                <div className="pt-3 border-t border-gray-700">
                                    <p className="text-xs text-red-300">
                                        <strong>Avoid for:</strong> Modern AR experiences, product visualization,
                                        e-commerce, anything requiring real surface placement
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setActiveAR('arjs')}
                                className="w-full bg-red-600 hover:bg-red-700"
                            >
                                Test AR.js (Demo Only)
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Comparison Table */}
                <Card className="bg-gray-800 border-gray-700 mb-8">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4">Feature Comparison</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left py-3 px-4">Feature</th>
                                        <th className="text-center py-3 px-4">model-viewer</th>
                                        <th className="text-center py-3 px-4">Three.js WebXR</th>
                                        <th className="text-center py-3 px-4">AR.js</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-300">
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">Requires Markers</td>
                                        <td className="text-center">❌</td>
                                        <td className="text-center">❌</td>
                                        <td className="text-center text-red-400">✅</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">Android WebXR</td>
                                        <td className="text-center">✅</td>
                                        <td className="text-center">✅</td>
                                        <td className="text-center">❌</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">iOS Support</td>
                                        <td className="text-center">✅ (Quick Look)</td>
                                        <td className="text-center">❌</td>
                                        <td className="text-center">⚠️ (Limited)</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">Plane Detection</td>
                                        <td className="text-center">✅</td>
                                        <td className="text-center">✅</td>
                                        <td className="text-center text-red-400">❌</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">Scene Viewer Fallback</td>
                                        <td className="text-center">✅</td>
                                        <td className="text-center">❌</td>
                                        <td className="text-center">❌</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">Hit Testing</td>
                                        <td className="text-center">✅ (Auto)</td>
                                        <td className="text-center">✅ (Manual)</td>
                                        <td className="text-center text-red-400">❌</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">Multiple Placement</td>
                                        <td className="text-center">❌</td>
                                        <td className="text-center">✅</td>
                                        <td className="text-center">⚠️</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">Custom Interactions</td>
                                        <td className="text-center">⚠️ Limited</td>
                                        <td className="text-center">✅ Full</td>
                                        <td className="text-center">⚠️ Limited</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">Performance</td>
                                        <td className="text-center">⭐⭐⭐⭐</td>
                                        <td className="text-center">⭐⭐⭐⭐</td>
                                        <td className="text-center text-red-400">⭐⭐</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">Implementation Difficulty</td>
                                        <td className="text-center">⭐ Easy</td>
                                        <td className="text-center">⭐⭐⭐ Complex</td>
                                        <td className="text-center">⭐⭐ Medium</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">Last Updated</td>
                                        <td className="text-center">2024</td>
                                        <td className="text-center">2024</td>
                                        <td className="text-center text-red-400">2019</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">Bundle Size</td>
                                        <td className="text-center">~200KB</td>
                                        <td className="text-center">~600KB</td>
                                        <td className="text-center">~300KB</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3 px-4">Maintenance</td>
                                        <td className="text-center">Google</td>
                                        <td className="text-center">You</td>
                                        <td className="text-center text-red-400">Inactive</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Recommendation */}
                <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4">💡 Recommendation</h2>
                        <div className="space-y-4 text-gray-200">
                            <div>
                                <h3 className="font-semibold mb-2">Use model-viewer if:</h3>
                                <ul className="text-sm space-y-1 ml-4">
                                    <li>• You need iOS support</li>
                                    <li>• You want quick implementation</li>
                                    <li>• You need automatic fallbacks</li>
                                    <li>• You want Google to handle updates</li>
                                    <li>• <strong>Recommended for most projects</strong></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Use Three.js WebXR if:</h3>
                                <ul className="text-sm space-y-1 ml-4">
                                    <li>• Android-only app</li>
                                    <li>• You need custom AR interactions</li>
                                    <li>• You want multiple model placement</li>
                                    <li>• You need full control over the experience</li>
                                    <li>• You have development resources</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AR Viewers */}
            {activeAR === 'model-viewer' && (
                <ModelViewerWebAR
                    modelUrl="/models/Cesium_Man.glb"
                    modelTitle="model-viewer Test"
                    onClose={() => setActiveAR('none')}
                />
            )}

            {activeAR === 'threejs' && (
                <ThreeJSWebXRAR
                    modelUrl="/models/Cesium_Man.glb"
                    modelTitle="Three.js WebXR Test"
                    onClose={() => setActiveAR('none')}
                />
            )}

            {activeAR === 'arjs' && (
                <ARjsMarkerAR
                    modelUrl="/models/Cesium_Man.glb"
                    modelTitle="AR.js Test (Marker Required)"
                    onClose={() => setActiveAR('none')}
                />
            )}
        </div>
    );
}
