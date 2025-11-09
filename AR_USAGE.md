# AR Functionality (Updated)

This project no longer includes AR.js or A-Frame. The marker-based camera AR implementation that previously used AR.js/A-Frame has been removed and replaced with BabylonJS-based WebXR components.

What changed

- Marker-based AR (AR.js + A-Frame) was removed.
- BabylonJS is used for client-side WebXR experiences. See `components/ar-camera-view.tsx` for the Babylon scaffold and runtime.

How to test Babylon WebXR locally

1. Use a WebXR-capable browser (Chrome on Android or a WebXR-enabled desktop build).
2. Open the AR page in a secure context (https or localhost) and allow camera permissions.
3. If your device supports immersive AR, the Babylon component will request an `immersive-ar` session.

Notes

- If you relied on marker-based workflows, consider using Babylon's image tracking / WebXR native features or an external marker-tracking library compatible with Babylon.
- All A-Frame/AR.js static assets and scripts have been removed from the repository.

For developer details, open `components/ar-camera-view.tsx` and `components/cesium-ar-view.tsx` (for Cesium + geolocation scenarios).

### Using the Hiro Marker
