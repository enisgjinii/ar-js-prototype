# Native AR - Quick Reference Card

## 🚀 Quick Start

```tsx
import ModelARLauncherButton from '@/components/model-ar-launcher';

<ModelARLauncherButton 
  modelUrl="/models/product.glb"
  modelTitle="Product Name"
>
  📱 View in AR
</ModelARLauncherButton>
```

## 📱 Platform Support

| Platform | Technology | Format | Requirements |
|----------|-----------|--------|--------------|
| **Android** | Google AR Scene Viewer | GLB/GLTF | ARCore, Chrome |
| **iOS** | AR Quick Look | USDZ | iOS 12+, Safari |

## 🎯 Components

### Full Page View
```tsx
import NativeARView from '@/components/native-ar-view';

<NativeARView 
  modelUrl="/models/model.glb"
  modelTitle="Model Name"
  onBack={() => router.back()}
/>
```

### Button
```tsx
import ModelARLauncherButton from '@/components/model-ar-launcher';

<ModelARLauncherButton modelUrl="/models/model.glb">
  View in AR
</ModelARLauncherButton>
```

### Link
```tsx
import { ARLink } from '@/components/model-ar-launcher';

<ARLink modelUrl="/models/model.glb">AR Link</ARLink>
```

### Gallery
```tsx
import ARModelGallery from '@/components/ar-model-gallery';

<ARModelGallery models={models} columns={3} />
```

## 🛠️ Utilities

```tsx
import { 
  detectPlatform,      // 'ios' | 'android' | 'other'
  isARSupported,       // boolean
  launchNativeAR,      // Launch AR programmatically
  getARCapabilities    // Get device AR info
} from '@/lib/ar-utils';

// Detect platform
const platform = detectPlatform();

// Check support
if (isARSupported()) {
  // Show AR button
}

// Launch AR
launchNativeAR({
  glbUrl: '/models/model.glb',
  usdzUrl: '/models/model.usdz',
  title: 'Model Name'
});

// Get capabilities
const caps = await getARCapabilities();
console.log(caps.recommendedMethod); // 'scene-viewer' | 'quick-look' | 'webxr'
```

## 📦 Model Requirements

### Android (GLB)
- ✅ Format: GLB or GLTF
- ✅ Size: < 10MB
- ✅ Polygons: < 100k
- ✅ Textures: Embedded or external

### iOS (USDZ)
- ✅ Format: USDZ only
- ✅ Convert from GLB
- ✅ PBR materials
- ✅ Animations supported

## 🔄 GLB to USDZ Conversion

### Mac (Reality Converter)
```bash
xcrun usdz_converter input.glb output.usdz
```

### Online Tools
- Reality Converter app (Mac)
- Autodesk online converter
- Sketchfab converter

### API Endpoint
```typescript
POST /api/convert-usdz
Body: { glbUrl: string }
Response: { usdzUrl: string }
```

## 📁 File Structure

```
public/
  models/
    product.glb      # Android
    product.usdz     # iOS
    chair.glb
    chair.usdz
    table.glb
    table.usdz
```

## 🧪 Testing

### Android
1. Chrome on Android device
2. Navigate to app
3. Tap "View in AR"
4. Grant camera permission
5. Scan environment
6. Tap to place

### iOS
1. Safari on iOS device
2. Navigate to app
3. Tap "View in AR"
4. AR Quick Look opens
5. Tap to place

## 🐛 Troubleshooting

### Android
- **Not working?** Install Google Play Services for AR
- **Device unsupported?** Check [ARCore devices](https://developers.google.com/ar/devices)
- **Model not loading?** Verify GLB URL is accessible

### iOS
- **Not opening?** Ensure USDZ file exists
- **Wrong format?** Must be `.usdz` extension
- **Not Safari?** AR Quick Look requires Safari

## 📊 Intent URL Format (Android)

```
intent://arvr.google.com/scene-viewer/1.0
  ?file=<MODEL_URL>
  &mode=ar_preferred
  &title=<TITLE>
#Intent;
  scheme=https;
  package=com.google.ar.core;
  action=android.intent.action.VIEW;
  S.browser_fallback_url=<FALLBACK_URL>;
end;
```

## 🍎 AR Quick Look (iOS)

```html
<a rel="ar" href="model.usdz">
  <img />
</a>
```

## 📚 Resources

- [Google AR Scene Viewer](https://developers.google.com/ar/develop/scene-viewer)
- [iOS AR Quick Look](https://developer.apple.com/augmented-reality/quick-look/)
- [ARCore Devices](https://developers.google.com/ar/devices)
- [Reality Converter](https://developer.apple.com/augmented-reality/tools/)

## 🎨 Styling Examples

### Primary Button
```tsx
<ModelARLauncherButton 
  className="bg-blue-600 hover:bg-blue-700 text-white"
>
  View in AR
</ModelARLauncherButton>
```

### Outline Button
```tsx
<ModelARLauncherButton 
  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
>
  View in AR
</ModelARLauncherButton>
```

### Full Width
```tsx
<ModelARLauncherButton className="w-full">
  View in AR
</ModelARLauncherButton>
```

## 🔗 URLs

- Demo: `/ar-demo`
- AR Page: `/ar`
- Guide: `/NATIVE_AR_GUIDE.md`
- Setup: `/NATIVE_AR_SETUP.md`
- Examples: `/INTEGRATION_EXAMPLES.md`

---

**Need help?** Check `NATIVE_AR_GUIDE.md` for detailed documentation!
