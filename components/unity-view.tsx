"use client";

import React from 'react';
import { useUnityContext, Unity } from 'react-unity-webgl';

interface UnityViewProps {
  onBack?: () => void;
}

// Loads a Unity WebGL build placed under public/unity-build/
// Expected files (from Unity WebGL build):
// - /unity-build/Build/Build.loader.js
// - /unity-build/Build/Build.data
// - /unity-build/Build/Build.framework.js
// - /unity-build/Build/Build.wasm
export default function UnityView({ onBack }: UnityViewProps) {
  const { unityProvider, loadingProgression, isLoaded, requestFullscreen } = useUnityContext({
    loaderUrl: '/unity-build/Build/Build.loader.js',
    dataUrl: '/unity-build/Build/Build.data',
    frameworkUrl: '/unity-build/Build/Build.framework.js',
    codeUrl: '/unity-build/Build/Build.wasm'
  });

  return (
    <div className="w-full h-screen relative bg-black">
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={onBack}
          className="bg-black/50 text-white border-white/20 px-3 py-1 rounded-md"
        >
          ← Back
        </button>
      </div>

      <div className="w-full h-full flex items-center justify-center">
        {!isLoaded && (
          <div className="text-white text-center">
            <p className="mb-2">Loading Unity content... {(loadingProgression * 100).toFixed(0)}%</p>
            <div className="w-48 h-2 bg-white/10 rounded overflow-hidden mx-auto">
              <div className="h-full bg-white" style={{ width: `${loadingProgression * 100}%` }} />
            </div>
          </div>
        )}

        <div className="w-full h-full">
          <Unity unityProvider={unityProvider} />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-20">
        <button
          onClick={() => requestFullscreen(true)}
          className="bg-white text-black px-3 py-1 rounded-md"
        >
          Fullscreen
        </button>
      </div>
    </div>
  );
}
