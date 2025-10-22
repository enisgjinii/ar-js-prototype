'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getCurrentPositionAsync } from '@/lib/geolocation';

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
          infoBox: false,
          selectionIndicator: false,
          shadows: true,
          shouldAnimate: true,
          terrain: Cesium.Terrain.fromWorldTerrain(),
          animation: false,
          timeline: false,
        });

        viewerRef.current = viewer;

        // initial camera position
        const position = Cesium.Cartesian3.fromDegrees(6.21869444, 51.21177778, 100);

        viewer.camera.flyTo({
          destination: position,
          orientation: {
            heading: 0,
            pitch: -0.5,
            roll: 0.0
          }
        });

        // expose a helper on the ref for creating a model later from UI
        // (we'll implement the createModel function in component scope)
        // Place Ground Vehicle model at device location if possible, otherwise default
        (async () => {
          try {
            const pos = await getCurrentPositionAsync({ enableHighAccuracy: false });
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            createModel('/models/GroundVehicle.glb', lat, lon, 0);
          } catch (e) {
            // fallback to default location
            try {
              createModel('/models/GroundVehicle.glb', 51.21177778, 6.21869444, 0);
            } catch (err2) {
              console.warn('Could not place default Ground Vehicle model:', err2);
            }
          }
        })();
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

  // Create and place a 3D model into the scene (uses Duck.glb in public/models)
  const createModel = (url: string, lat?: number | null, lon?: number | null, height: number = 0) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const Cesium = (typeof window !== 'undefined' ? (window as any).Cesium : null);
    const viewer = viewerRef.current;
    if (!Cesium || !viewer) return;

    try {
      viewer.entities.removeAll();

      const useCoords = typeof lat === 'number' && typeof lon === 'number';
      const position = useCoords
        ? Cesium.Cartesian3.fromDegrees(lon as number, lat as number, height)
        : Cesium.Cartesian3.fromDegrees(6.21869444, 51.21177778, height);

      const heading = Cesium.Math.toRadians(135);
      const pitch = 0;
      const roll = 0;
      const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

      const entity = viewer.entities.add({
        name: url,
        position,
        orientation,
        model: {
          uri: url,
          minimumPixelSize: 128,
          maximumScale: 20000,
        },
      });

      // track the model with the camera
      viewer.trackedEntity = entity;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to create model:', e);
    }
  };

  // Model options for dropdown
  const modelOptions = [
    { key: 'cesium_air', label: 'Aircraft', url: '/models/Cesium_Air.glb', height: 5000.0 },
    { key: 'cesium_drone', label: 'Drone', url: '/models/CesiumDrone.glb', height: 150.0 },
    { key: 'cesium_ground', label: 'Ground Vehicle', url: '/models/GroundVehicle.glb', height: 0 },
    { key: 'cesium_balloon', label: 'Hot Air Balloon', url: '/models/CesiumBalloon.glb', height: 1000.0 },
    { key: 'cesium_man', label: 'Skinned Character', url: '/models/Cesium_Man.glb', height: 0 },
  ];

  const [selectedModelKey, setSelectedModelKey] = useState<string>('cesium_ground');

  const getModelOption = (key: string) => modelOptions.find(m => m.key === key) || modelOptions[0];

  const placeSelectedModel = async (useDeviceLocation = true) => {
    const opt = getModelOption(selectedModelKey);
    if (useDeviceLocation) {
      try {
        const pos = await getCurrentPositionAsync({ enableHighAccuracy: false });
        createModel(opt.url, pos.coords.latitude, pos.coords.longitude, opt.height);
        return;
      } catch (e) {
        // fallback to default below
      }
    }
    // fallback to default coordinates (Düsseldorf)
    createModel(opt.url, 51.21177778, 6.21869444, opt.height);
  };

  return (
    <div className="w-full h-screen">
      {/* UI: small toolbar to place the Duck model */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
        <select
          value={selectedModelKey}
          onChange={(e) => setSelectedModelKey(e.target.value)}
          className="bg-background border border-border rounded px-2 py-1 text-sm"
        >
          {modelOptions.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>

        <button
          onClick={() => placeSelectedModel(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm transition-colors"
        >
          Place
        </button>
      </div>

      <div
        ref={containerRef}
        id="cesiumContainer"
        style={{ width: '100%', height: '100%', margin: 0, padding: 0 }}
      />
    </div>
  );
}
