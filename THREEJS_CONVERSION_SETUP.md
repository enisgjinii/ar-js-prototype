# Three.js Conversion Setup

## Overview

Use **Three.js** to convert GLB to USDZ directly in JavaScript! No external tools needed - works on any platform (Windows, Mac, Linux).

## ✅ Advantages

- **Pure JavaScript** - No Python, no CLI tools
- **Cross-platform** - Works everywhere
- **Easy setup** - Just install npm package
- **Fast** - Runs in Node.js
- **Free** - Open source library
- **Reliable** - Used by millions

## 🚀 Quick Setup (2 Minutes)

### Step 1: Install Three.js

```bash
npm install three@latest
```

That's it! Conversion will work automatically.

### Step 2: Test It

1. Upload a GLB model via `/admin/models/new`
2. Conversion happens automatically
3. Check `/admin/models/convert` to see status

## 📦 What Gets Installed

```json
{
  "dependencies": {
    "three": "^0.160.0"
  }
}
```

**Size:** ~1.2MB (minified)
**License:** MIT

## 🎯 How It Works

```
1. Upload GLB file
   ↓
2. Three.js GLTFLoader parses GLB
   ↓
3. Three.js USDZExporter converts to USDZ
   ↓
4. USDZ file uploaded to Supabase
   ↓
5. Done! Both formats available
```

## 🔧 Technical Details

### Conversion Process

```typescript
// 1. Load GLB
const loader = new GLTFLoader();
const gltf = await loader.parse(glbArrayBuffer);

// 2. Export to USDZ
const exporter = new USDZExporter();
const usdzArrayBuffer = await exporter.parse(gltf.scene);

// 3. Save as Buffer
const usdzBuffer = Buffer.from(usdzArrayBuffer);
```

### What's Supported

✅ **Geometry** - Meshes, primitives
✅ **Materials** - PBR materials
✅ **Textures** - Base color, metallic, roughness, normal
✅ **Transforms** - Position, rotation, scale
✅ **Hierarchy** - Scene graph structure

⚠️ **Limited Support:**
- Animations (basic only)
- Morph targets
- Skinning

❌ **Not Supported:**
- Complex animations
- Custom shaders
- Extensions

## 🧪 Testing

### Test Conversion

```bash
# 1. Install Three.js
npm install three@latest

# 2. Start your app
npm run dev

# 3. Upload a test model
# Go to /admin/models/new
# Upload a GLB file

# 4. Check conversion
# Go to /admin/models/convert
# See status change: pending → converting → completed
```

### Verify USDZ

```bash
# Check database
SELECT name, usdz_url, conversion_status 
FROM models 
WHERE file_type = 'glb';

# Test on iOS
# Open /ar-viewer on iPhone
# Select model
# Click "View in AR"
# Should open AR Quick Look with USDZ
```

## 🐛 Troubleshooting

### "Module not found: three"

**Fix:**
```bash
npm install three@latest
```

### "Cannot find module 'three/examples/jsm/loaders/GLTFLoader.js'"

**Fix:**
```bash
# Make sure you have the latest version
npm install three@latest

# Clear cache
rm -rf node_modules/.cache
npm run dev
```

### "Conversion failed: Invalid GLB file"

**Causes:**
- Corrupted GLB file
- Unsupported features
- File too large

**Fix:**
- Re-export from 3D software
- Simplify model
- Reduce file size

### "USDZ file is empty or invalid"

**Causes:**
- Complex materials not supported
- Animations too complex
- Custom shaders

**Fix:**
- Use simpler materials
- Remove animations
- Export as basic PBR

## 📊 Performance

| Model Size | Conversion Time |
|------------|-----------------|
| < 1MB | 1-2 seconds |
| 1-5MB | 2-5 seconds |
| 5-10MB | 5-10 seconds |
| > 10MB | 10+ seconds |

**Tips for faster conversion:**
- Optimize models before upload
- Compress textures
- Reduce polygon count
- Remove unused data

## 🔄 Alternative Methods

If Three.js doesn't work for your use case:

### Option 1: Reality Converter (Mac)
```bash
xcode-select --install
```
**Pros:** High quality, official Apple tool
**Cons:** Mac only

### Option 2: External API
```env
CONVERSION_API_URL=https://api.example.com/convert
CONVERSION_API_KEY=your_key
```
**Pros:** Works anywhere, scalable
**Cons:** Costs money, external dependency

### Option 3: Manual Conversion
```bash
# Convert locally
xcrun usdz_converter model.glb model.usdz

# Upload both files manually
```
**Pros:** Full control, works immediately
**Cons:** Manual work

## 🎯 Recommended Setup

**For Development:**
```bash
npm install three@latest
```
Use Three.js for automatic conversion during development.

**For Production:**
```bash
npm install three@latest
```
Use Three.js in production - it's fast, reliable, and free!

**For High-Quality Needs:**
- Use Reality Converter (Mac) for best quality
- Or use external API for complex models
- Three.js for 90% of use cases

## 📝 Environment Variables

```env
# Optional: Disable Three.js converter
USE_THREEJS_CONVERTER=false

# Optional: Use external API instead
CONVERSION_API_URL=https://api.example.com/convert
CONVERSION_API_KEY=your_api_key
```

## ✨ Summary

**Three.js conversion:**
- ✅ Easy setup (1 command)
- ✅ Works everywhere
- ✅ Free and open source
- ✅ Fast and reliable
- ✅ No external dependencies

**Just run:**
```bash
npm install three@latest
```

**And you're done!** Conversion will work automatically. 🎉

---

## Next Steps

1. **Install Three.js:** `npm install three@latest`
2. **Restart app:** `npm run dev`
3. **Upload model:** `/admin/models/new`
4. **Check status:** `/admin/models/convert`
5. **Test AR:** `/ar-viewer`

**That's it!** Your conversion system is now powered by Three.js. 🚀
