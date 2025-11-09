'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Download, XCircle } from 'lucide-react';
import ARjsMarkerAR from '@/components/arjs-marker-ar';

export default function TestARjsPage() {
    const [showAR, setShowAR] = useState(false);

    const downloadMarker = () => {
        window.open('https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png', '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-start gap-4 mb-6">
                    <AlertCircle className="w-12 h-12 text-yellow-500 flex-shrink-0" />
                    <div>
                        <h1 className="text-4xl font-bold mb-2">AR.js Test</h1>
                        <p className="text-yellow-400 font-semibold">
                            ⚠️ This is for demonstration only - NOT recommended for production
                        </p>
                    </div>
                </div>

                {/* Warning Card */}
                <Card className="bg-red-900/30 border-red-700 mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-xl font-bold text-red-300 mb-2">
                                    Why AR.js is NOT Recommended
                                </h2>
                                <ul className="space-y-2 text-red-200 text-sm">
                                    <li>❌ <strong>Requires Printed Markers</strong> - Users must print and scan images</li>
                                    <li>❌ <strong>No Plane Detection</strong> - Can't place objects on floors/tables</li>
                                    <li>❌ <strong>Outdated</strong> - Last major update in 2019</li>
                                    <li>❌ <strong>Poor Performance</strong> - Laggy and unstable on most devices</li>
                                    <li>❌ <strong>Bad UX</strong> - Not a modern AR experience</li>
                                    <li>❌ <strong>Limited Support</strong> - Community mostly inactive</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* How It Works */}
                <Card className="bg-gray-800 border-gray-700 mb-6">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4">How AR.js Works (Marker-Based)</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Download & Print Marker</h3>
                                    <p className="text-sm text-gray-400">
                                        You must print the Hiro marker (a specific QR-like image)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Point Camera at Marker</h3>
                                    <p className="text-sm text-gray-400">
                                        Open AR.js and point your camera at the printed marker
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Model Appears on Marker</h3>
                                    <p className="text-sm text-gray-400">
                                        3D model appears stuck to the marker (not on real surfaces)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded">
                            <p className="text-sm text-yellow-200">
                                <strong>Problem:</strong> This is NOT real AR! The model is tied to a marker,
                                not placed on real-world surfaces like floors or tables.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Comparison */}
                <Card className="bg-gray-800 border-gray-700 mb-6">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4">AR.js vs Modern AR</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left py-2 px-3">Feature</th>
                                        <th className="text-center py-2 px-3">AR.js</th>
                                        <th className="text-center py-2 px-3">model-viewer</th>
                                        <th className="text-center py-2 px-3">Three.js WebXR</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-300">
                                    <tr className="border-b border-gray-700">
                                        <td className="py-2 px-3">Requires Markers</td>
                                        <td className="text-center text-red-400">✅ Yes</td>
                                        <td className="text-center text-green-400">❌ No</td>
                                        <td className="text-center text-green-400">❌ No</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-2 px-3">Plane Detection</td>
                                        <td className="text-center text-red-400">❌ No</td>
                                        <td className="text-center text-green-400">✅ Yes</td>
                                        <td className="text-center text-green-400">✅ Yes</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-2 px-3">Performance</td>
                                        <td className="text-center text-red-400">⭐⭐</td>
                                        <td className="text-center text-green-400">⭐⭐⭐⭐</td>
                                        <td className="text-center text-green-400">⭐⭐⭐⭐</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-2 px-3">Last Updated</td>
                                        <td className="text-center text-red-400">2019</td>
                                        <td className="text-center text-green-400">2024</td>
                                        <td className="text-center text-green-400">2024</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-2 px-3">User Experience</td>
                                        <td className="text-center text-red-400">Poor</td>
                                        <td className="text-center text-green-400">Good</td>
                                        <td className="text-center text-green-400">Excellent</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-2 px-3">Setup Difficulty</td>
                                        <td className="text-center text-yellow-400">Medium</td>
                                        <td className="text-center text-green-400">Easy</td>
                                        <td className="text-center text-yellow-400">Complex</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Download Marker */}
                <Card className="bg-blue-900/30 border-blue-700 mb-6">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4">Step 1: Get the Marker</h2>
                        <p className="text-gray-300 mb-4">
                            Before testing AR.js, you MUST download and print the Hiro marker.
                            Without it, AR.js won't work at all.
                        </p>
                        <Button
                            onClick={downloadMarker}
                            className="w-full bg-blue-600 hover:bg-blue-700 mb-3"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Hiro Marker (Print This!)
                        </Button>
                        <p className="text-xs text-gray-400">
                            Print the marker on white paper, A4 size recommended. Make sure it's clear and not blurry.
                        </p>
                    </CardContent>
                </Card>

                {/* Test Button */}
                <Button
                    onClick={() => setShowAR(true)}
                    className="w-full py-6 text-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 mb-6"
                >
                    ⚠️ Test AR.js (Marker Required!)
                </Button>

                {/* Recommendation */}
                <Card className="bg-green-900/30 border-green-700">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold text-green-300 mb-4">
                            ✅ Better Alternatives
                        </h2>
                        <div className="space-y-3 text-gray-200">
                            <div>
                                <h3 className="font-semibold mb-1">Use model-viewer instead:</h3>
                                <ul className="text-sm space-y-1 ml-4">
                                    <li>• No markers needed</li>
                                    <li>• Works on iOS + Android</li>
                                    <li>• Modern AR experience</li>
                                    <li>• Google-maintained</li>
                                    <li>• Free and easy</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Or use Three.js WebXR:</h3>
                                <ul className="text-sm space-y-1 ml-4">
                                    <li>• Full control over AR</li>
                                    <li>• Custom interactions</li>
                                    <li>• Multiple placement</li>
                                    <li>• Android Chrome</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button
                                onClick={() => window.location.href = '/test-webar'}
                                variant="outline"
                                className="flex-1"
                            >
                                Try model-viewer
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/test-threejs-ar'}
                                variant="outline"
                                className="flex-1"
                            >
                                Try Three.js
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center">
                    <p className="text-sm text-gray-400">
                        <strong>For your client:</strong> Show them this page to demonstrate why AR.js
                        is outdated and why modern solutions (model-viewer, Three.js WebXR) are better.
                    </p>
                </div>
            </div>

            {showAR && (
                <ARjsMarkerAR
                    modelUrl="/models/Cesium_Man.glb"
                    modelTitle="AR.js Demo (Marker Required)"
                    onClose={() => setShowAR(false)}
                />
            )}
        </div>
    );
}
