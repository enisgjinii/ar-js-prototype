"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import AFrameARView from '@/components/aframe-ar-view';

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

    {/* Render the A-Frame + AR.js AR view (tap to place cubes) */}
    <AFrameARView onBack={() => router.back()} />
    </div>
  );
}
