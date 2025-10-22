'use client';

import React, { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Declare global property for Cesium
declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}

// Set Cesium Ion access token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZDRiNDE4NS1kYjNkLTQ4ZDEtYjg0My1kYTEyOTA2MzM2ZWUiLCJpZCI6MzUzMDA0LCJpYXQiOjE3NjExMzcyOTV9.kwXu-Zgpc_9XISKeHSK2zH5SZaXvUU33MFlhhpQyiTo';

// Configure Cesium to use the copied assets
window.CESIUM_BASE_URL = '/cesium';

interface ModelOption {
  text: string;
  onselect: () => void;
}

export default function CesiumARView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
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
      destination: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000.0),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-15.0),
        roll: 0.0,
      },
    });

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
      -123.0744619,
      44.0503706,
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

  const handleOptionSelect = (index: number) => {
    if (options[index]) {
      options[index].onselect();
    }
  };

  const handleNewButtonClick = () => {
    // Your custom button functionality here
    console.log("New button clicked!");
    alert("Custom button functionality can be implemented here");
  };

  return (
    <div className="w-full h-screen relative">
      <div 
        ref={containerRef} 
        id="cesiumContainer" 
        className="w-full h-full"
      />
      
      {/* Toolbar UI */}
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <div className="flex flex-col space-y-2">
          <select 
            onChange={(e) => handleOptionSelect(parseInt(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="" disabled>Select a model</option>
            {options.map((option, index) => (
              <option key={index} value={index}>
                {option.text}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleNewButtonClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            New Button
          </button>
        </div>
      </div>
    </div>
  );
}