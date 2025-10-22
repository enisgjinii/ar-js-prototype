# Cesium AR Implementation

## Overview
This document describes the implementation of the Cesium-based AR view component for the AR.js prototype project. The implementation follows the exact structure and functionality requested, providing a 3D globe-based AR experience with model placement capabilities.

## Component Structure

### File: [/components/cesium-ar-view.tsx](file:///Users/enisgjini/Desktop/ar-js-prototype/components/cesium-ar-view.tsx)

The component implements:

1. **Cesium Viewer Initialization**
   - Configured with infoBox, selectionIndicator disabled
   - Shadows and animation enabled
   - Proper cleanup on component unmount

2. **Model Creation Function**
   - `createModel(url, height)` function that:
     - Removes all existing entities
     - Creates a model at specified coordinates
     - Sets proper orientation using HeadingPitchRoll
     - Tracks the entity with the camera

3. **Model Options**
   - Aircraft (5000m altitude)
   - Drone (150m altitude)
   - Ground Vehicle (0m altitude)
   - Hot Air Balloon (1000m altitude)
   - Skinned Character (0m altitude)

4. **UI Controls**
   - Dropdown menu for model selection
   - Custom "New Button" for additional functionality
   - Responsive design with backdrop blur effect

## Key Features

### 1. Cesium Integration
- Uses the official Cesium library for 3D globe visualization
- Properly configured Ion access token for accessing Cesium services
- Correct CSS import for Cesium widgets
- Proper asset configuration to avoid 404 errors

### 2. Model Placement
- Models placed at fixed coordinates (-123.0744619, 44.0503706)
- Proper orientation using HeadingPitchRoll
- Configurable altitude for different model types
- Entity tracking for automatic camera following

### 3. UI Components
- Clean, modern interface with backdrop blur effect
- Responsive design that works on mobile and desktop
- Intuitive model selection dropdown
- Custom button for additional functionality

### 4. Performance Considerations
- Proper cleanup of Cesium viewer on component unmount
- Efficient entity management (removing all before adding new)
- Optimized rendering settings

## Asset Management

### Cesium Asset Copying
To ensure Cesium can load all required assets (images, workers, JSON files), we've implemented a script that copies the necessary files from the Cesium package to the public directory:

1. **Script**: [/scripts/copy-cesium-assets.js](file:///Users/enisgjini/Desktop/ar-js-prototype/scripts/copy-cesium-assets.js)
2. **Destination**: [/public/cesium](file:///Users/enisgjini/Desktop/ar-js-prototype/public/cesium/)
3. **Integration**: The script is automatically run during `pnpm dev` and `pnpm build`

### Asset Configuration
The Cesium component is configured to use the copied assets:
```typescript
window.CESIUM_BASE_URL = '/cesium';
```

This ensures that all Cesium assets are loaded from the correct path, avoiding the 404 errors that were previously occurring.

## Usage

To use the Cesium AR view:

1. Navigate to the "Cesium" tab in the application
2. Select a model from the dropdown menu
3. The model will appear on the globe and the camera will track it
4. Use the "New Button" for additional functionality (currently shows an alert)

## Customization

### Adding New Models
To add new models, simply extend the `options` array:

```typescript
const options: ModelOption[] = [
  // Existing options...
  {
    text: "New Model",
    onselect: function () {
      createModel("/path/to/model.glb", altitude);
    },
  },
];
```

### Customizing the "New Button"
Modify the `handleNewButtonClick` function to implement custom functionality:

```typescript
const handleNewButtonClick = () => {
  // Your custom functionality here
  console.log("New button clicked!");
};
```

## Technical Details

### Coordinate System
- Models are placed using geographic coordinates (longitude, latitude, altitude)
- Default position: -123.0744619, 44.0503706 (Oregon, USA)
- Altitude specified in meters

### Model Configuration
- `minimumPixelSize`: 128 pixels (ensures visibility at all zoom levels)
- `maximumScale`: 20000 (prevents models from becoming too large)
- Orientation set to 135 degrees heading, 0 pitch and roll

### Camera Settings
- Initial camera position set to view the model location
- Camera automatically tracks selected entities
- Smooth fly-to animation for initial positioning

## Dependencies

The implementation relies on the following Cesium features:
- `Cesium.Viewer` for the main 3D globe
- `Cesium.Cartesian3.fromDegrees` for coordinate conversion
- `Cesium.HeadingPitchRoll` for model orientation
- `Cesium.Transforms.headingPitchRollQuaternion` for quaternion calculation
- `Cesium.Entity` for model representation

## Troubleshooting

### Common Issues
1. **Models not appearing**: Check that model paths are correct and files exist in the public directory
2. **Performance issues**: Reduce the number of entities or simplify models
3. **Camera tracking problems**: Ensure entities are properly added to the viewer
4. **404 errors for Cesium assets**: Ensure the copy-cesium-assets script has been run

### Debugging Tips
- Use browser developer tools to check for JavaScript errors
- Verify Cesium Ion access token is valid
- Check network tab for failed model loading requests
- Ensure CESIUM_BASE_URL is correctly set