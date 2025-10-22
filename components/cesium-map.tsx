"use client";

import React, { useEffect, useRef, useState } from 'react';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Cesium's runtime expects a global CESIUM_BASE_URL which it uses to load
// worker scripts and static assets. We'll serve those assets from /cesium
// (copy Build output into public/cesium). We set it on window before any
// cesium modules are loaded to avoid file:// requests.
if (typeof window !== 'undefined') {
  // prefer an explicit path under public
  // note: ensure you run the copy script to populate /public/cesium
  (window as any).CESIUM_BASE_URL = '/cesium';
}

interface CesiumMapProps {
  anchors: Array<{ lat: number; lon: number; name?: string }>;
  ionAccessToken?: string;
  fullScreen?: boolean;
  onClose?: () => void;
}

export default function CesiumMap({ anchors, ionAccessToken, fullScreen = false, onClose }: CesiumMapProps) {
  const viewerRef = useRef<any>(null);
  const [resiumLoaded, setResiumLoaded] = useState(false);
  const [resiumModule, setResiumModule] = useState<any>(null);
  const [cesiumModule, setCesiumModule] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    // Dynamically import Cesium and Resium on the client to avoid SSR issues
    // and ensure CESIUM_BASE_URL is set first.
    Promise.all([import('cesium'), import('resium')])
      .then(([cesium, resium]) => {
        if (!mounted) return;
        setCesiumModule(cesium);
        setResiumModule(resium);
        setResiumLoaded(true);

        if (ionAccessToken) {
          try {
            cesium.Ion.defaultAccessToken = ionAccessToken;
          } catch (e) {
            // ignore
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load Cesium/Resium dynamically:', err);
      });

    return () => {
      mounted = false;
    };
  }, [ionAccessToken]);

  useEffect(() => {
    if (!resiumLoaded || !cesiumModule) return;

    const { Cartesian3 } = cesiumModule;

    // Fly to first anchor when available
    if (viewerRef.current && anchors && anchors.length > 0) {
      const first = anchors[0];
      try {
        const cesiumViewer = viewerRef.current.cesiumElement;
        cesiumViewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(first.lon, first.lat, 1500),
          duration: 1.2,
        });
      } catch (e) {
        // ignore
      }
    }

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [resiumLoaded, cesiumModule, anchors]);

  if (!resiumLoaded || !resiumModule || !cesiumModule) {
    return (
      <div className={fullScreen ? 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center' : 'absolute left-4 top-4 z-50 w-80 h-48 rounded-lg overflow-hidden border border-white/20 shadow-lg flex items-center justify-center'}>
        <div className="text-white">Loading map…</div>
      </div>
    );
  }

  const { Viewer, Entity } = resiumModule;
  const { Cartesian3, Color } = cesiumModule;

  return (
    <div className={fullScreen ? 'fixed inset-0 z-50 bg-black/80' : 'absolute left-4 top-4 z-50 w-80 h-48 rounded-lg overflow-hidden border border-white/20 shadow-lg'}>
      {fullScreen && (
        <div className="absolute right-4 top-4 z-60">
          <button
            onClick={() => onClose && onClose()}
            className="bg-white/10 text-white px-3 py-1 rounded-md backdrop-blur"
          >
            Close
          </button>
        </div>
      )}
      <div className={fullScreen ? 'w-full h-full' : 'w-full h-full'}>
        <Viewer full ref={viewerRef} homeButton={false} timeline={false} animation={false} baseLayerPicker={false} infoBox={false} geocoder={false}>
          {anchors.map((a, i) => (
            <Entity
              key={i}
              name={a.name ?? `anchor-${i}`}
              position={Cartesian3.fromDegrees(a.lon, a.lat)}
              point={{ pixelSize: 10, color: Color.YELLOW }}
            />
          ))}
        </Viewer>
      </div>
    </div>
  );
}
