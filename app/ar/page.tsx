"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import AFrameARView from '@/components/aframe-ar-view';
import ThreeJSARView from '@/components/threejs-ar-view';
import { useEffect, useState } from 'react';

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

      {/* Choose Three.js WebXR when available, otherwise fallback to A-Frame AR.js */}
      <ClientARRouter onBack={() => router.back()} />
    </div>
  );
}

function ClientARRouter({ onBack }: { onBack: () => void }) {
  const [webxrAvailable, setWebxrAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if ((navigator as any).xr && (navigator as any).xr.isSessionSupported) {
          const supported = await (navigator as any).xr.isSessionSupported('immersive-ar');
          if (mounted) setWebxrAvailable(!!supported);
          return;
        }
      } catch (e) {
        // ignore
      }
      if (mounted) setWebxrAvailable(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (webxrAvailable === null) {
    // still checking -> show loader
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-white">Checking AR support…</p>
      </div>
    );
  }

  return webxrAvailable ? (
    <ThreeJSARView onBack={onBack} />
  ) : (
    <AFrameARView onBack={onBack} />
  );
}
