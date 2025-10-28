# AR Functionality Usage Guide

## Overview

This application includes two types of AR experiences:

1. **Cesium-based AR**: A geolocation-based 3D visualization using Cesium
2. **Camera-based AR**: A marker-based AR experience using AR.js and A-Frame

## Camera-based AR (Marker Tracking)

### How It Works

The camera-based AR view uses AR.js with A-Frame to create marker-based augmented reality experiences. When you point your camera at a recognized marker (like the Hiro pattern), 3D objects will appear anchored to that marker.

### Getting Started

1. Navigate to the "Camera AR" view using the bottom navigation
2. Allow camera access when prompted by your browser
3. Point your camera at a Hiro marker pattern

### Using the Hiro Marker

- A Hiro marker image is included in the app at `/hiro-marker.png`
- You can print this marker or display it on another device
- The marker should be flat and well-lit for best tracking results

### Interacting with AR Objects

- Once the marker is recognized, 3D objects will appear
- The objects will stay anchored to the marker as you move your camera
- You can move the marker around to reposition the AR objects

## Technical Implementation

### AR.js Integration

AR.js is loaded via CDN in the root layout:

```html
<script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.min.js"></script>
```

### Component Structure

- [components/ar-camera-view.tsx](file:///Users/enisgjini/Desktop/ar-js-prototype/components/ar-camera-view.tsx): Main AR camera view component
- [components/ar-help-modal.tsx](file:///Users/enisgjini/Desktop/ar-js-prototype/components/ar-help-modal.tsx): Help modal with usage instructions

### Key Features

1. **Marker Tracking**: Uses Hiro pattern for object anchoring
2. **3D Objects**: Displays animated 3D boxes with text labels
3. **User Guidance**: Help modal with instructions and marker image
4. **Responsive Design**: Works on both mobile and desktop devices

## Troubleshooting

### Common Issues

1. **Camera Access Denied**:
   - Ensure you've granted camera permissions
   - Check browser settings for camera access
   - Try refreshing the page

2. **Marker Not Recognized**:
   - Ensure the Hiro marker is well-lit
   - Hold the marker flat and steady
   - Make sure the entire marker is visible in the camera view

3. **AR Objects Not Appearing**:
   - Check that your device supports WebGL
   - Try moving the camera closer or farther from the marker
   - Ensure you're using the Hiro marker pattern

### Browser Support

- **Recommended**: Latest versions of Chrome, Firefox, or Safari
- **Minimum**: Any browser that supports WebGL and WebRTC
- **Mobile**: Works best on iOS Safari and Android Chrome

## Customization

### Adding New Markers

To add support for additional markers:

1. Create a new marker pattern using the AR.js marker generator
2. Update the A-Frame marker entity with the new pattern

### Customizing AR Objects

To modify the AR objects:

1. Edit the A-Frame entities in [ar-camera-view.tsx](file:///Users/enisgjini/Desktop/ar-js-prototype/components/ar-camera-view.tsx)
2. You can change shapes, colors, animations, and add new 3D models

### Adding 3D Models

To add custom 3D models:

1. Place model files in the [public](file:///Users/enisgjini/Desktop/ar-js-prototype/public/test-geolocation.html) directory
2. Reference them in the A-Frame entity using the `src` attribute
3. Supported formats: glTF, glb, obj, and others supported by A-Frame
