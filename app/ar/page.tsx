"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ARCameraView from '@/components/ar-camera-view';

export default function ARPage() {
  const router = useRouter();

  return (
    <div className="w-full h-screen relative bg-black">
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => router.back()}
          className="bg-black/50 text-white border-white/20 px-3 py-1 rounded-md"
        >
          ← Back
        </button>
      </div>

      {/* Render the in-repo Babylon.js WebXR AR camera view which includes
          markerless placement (hit-test, reticle, anchors) and tap-to-place behavior */}
      <ARCameraView onBack={() => router.back()} />
    </div>
  );
}
