"use client";

import React, { useEffect, useRef } from 'react';
import { Viewer, Entity } from 'resium';
import { Cartesian3, Color, Math as CesiumMath } from 'cesium';

interface CesiumMapProps {
  anchors: Array<{ lat: number; lon: number; name?: string }>;
}

export default function CesiumMap({ anchors }: CesiumMapProps) {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    // Minimal styling: Cesium requires its own CSS. We assume app globals include it.
    return () => {
      // cleanup if needed
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div className="absolute left-4 top-4 z-50 w-80 h-48 rounded-lg overflow-hidden border border-white/20 shadow-lg">
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
  );
}
