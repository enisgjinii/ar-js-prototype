'use client';

import React, { useEffect, useRef } from 'react';

export default function BabylonARView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const linkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    // Guard: only run in the browser
    if (typeof window === 'undefined') return;

    const CESIUM_JS = 'https://cesium.com/downloads/cesiumjs/releases/1.116/Build/Cesium/Cesium.js';
    const CESIUM_CSS = 'https://cesium.com/downloads/cesiumjs/releases/1.116/Build/Cesium/Widgets/widgets.css';

    // inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CESIUM_CSS;
    document.head.appendChild(link);
    linkRef.current = link;

    // inject script
    const script = document.createElement('script');
    script.src = CESIUM_JS;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const Cesium = (window as any).Cesium;
        if (!Cesium) {
          console.error('Cesium failed to load');
          return;
        }

        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZDRiNDE4NS1kYjNkLTQ4ZDEtYjg0My1kYTEyOTA2MzM2ZWUiLCJpZCI6MzUzMDA0LCJpYXQiOjE3NjExMzcyOTV9.kwXu-Zgpc_9XISKeHSK2zH5SZaXvUU33MFlhhpQyiTo';

        if (!containerRef.current) return;

        const viewer = new Cesium.Viewer(containerRef.current, {
          terrain: Cesium.Terrain.fromWorldTerrain(),
          // optionally hide timeline/navigation if needed
          animation: false,
          timeline: false
        });

        viewerRef.current = viewer;

        const position = Cesium.Cartesian3.fromDegrees(6.21869444, 51.21177778, 100);

        viewer.camera.flyTo({
          destination: position,
          orientation: {
            heading: 0,
            pitch: -0.5,
            roll: 0.0
          }
        });

        viewer.entities.add({
          position,
          point: { pixelSize: 10, color: Cesium.Color.RED }
        });
      } catch (err) {
        // swallow errors but log
        // eslint-disable-next-line no-console
        console.error('Error initializing Cesium:', err);
      }
    };

    script.onerror = (e) => {
      console.error('Failed to load Cesium script', e);
    };

    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      // cleanup viewer
      try {
        if (viewerRef.current) {
          viewerRef.current.destroy();
          viewerRef.current = null;
        }
      } catch (e) {
        // ignore
      }

      // remove injected script and link
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      if (linkRef.current && linkRef.current.parentNode) {
        linkRef.current.parentNode.removeChild(linkRef.current);
        linkRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-screen">
      <div
        ref={containerRef}
        id="cesiumContainer"
        style={{ width: '100%', height: '100%', margin: 0, padding: 0 }}
      />
    </div>
  );
}
