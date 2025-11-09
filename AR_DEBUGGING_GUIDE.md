# AR Debugging Guide

## What to Expect

When you open the AR view, you should see:

1. **"Enter AR" button** - Click this to start
2. **Camera feed** - Your device's camera view
3. **Red test sphere** - Should appear 1 meter in front of you (proves 3D rendering works)
4. **Green reticle (torus/ring)** - Appears when surfaces are detected
5. **Tap to place** - Tap screen to place colorful bouncing spheres

## Troubleshooting Steps

### 1. Check Browser Console

Open Chrome DevTools (chrome://inspect on Android) and look for:

- `Hit test feature enabled:` - Should show an object
- `Hit test results: X` - Should show numbers > 0 when you move device
- `Reticle positioned at:` - Should update as you move
- `✅ Plane detected!` - When surfaces are found
- `Tap detected` - When you tap screen
- `Sphere placed at:` - When object is placed

### 2. Device Requirements

- **Android device** with ARCore support
- **Chrome browser** (version 79+)
- **Camera permissions** granted
- **Motion sensors** enabled

### 3. Common Issues

#### "Only camera, nothing else"

**Cause**: Hit-test feature not working
**Solution**:

- Move device slowly around the room
- Point at flat surfaces (floor, table, wall)
- Ensure good lighting
- Check console for `Hit test results: 0` (means no surfaces detected)

#### "Can't see the red test sphere"

**Cause**: 3D rendering not working
**Solution**:

- Check if AR session actually started
- Look for errors in console
- Try reloading the page

#### "Reticle not appearing"

**Cause**: Surface detection not working
**Solution**:

- Move device more
- Point at textured surfaces (not blank walls)
- Ensure room has good lighting
- Wait 5-10 seconds for initialization

#### "Tap does nothing"

**Cause**: No hit pose available
**Solution**:

- Wait for green reticle to appear first
- Tap directly on screen (not buttons)
- Check console for "No hit pose available"

### 4. Testing Checklist

1. ✅ Open AR view
2. ✅ Click "Enter AR"
3. ✅ Grant camera permission
4. ✅ See camera feed
5. ✅ See red test sphere floating
6. ✅ Move device around slowly
7. ✅ See "Scanning..." indicator turn to "Surfaces Detected"
8. ✅ See green ring/reticle on surfaces
9. ✅ Tap screen
10. ✅ See colorful bouncing sphere appear

### 5. Console Commands for Testing

Open console and try:

```javascript
// Check if XR is available
navigator.xr.isSessionSupported('immersive-ar');

// Check ARCore support
navigator.xr.requestSession('immersive-ar', {
  requiredFeatures: ['hit-test'],
});
```

### 6. Feature Support

Different devices support different features:

| Feature          | Required    | Fallback               |
| ---------------- | ----------- | ---------------------- |
| hit-test         | ✅ Yes      | Won't place objects    |
| plane-detection  | ❌ Optional | No plane visualization |
| light-estimation | ❌ Optional | Default lighting       |
| anchors          | ❌ Optional | Objects may drift      |

### 7. What Each Feature Does

- **Hit-test**: Detects where to place objects (green reticle)
- **Plane-detection**: Shows detected surfaces (blue wireframe grids)
- **Light-estimation**: Matches lighting to real world
- **Anchors**: Keeps objects stable in space
- **Background-remover**: Makes scene transparent for camera feed

### 8. Expected Console Output

```
Hit test feature enabled: Object
Hit test results: 0
Hit test results: 0
Hit test results: 1
Reticle positioned at: Vector3 {x: 0.1, y: -0.5, z: -1.2}
✅ Plane detected! ID: 1 Position: Vector3 {x: 0, y: -0.5, z: -1}
Plane size: 2.5 x 3.0
Tap detected, lastHitPose: Object
Sphere placed at: Vector3 {x: 0.1, y: -0.45, z: -1.2}
```

## Quick Fixes

### If nothing works:

1. Reload page
2. Clear browser cache
3. Restart Chrome
4. Restart device
5. Try different room/lighting

### If reticle doesn't appear:

1. Move device in circular motion
2. Point at floor or table
3. Wait 10 seconds
4. Check "Scanning..." indicator

### If tap doesn't work:

1. Wait for green reticle first
2. Tap center of screen
3. Don't tap UI buttons
4. Check console for errors

## Need More Help?

Check the browser console for specific error messages and share them for debugging.
