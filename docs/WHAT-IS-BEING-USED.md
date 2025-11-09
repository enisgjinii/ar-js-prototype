# What AR Technology Is Being Used

## Quick Answer

Your `/test-webar` page is using **Google's model-viewer** library, which automatically chooses the best AR method for your device:

### On Your Android Device:

**If you see it opening Google AR Scene Viewer (leaves browser):**
- Using: **Scene Viewer** (native Android AR app)
- Why: WebXR is not enabled in your Chrome
- Your UI: Disappears temporarily ❌

**If it stays in the browser:**
- Using: **WebXR** (browser-based AR)
- Why: WebXR is enabled in Chrome
- Your UI: Stays visible ✅

---

## Technology Stack

### What's Running:

```
model-viewer (Google)
    ↓
Detects your device
    ↓
┌─────────────┬──────────────┬─────────────┐
│   Android   │     iOS      │   Desktop   │
└─────────────┴──────────────┴─────────────┘
       ↓              ↓              ↓
  WebXR or      AR Quick      3D Preview
Scene Viewer      Look           Only
```

### Component: `ModelViewerWebAR`
- **Library:** Google model-viewer v3.4.0
- **Source:** https://modelviewer.dev/
- **Technology:** Web Components + Three.js
- **Cost:** Free and open source

---

## What Happens on Different Devices

### Android (Your Device)

**Scenario 1: WebXR Enabled** (Chrome 90+, flags on)
```
Click "View in AR"
    ↓
Camera opens IN BROWSER
    ↓
Your UI stays visible (header, close button)
    ↓
Place 3D model in your space
    ↓
Still in browser ✅
```

**Scenario 2: WebXR Not Enabled** (What you're seeing now)
```
Click "View in AR"
    ↓
Opens Google AR Scene Viewer app
    ↓
Your UI disappears
    ↓
Place 3D model in your space
    ↓
Close app → Return to browser
```

### iOS (iPhone/iPad)
```
Click "View in AR"
    ↓
Opens AR Quick Look (Apple's native AR)
    ↓
Your UI disappears
    ↓
Place 3D model in your space
    ↓
Close AR → Return to browser
```

### Desktop (Computer)
```
Opens 3D viewer
    ↓
Can rotate and zoom model
    ↓
No AR available (need mobile device)
```

---

## How to Check What You're Using

### Open Chrome Console (DevTools)

Look for these messages:

**WebXR Supported:**
```
✅ WebXR supported - will stay in browser!
✅ model-viewer loaded
✅ Model loaded successfully
```

**WebXR Not Supported:**
```
⚠️ WebXR not supported - will use Scene Viewer
✅ model-viewer loaded
✅ Model loaded successfully
```

### On the Page

Look at the bottom message:

**WebXR Ready:**
> ✅ WebXR Ready: Your browser UI stays visible during AR!

**Scene Viewer:**
> ⚠️ Scene Viewer: Will open Google AR app. Update Chrome for WebXR support.

---

## Technical Details

### What model-viewer Does:

1. **Loads the library** from Google CDN
2. **Detects your device** (iOS/Android/Desktop)
3. **Checks WebXR support** (if Android)
4. **Sets AR mode:**
   - `webxr` - Browser-based AR (stays in app)
   - `scene-viewer` - Google AR app (leaves app)
   - `quick-look` - Apple AR (iOS only)

### The Code Flow:

```javascript
// 1. Detect platform
if (Android) {
    // 2. Check WebXR support
    if (navigator.xr.isSessionSupported('immersive-ar')) {
        // Use WebXR (stays in browser)
        arModes = 'webxr';
    } else {
        // Use Scene Viewer (opens app)
        arModes = 'scene-viewer';
    }
}

// 3. Create model-viewer element
<model-viewer
    src="/models/Cesium_Man.glb"
    ar-modes={arModes}
    camera-controls
    auto-rotate
/>
```

---

## Why You're Seeing Scene Viewer

Your Chrome browser doesn't have WebXR enabled. This is normal!

### To Enable WebXR (Stay in Browser):

1. Open Chrome
2. Go to: `chrome://flags`
3. Search: "webxr"
4. Enable these:
   - WebXR Incubations
   - WebXR AR Module
   - WebXR Hit Test
5. Tap "Relaunch"
6. Test again

**Full guide:** See `docs/ENABLE-WEBXR-ANDROID.md`

---

## Comparison: What You Have vs Alternatives

### Current (model-viewer)
- ✅ Free
- ✅ Easy to use
- ✅ Google-maintained
- ✅ Works on all devices
- ⚠️ Android: WebXR or Scene Viewer
- ⚠️ iOS: Native AR only

### Alternative 1: AR.js (What client mentioned)
- ❌ Outdated (2019)
- ❌ No plane detection
- ❌ Requires printed markers
- ❌ Poor performance
- ❌ NOT RECOMMENDED

### Alternative 2: 8th Wall (Paid)
- ✅ iOS WebAR (stays in browser)
- ✅ Android WebAR
- ✅ Professional quality
- ❌ Costs $99-$1,188/month

### Alternative 3: Native AR (Previous implementation)
- ✅ Best AR quality
- ✅ 99% device support
- ❌ Always leaves browser
- ❌ No UI control during AR

---

## What Files Are Being Used

### Component:
- `components/model-viewer-webar.tsx` - Main AR component

### Test Page:
- `app/test-webar/page.tsx` - Demo page

### 3D Model:
- `public/models/Cesium_Man.glb` - The 3D character

### External Library:
- `https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js`

---

## How to Use in Your App

### Replace Native AR Components:

**Before (Native AR):**
```tsx
<NativeARView
    modelUrl="/models/model.glb"
    modelTitle="My Model"
    onBack={handleClose}
/>
```

**After (WebAR):**
```tsx
<ModelViewerWebAR
    modelUrl="/models/model.glb"
    modelTitle="My Model"
    onClose={handleClose}
/>
```

### In Your Existing Pages:

1. Import the component:
```tsx
import ModelViewerWebAR from '@/components/model-viewer-webar';
```

2. Use it:
```tsx
const [showAR, setShowAR] = useState(false);

<button onClick={() => setShowAR(true)}>View in AR</button>

{showAR && (
    <ModelViewerWebAR
        modelUrl={model.file_url}
        usdzUrl={model.usdz_url}
        modelTitle={model.name}
        onClose={() => setShowAR(false)}
    />
)}
```

---

## Summary

### What You're Using:
- **Library:** Google model-viewer
- **Technology:** WebXR (if enabled) or Scene Viewer (fallback)
- **Cost:** Free
- **Quality:** Professional

### What Happens:
- **Android with WebXR:** Stays in browser ✅
- **Android without WebXR:** Opens Scene Viewer ⚠️
- **iOS:** Opens AR Quick Look ⚠️
- **Desktop:** 3D preview only

### Why This Solution:
- ✅ Best free option available
- ✅ Industry standard (Google, Shopify use it)
- ✅ Actively maintained
- ✅ Works on all devices
- ✅ Better than AR.js (outdated)
- ✅ Cheaper than 8th Wall ($99/mo)

---

## Next Steps

1. **Test on your device** - See which mode you get
2. **Enable WebXR** (optional) - To stay in browser
3. **Integrate into your app** - Replace native AR components
4. **Show client** - Explain why this is better than AR.js

---

**Document:** What Is Being Used  
**Status:** ✅ Working  
**Last Updated:** November 2024
