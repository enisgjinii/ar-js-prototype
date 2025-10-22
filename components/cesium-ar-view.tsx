'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Declare global property for Cesium
declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}

// Set Cesium Ion access token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZDRiNDE4NS1kYjNkLTQ4ZDEtYjg0My1kYTEyOTA2MzM2ZWUiLCJpZCI6MzUzMDA0LCJpYXQiOjE3NjExMzcyOTV9.kwXu-Zgpc_9XISKeHSK2zH5SZaXvUU33MFlhhpQyiTo';

interface ModelOption {
  text: string;
  onselect: () => void;
}

export default function CesiumARView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("2"); // Set default to Ground Vehicle (index 2)

  useEffect(() => {
    // Configure Cesium to use the copied assets - only in browser environment
    if (typeof window !== 'undefined') {
      window.CESIUM_BASE_URL = '/cesium';
    }

    if (!containerRef.current) return;

    // Initialize Cesium Viewer
    const viewer = new Cesium.Viewer('cesiumContainer', {
      infoBox: false,
      selectionIndicator: false,
      shadows: true,
      shouldAnimate: true,
    });

    viewerRef.current = viewer;

    // Set initial camera position
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(6.2186944, 51.2117778, 5000.0),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-15.0),
        roll: 0.0,
      },
    });

    // Load the default model (Ground Vehicle) when component mounts
    setTimeout(() => {
      options[2].onselect();
    }, 100);

    // Cleanup function
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  function createModel(url: string, height: number) {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.entities.removeAll();

    const position = Cesium.Cartesian3.fromDegrees(
      6.2186944,
      51.2117778,
      height,
    );
    const heading = Cesium.Math.toRadians(135);
    const pitch = 0;
    const roll = 0;
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(
      position,
      hpr,
    );

    const entity = viewer.entities.add({
      name: url,
      position: position,
      orientation: orientation,
      model: {
        uri: url,
        minimumPixelSize: 128,
        maximumScale: 20000,
      },
    });
    viewer.trackedEntity = entity;
  }

  const options: ModelOption[] = [
    {
      text: "Aircraft",
      onselect: function () {
        createModel("/models/Cesium_Air.glb", 5000.0);
      },
    },
    {
      text: "Drone",
      onselect: function () {
        createModel("/models/CesiumDrone.glb", 150.0);
      },
    },
    {
      text: "Ground Vehicle",
      onselect: function () {
        createModel("/models/GroundVehicle.glb", 0);
      },
    },
    {
      text: "Hot Air Balloon",
      onselect: function () {
        createModel("/models/CesiumBalloon.glb", 1000.0);
      },
    },
    {
      text: "Skinned Character",
      onselect: function () {
        createModel("/models/Cesium_Man.glb", 0);
      },
    },
  ];

  const handleOptionSelect = (value: string) => {
    const index = parseInt(value);
    if (options[index]) {
      options[index].onselect();
      setSelectedModel(value);
    }
  };

  return (
    <div className="w-full h-screen relative">
      <div 
        ref={containerRef} 
        id="cesiumContainer" 
        className="w-full h-full"
      />
      
      {/* Toolbar UI */}
      <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <div className="flex flex-col space-y-2">
          <Select value={selectedModel} onValueChange={handleOptionSelect}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {option.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}