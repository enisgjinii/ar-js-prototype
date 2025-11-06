"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

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

      <iframe
        src="/ar-location.html"
        title="AR Location"
        className="w-full h-full border-0"
        style={{ display: 'block' }}
        allow="camera; geolocation; accelerometer; fullscreen"
      />
    </div>
  );
}
