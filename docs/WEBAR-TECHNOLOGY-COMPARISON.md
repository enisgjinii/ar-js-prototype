# WebAR Technology Comparison Guide

## Executive Summary

This document provides a comprehensive comparison of all major WebAR technologies to help you make an informed decision for your AR implementation.

**TL;DR Recommendation:** Use **model-viewer** (free) or **8th Wall** (paid) depending on budget. Avoid AR.js for modern AR experiences.

---

## Complete Technology Comparison

| Technology | iOS Support | Android Support | Stays in Browser | Cost | Plane Detection | Performance | Maintenance | Best For |
|------------|-------------|-----------------|------------------|------|-----------------|-------------|-------------|----------|
| **8th Wall** | ✅ Excellent | ✅ Excellent | ✅ Yes | $99-$1,188/mo | ✅ Yes | ⭐⭐⭐⭐⭐ | Active | Professional projects with budget |
| **model-viewer** | ⚠️ Limited* | ✅ Good | ✅ Yes | Free | ✅ Yes | ⭐⭐⭐⭐ | Active (Google) | Best free option |
| **Three.js + WebXR** | ❌ No | ✅ Chrome only | ✅ Yes | Free | ✅ Yes | ⭐⭐⭐⭐ | Active | Custom implementations |
| **Babylon.js + WebXR** | ❌ No | ✅ Chrome only | ✅ Yes | Free | ✅ Yes | ⭐⭐⭐⭐ | Active | Game-like experiences |
| **AR.js** | ⚠️ Limited | ⚠️ Limited | ✅ Yes | Free | ❌ No | ⭐⭐ | Outdated (2019) | Marker-based AR only |
| **Native AR** | ✅ Perfect | ✅ Perfect | ❌ No | Free | ✅ Yes | ⭐⭐⭐⭐⭐ | OS-maintained | Maximum compatibility |

*iOS falls back to AR Quick Look (native)

---

## Detailed Technology Breakdown

### 1. 8th Wall (Premium Solution)

**What it is:** Commercial WebAR platform that works on iOS Safari (unique feature)

#### Pros
- ✅ **Works on iOS Safari** (only WebAR solution that does this)
- ✅ Works on Android (all browsers)
- ✅ Stays in your web app - UI always visible
- ✅ Professional quality AR with plane detection
- ✅ 95%+ device coverage
- ✅ No app installation needed
- ✅ Built on Three.js (familiar API)
- ✅ Cloud-based processing
- ✅ Excellent documentation and support
- ✅ Image tracking, face effects, world tracking

#### Cons
- ❌ **Costs $99-$1,188/month**
- ❌ Requires their cloud service (not self-hosted)
- ❌ Vendor lock-in
- ❌ Usage limits on lower tiers

#### Pricing
- **Free Trial:** 14 days, full features
- **Standard:** $99/month - Unlimited scans, commercial use
- **Pro:** $499/month - Advanced features, analytics
- **Enterprise:** Custom pricing - White label, SLA, dedicated support

#### Use Cases
- E-commerce AR try-ons
- Marketing campaigns
- Product visualization
- Professional client projects
- When iOS WebAR is critical

#### Code Example
```javascript
import { XR8 } from '8th-wall';

XR8.run({
  canvas: document.getElementById('canvas'),
  allowedDevices: XR8.XrConfig.device().ANY,
});
```

**Verdict:** Best solution if you have budget and need iOS WebAR support.

---

### 2. model-viewer (Google's Solution)

**What it is:** Web component by Google for 3D models with AR support

#### Pros
- ✅ **Free and open source**
- ✅ Android: WebXR AR (stays in browser)
- ✅ iOS: Auto-falls back to AR Quick Look
- ✅ Desktop: 3D preview with controls
- ✅ Easy to implement (just HTML tag)
- ✅ Built on Three.js
- ✅ Actively maintained by Google
- ✅ Auto-rotation, camera controls
- ✅ Good performance
- ✅ No external dependencies needed

#### Cons
- ⚠️ iOS still uses native AR Quick Look (leaves browser)
- ⚠️ Limited customization compared to raw Three.js
- ⚠️ WebXR only works on Chrome Android
- ⚠️ Less control over AR experience

#### Browser Support
- Chrome Android: WebXR AR ✅
- Safari iOS: AR Quick Look fallback ⚠️
- Desktop: 3D preview ✅
- Firefox: Limited ⚠️

#### Use Cases
- Product visualization
- 3D model galleries
- E-commerce
- Museums and education
- When you need quick implementation

#### Code Example
```html
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>

<model-viewer
  src="model.glb"
  ios-src="model.usdz"
  ar
  ar-modes="webxr scene-viewer quick-look"
  camera-controls
  auto-rotate
  shadow-intensity="1">
  <button slot="ar-button">View in AR</button>
</model-viewer>
```

**Verdict:** Best free solution. Recommended for most projects.

---

### 3. Three.js + WebXR

**What it is:** Popular 3D library with WebXR API support

#### Pros
- ✅ **Industry standard** (most popular 3D library)
- ✅ Full control over 3D scene
- ✅ Smaller bundle size (~600KB)
- ✅ Huge community and examples
- ✅ Free and open source
- ✅ WebXR support built-in
- ✅ Excellent documentation
- ✅ Can build custom AR experiences

#### Cons
- ❌ **iOS Safari doesn't support WebXR** (Apple blocks it)
- ⚠️ Chrome Android only for AR
- ⚠️ Requires more code than model-viewer
- ⚠️ Need to handle platform detection yourself
- ⚠️ More complex implementation

#### Browser Support
- Chrome Android: WebXR AR ✅
- Safari iOS: No WebXR ❌
- Desktop: 3D preview ✅

#### Use Cases
- Custom AR experiences
- When you need full control
- Complex 3D interactions
- Games and interactive experiences
- Already using Three.js in project

#### Code Example
```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.xr.enabled = true;

// Request AR session
navigator.xr.requestSession('immersive-ar', {
  requiredFeatures: ['hit-test']
}).then(session => {
  renderer.xr.setSession(session);
});
```

**Verdict:** Best for custom implementations when you need full control.

---

### 4. Babylon.js + WebXR

**What it is:** Microsoft-backed 3D engine with WebXR support

#### Pros
- ✅ Modern and actively maintained
- ✅ WebXR support built-in
- ✅ Great performance (sometimes better than Three.js)
- ✅ Excellent documentation
- ✅ Free and open source
- ✅ Good for game-like experiences
- ✅ Built-in physics engine
- ✅ Visual editor available

#### Cons
- ❌ **iOS Safari doesn't support WebXR**
- ⚠️ Chrome Android only for AR
- ⚠️ Larger bundle size (~2MB)
- ⚠️ Smaller community than Three.js
- ⚠️ More complex than model-viewer

#### Browser Support
- Chrome Android: WebXR AR ✅
- Safari iOS: No WebXR ❌
- Desktop: 3D preview ✅

#### Use Cases
- Game-like AR experiences
- Complex physics simulations
- When you prefer Babylon over Three.js
- Enterprise applications

#### Code Example
```javascript
import * as BABYLON from '@babylonjs/core';

const xr = await scene.createDefaultXRExperienceAsync({
  uiOptions: {
    sessionMode: 'immersive-ar'
  }
});
```

**Verdict:** Good alternative to Three.js, especially for game-like experiences.

---

### 5. AR.js (NOT RECOMMENDED)

**What it is:** Marker-based AR library (outdated)

#### Pros
- ✅ Free and open source
- ✅ Works in browser
- ✅ Lightweight
- ✅ Marker-based AR works

#### Cons
- ❌ **No plane detection** (can't place objects on surfaces)
- ❌ **Outdated** (last major update 2019)
- ❌ **Poor performance** on most devices
- ❌ **Requires printed markers** (QR codes, images)
- ❌ **Not true AR** like ARCore/ARKit
- ❌ Limited device support
- ❌ No active maintenance
- ❌ Bad user experience

#### Why NOT to use AR.js
1. **No Surface Detection:** Can't place objects on floors/tables
2. **Requires Markers:** Users must scan printed images
3. **Poor Performance:** Laggy and unstable
4. **Outdated Technology:** Better solutions exist
5. **Limited Use Cases:** Only good for marker-based AR

#### When AR.js MIGHT be acceptable
- Museum exhibits with printed markers
- Educational posters with AR content
- Print advertising with AR elements
- When you specifically need marker tracking
- Legacy projects already using it

#### Code Example
```html
<script src="https://aframe.io/releases/1.0.4/aframe.min.js"></script>
<script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>

<a-scene embedded arjs>
  <a-marker preset="hiro">
    <a-box position="0 0.5 0" material="color: red;"></a-box>
  </a-marker>
  <a-entity camera></a-entity>
</a-scene>
```

**Verdict:** Avoid for modern AR projects. Only use if you specifically need marker-based AR.

---

### 6. Native AR (AR Quick Look + Scene Viewer)

**What it is:** Platform-specific AR using OS capabilities

#### Pros
- ✅ **Best AR quality** (uses ARCore/ARKit)
- ✅ **99% device compatibility**
- ✅ Perfect plane detection
- ✅ Free
- ✅ No installation needed
- ✅ OS-maintained (always updated)
- ✅ Professional experience

#### Cons
- ❌ **Leaves your web app** (separate native app)
- ❌ Your UI disappears during AR
- ❌ Less control over experience
- ❌ iOS requires USDZ format

#### Platform Support
- iOS: AR Quick Look ✅
- Android: Google Scene Viewer ✅
- Desktop: Not available ❌

#### Use Cases
- Maximum device compatibility needed
- When AR quality is priority
- Simple "view in AR" features
- E-commerce product viewing
- When UI visibility during AR isn't critical

#### Code Example
```javascript
// Android
const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${modelUrl}&mode=ar_preferred#Intent;scheme=https;package=com.google.ar.core;end;`;
window.location.href = intentUrl;

// iOS
const anchor = document.createElement('a');
anchor.rel = 'ar';
anchor.href = 'model.usdz';
anchor.click();
```

**Verdict:** Best compatibility and quality, but leaves your app.

---

## Decision Matrix

### Choose 8th Wall if:
- ✅ You have budget ($99+/month)
- ✅ iOS WebAR is critical
- ✅ You need professional quality
- ✅ You want maximum device support IN BROWSER
- ✅ Client is willing to pay for best experience

### Choose model-viewer if:
- ✅ You need free solution
- ✅ Android WebAR is acceptable
- ✅ iOS can fall back to native AR
- ✅ You want easy implementation
- ✅ **RECOMMENDED FOR MOST PROJECTS**

### Choose Three.js/Babylon.js if:
- ✅ You need custom AR features
- ✅ You want full control
- ✅ Android-only WebAR is acceptable
- ✅ You have development resources
- ✅ You're building complex experiences

### Choose Native AR if:
- ✅ Maximum compatibility is critical
- ✅ AR quality is priority
- ✅ UI visibility during AR isn't important
- ✅ Simple "view in AR" feature
- ✅ You want zero maintenance

### AVOID AR.js unless:
- ⚠️ You specifically need marker-based AR
- ⚠️ You're maintaining legacy project
- ⚠️ You have printed markers/posters
- ❌ Don't use for modern surface-based AR

---

## Technical Comparison

### Bundle Sizes
| Technology | Size | Load Time (3G) |
|------------|------|----------------|
| model-viewer | ~200KB | ~2s |
| Three.js | ~600KB | ~5s |
| Babylon.js | ~2MB | ~15s |
| AR.js | ~300KB | ~3s |
| 8th Wall | ~1MB | ~8s |
| Native AR | 0KB | Instant |

### Device Compatibility (2024)

| Technology | iOS 15+ | iOS 12-14 | Android 10+ | Android 7-9 | Desktop |
|------------|---------|-----------|-------------|-------------|---------|
| 8th Wall | ✅ 95% | ✅ 90% | ✅ 95% | ✅ 85% | ⚠️ Preview |
| model-viewer | ⚠️ Native | ⚠️ Native | ✅ 90% | ✅ 70% | ✅ Preview |
| Three.js WebXR | ❌ 0% | ❌ 0% | ✅ 85% | ⚠️ 50% | ✅ Preview |
| Babylon.js WebXR | ❌ 0% | ❌ 0% | ✅ 85% | ⚠️ 50% | ✅ Preview |
| AR.js | ⚠️ 40% | ⚠️ 30% | ⚠️ 50% | ⚠️ 40% | ⚠️ Limited |
| Native AR | ✅ 100% | ✅ 100% | ✅ 95% | ✅ 80% | ❌ 0% |

### Feature Comparison

| Feature | 8th Wall | model-viewer | Three.js | Babylon.js | AR.js | Native AR |
|---------|----------|--------------|----------|------------|-------|-----------|
| Plane Detection | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Image Tracking | ✅ | ❌ | ⚠️ Custom | ⚠️ Custom | ✅ | ❌ |
| Face Effects | ✅ | ❌ | ⚠️ Custom | ⚠️ Custom | ❌ | ❌ |
| World Tracking | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Light Estimation | ✅ | ⚠️ Limited | ✅ | ✅ | ❌ | ✅ |
| Occlusion | ✅ | ❌ | ⚠️ Limited | ⚠️ Limited | ❌ | ✅ |
| Multi-user AR | ✅ | ❌ | ⚠️ Custom | ⚠️ Custom | ❌ | ❌ |
| Custom UI | ✅ | ⚠️ Limited | ✅ | ✅ | ✅ | ❌ |

---

## Real-World Performance

### Load Times (Average)
- **8th Wall:** 3-5 seconds
- **model-viewer:** 2-3 seconds
- **Three.js:** 2-4 seconds
- **Babylon.js:** 4-6 seconds
- **AR.js:** 2-3 seconds (but poor AR quality)
- **Native AR:** Instant (OS-level)

### Frame Rates (Average)
- **8th Wall:** 30-60 FPS
- **model-viewer:** 30-60 FPS
- **Three.js:** 30-60 FPS
- **Babylon.js:** 30-60 FPS
- **AR.js:** 15-30 FPS (often laggy)
- **Native AR:** 60 FPS

---

## Cost Analysis (Annual)

| Solution | Year 1 | Year 2 | Year 3 | 3-Year Total |
|----------|--------|--------|--------|--------------|
| **8th Wall Standard** | $1,188 | $1,188 | $1,188 | $3,564 |
| **8th Wall Pro** | $5,988 | $5,988 | $5,988 | $17,964 |
| **model-viewer** | $0 | $0 | $0 | $0 |
| **Three.js** | $0 | $0 | $0 | $0 |
| **Babylon.js** | $0 | $0 | $0 | $0 |
| **AR.js** | $0 | $0 | $0 | $0 |
| **Native AR** | $0 | $0 | $0 | $0 |

*Note: Free solutions may require more development time*

---

## Implementation Complexity

| Technology | Setup Time | Learning Curve | Maintenance | Documentation |
|------------|------------|----------------|-------------|---------------|
| 8th Wall | 1-2 days | Medium | Low | Excellent |
| model-viewer | 1-2 hours | Easy | Very Low | Good |
| Three.js | 3-5 days | Medium-High | Medium | Excellent |
| Babylon.js | 3-5 days | Medium-High | Medium | Excellent |
| AR.js | 1 day | Easy | High | Poor |
| Native AR | 2-4 hours | Easy | Very Low | Good |

---

## Recommended Solution for Your Project

### Budget Available ($99+/month)
**Use 8th Wall**
- Best iOS support
- Professional quality
- Your UI stays visible on all devices
- Worth the investment for client projects

### No Budget (Free)
**Use model-viewer**
- Best free option
- Easy to implement
- Android: WebAR (UI visible)
- iOS: Native AR fallback
- Google-maintained

### Hybrid Approach (Recommended)
**model-viewer + Native AR fallback**
```javascript
// Android Chrome: WebXR (stays in browser)
// iOS Safari: AR Quick Look (native)
// Desktop: 3D preview
```

---

## Why NOT AR.js

Your client mentioned AR.js. Here's why it's not suitable:

### AR.js Problems
1. **Outdated:** Last major update in 2019
2. **No Plane Detection:** Can't place objects on surfaces
3. **Requires Markers:** Users must scan printed images
4. **Poor Performance:** Laggy, unstable
5. **Bad UX:** Not modern AR experience
6. **Limited Support:** Community mostly inactive

### What AR.js is Good For
- ✅ Museum exhibits with printed markers
- ✅ Educational posters
- ✅ Print advertising
- ❌ NOT for modern product visualization
- ❌ NOT for e-commerce AR
- ❌ NOT for professional projects

### Better Alternatives to AR.js
1. **model-viewer** - Free, modern, maintained
2. **Three.js + WebXR** - Free, full control
3. **8th Wall** - Paid, professional
4. **Native AR** - Free, best quality

---

## Final Recommendation

### For Your Project:

**Primary Solution: model-viewer**
- Free and easy
- Android: WebXR (UI visible)
- iOS: Native AR fallback
- Best free option available

**If Budget Allows: 8th Wall**
- iOS WebAR support
- Professional quality
- Worth it for client projects

**Avoid: AR.js**
- Outdated technology
- Poor user experience
- Not suitable for modern AR

---

## Implementation Guide

### Quick Start with model-viewer

```html
<!-- 1. Add script -->
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>

<!-- 2. Add model viewer -->
<model-viewer
  src="your-model.glb"
  ios-src="your-model.usdz"
  ar
  ar-modes="webxr scene-viewer quick-look"
  camera-controls
  auto-rotate
  shadow-intensity="1"
  style="width: 100%; height: 500px;">
  
  <button slot="ar-button">View in AR</button>
</model-viewer>
```

### Result:
- ✅ Android: WebXR AR (stays in browser)
- ✅ iOS: AR Quick Look (native)
- ✅ Desktop: 3D preview
- ✅ Your UI stays visible (Android)
- ✅ Free forever

---

## Questions to Ask Your Client

1. **What's your budget?**
   - $0: Use model-viewer
   - $99+/month: Consider 8th Wall

2. **Is iOS WebAR critical?**
   - Yes: Need 8th Wall (only solution)
   - No: model-viewer is fine

3. **Can iOS users use native AR?**
   - Yes: model-viewer works great
   - No: Need 8th Wall

4. **Why do they want AR.js?**
   - If they need markers: AR.js might work
   - If they want modern AR: Use model-viewer instead

---

## Conclusion

**Best Free Solution:** model-viewer (Google)
**Best Paid Solution:** 8th Wall
**Best Quality:** Native AR
**Avoid:** AR.js (outdated)

**Your situation (no budget, need UI visible):**
→ Use **model-viewer** with native AR fallback

This gives you:
- Android: WebXR (UI visible) ✅
- iOS: Native AR (best quality) ✅
- Free forever ✅
- Easy to implement ✅

---

## Additional Resources

### Documentation
- **model-viewer:** https://modelviewer.dev/
- **8th Wall:** https://www.8thwall.com/docs
- **Three.js:** https://threejs.org/docs/
- **Babylon.js:** https://doc.babylonjs.com/
- **WebXR:** https://immersiveweb.dev/

### Live Examples
- **model-viewer:** https://modelviewer.dev/examples/
- **8th Wall:** https://www.8thwall.com/showcase
- **Three.js:** https://threejs.org/examples/#webxr_ar_cones

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Author:** Technical Documentation  
**Status:** Production Ready
