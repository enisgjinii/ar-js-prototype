# Mobile AR Quick Start Guide

## What You're Building: Phone-Based AR (No Glasses/VR)

This is **handheld AR** - just your phone camera showing the real world with virtual objects placed in it.

### ✅ What You WILL See:

- Your phone's camera feed (real world)
- Virtual 3D objects placed in your room
- Objects stay in place as you move around

### ❌ What You WON'T Need:

- VR headset
- AR glasses
- Special equipment
- Just your Android phone!

---

## How It Works (User Experience)

### Step 1: Open AR View

User opens the app on their phone

### Step 2: Tap "Enter AR"

- Camera permission requested
- Camera feed appears on screen

### Step 3: Scan Environment

- User moves phone slowly around
- App detects floors, tables, walls
- Green ring appears on detected surfaces

### Step 4: Place Objects

- User taps screen where green ring is
- Colorful 3D sphere appears at that spot
- Object stays in place in real world

### Step 5: Walk Around

- User can move around the room
- Virtual objects stay where they were placed
- Can place multiple objects

---

## What You Should See Right Now

### 1. When AR Starts:

```
✅ Camera feed (your room through phone camera)
✅ Red test sphere floating 1m in front
✅ "Scanning..." indicator at top
```

### 2. After Moving Phone Around:

```
✅ Green ring/reticle on floor/table
✅ "Surfaces Detected" indicator
✅ Blue wireframe grids on detected planes (optional)
```

### 3. After Tapping Screen:

```
✅ Colorful sphere appears where you tapped
✅ Sphere bounces and rotates
✅ Can place more by tapping again
```

---

## Requirements

### Device:

- Android phone with ARCore support
- Most phones from 2018+ work
- Check: https://developers.google.com/ar/devices

### Browser:

- Chrome for Android (version 79+)
- Must be Chrome, not Firefox/Safari

### Permissions:

- Camera access (will be requested)
- Motion sensors (usually auto-granted)

---

## Testing Steps

1. **Open app on Android phone**
2. **Navigate to AR view**
3. **Tap "Enter AR" button**
4. **Grant camera permission**
5. **See camera feed** ← You should see your room
6. **See red sphere** ← Proves 3D rendering works
7. **Move phone slowly** ← Point at floor/table
8. **Wait 5-10 seconds** ← For surface detection
9. **See green ring** ← On detected surfaces
10. **Tap screen** ← Place colorful sphere
11. **Walk around** ← Sphere stays in place

---

## Troubleshooting

### "I only see camera, nothing else"

**This means:**

- Camera feed: ✅ Working
- 3D rendering: ❌ Not working OR objects not visible

**Check:**

1. Do you see the red test sphere? (Should be floating in front)
2. Open Chrome DevTools console - any errors?
3. Is the green ring appearing when you move phone?

**Try:**

- Move phone in slow circular motion
- Point at textured surfaces (not blank walls)
- Wait 10-15 seconds
- Check console logs

### "I see camera but no red sphere"

**This means:**

- AR session started but 3D rendering failed

**Check console for:**

- "Test sphere created at: ..."
- Any WebGL errors
- Any Babylon.js errors

### "I see red sphere but no green ring"

**This means:**

- 3D rendering: ✅ Working
- Hit-test: ❌ Not detecting surfaces

**Try:**

- Move phone more (circular motion)
- Point at floor or table (flat surfaces)
- Ensure good lighting
- Check console: "Hit test results: X" (should be > 0)

### "Green ring appears but tap does nothing"

**Check console for:**

- "Tap detected" message
- "No hit pose available" warning
- Make sure you tap screen (not UI buttons)

---

## Expected Console Output

When everything works:

```
Test sphere created at: Vector3 {x: 0, y: 0, z: -1}
Hit test feature enabled: Object
Hit test setup complete
Hit test results: 0
Hit test results: 0
Hit test results: 1  ← Surface detected!
Reticle positioned at: Vector3 {x: 0.1, y: -0.5, z: -1.2}
✅ Plane detected! ID: 1 Position: Vector3 {x: 0, y: -0.5, z: -1}
Tap detected, lastHitPose: Object
Sphere placed at: Vector3 {x: 0.1, y: -0.45, z: -1.2}
```

---

## What Each Feature Does

### Hit-Test (Core Feature)

- Detects where surfaces are
- Shows green ring where you can place objects
- **This is what makes AR work!**

### Plane Detection (Visual Aid)

- Shows blue wireframe grids on detected surfaces
- Helps you see what the phone "sees"
- Optional - not required for placement

### Light Estimation (Realism)

- Matches virtual object lighting to room lighting
- Makes objects look more realistic
- Automatic

### Anchors (Stability)

- Keeps objects stable in space
- Prevents drift as you move
- Automatic

---

## Common Issues

### Issue: "WebXR AR not supported"

**Solution:**

- Use Chrome on Android (not iOS)
- Update Chrome to latest version
- Check if device supports ARCore

### Issue: Nothing visible except camera

**Solution:**

- Open DevTools console
- Look for errors
- Check if red test sphere appears
- Try moving phone around more

### Issue: Objects appear but in wrong place

**Solution:**

- This is normal initially
- Move phone to scan environment better
- Wait for "Surfaces Detected" indicator
- Objects will be more accurate after scanning

---

## Next Steps

Once basic placement works, you can:

1. Replace spheres with custom 3D models
2. Add UI to select different objects
3. Add object manipulation (move, rotate, scale)
4. Save placed objects (anchors)
5. Add shadows and better lighting
6. Multi-user AR (share placements)

---

## Need Help?

1. **Check console** - Most issues show errors there
2. **Share console output** - Copy/paste error messages
3. **Describe what you see** - Camera only? Red sphere? Green ring?
4. **Device info** - Phone model and Chrome version

The AR is working if you see:

- ✅ Camera feed
- ✅ Red test sphere
- ✅ Green ring on surfaces
- ✅ Spheres placed when tapping
