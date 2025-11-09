# 3D Models Directory

This directory contains 3D models for AR experiences.

## File Format Requirements

### Android (Google AR Scene Viewer)
- **Format**: GLB or GLTF
- **Size**: < 10MB recommended
- **Polygons**: < 100,000 triangles
- **Textures**: Embedded or external
- **Materials**: PBR materials supported
 
### iOS (AR Quick Look)
- **Format**: USDZ only
- **Size**: < 10MB recommended
- **Polygons**: < 100,000 triangles
- **Textures**: Embedded
- **Materials**: PBR materials supported

## Naming Convention

For each model, provide both formats:
```
product-name.glb      # For Android
product-name.usdz     # For iOS
```

Example:
```
chair.glb
chair.usdz
table.glb
table.usdz
lamp.glb
lamp.usdz
```

## Converting GLB to USDZ

### Mac (Reality Converter)
```bash
xcrun usdz_converter input.glb output.usdz
```

### Online Converters
- [Autodesk Converter](https://www.autodesk.com/products/fbx/overview)
- [Sketchfab](https://sketchfab.com)
- Reality Converter app (Mac App Store)

### API Conversion
```bash
POST /api/convert-usdz
Body: { glbUrl: "/models/product.glb" }
Response: { usdzUrl: "/models/product.usdz" }
```

## Model Optimization

### Reduce File Size
1. **Compress textures** - Use JPEG instead of PNG
2. **Reduce resolution** - 2K max for textures
3. **Optimize geometry** - Remove unnecessary polygons
4. **Merge materials** - Combine similar materials
5. **Remove hidden faces** - Delete interior geometry

### Tools
- [Blender](https://www.blender.org/) - Free 3D software
- [glTF-Transform](https://gltf-transform.donmccurdy.com/) - CLI optimizer
- [Draco compression](https://google.github.io/draco/) - Geometry compression

### Example Optimization
```bash
# Install gltf-transform
npm install -g @gltf-transform/cli

# Optimize GLB
gltf-transform optimize input.glb output.glb \
  --texture-compress webp \
  --texture-size 2048
```

## Sample Models

You can download free sample models from:
- [Sketchfab](https://sketchfab.com/features/gltf) - Free GLB models
- [Poly Haven](https://polyhaven.com/) - Free 3D assets
- [Google Poly](https://poly.google.com/) - 3D model library
- [TurboSquid](https://www.turbosquid.com/) - Commercial models

## Testing Models

### Test GLB (Android)
1. Open Chrome on Android
2. Navigate to: `https://your-domain.com/models/model.glb`
3. Model should download or preview
4. Test in AR: Use Scene Viewer intent

### Test USDZ (iOS)
1. Open Safari on iOS
2. Navigate to: `https://your-domain.com/models/model.usdz`
3. AR Quick Look should open automatically
4. Tap to place model

### Test in App
```tsx
<ModelARLauncherButton 
  modelUrl="/models/your-model.glb"
  modelTitle="Test Model"
>
  Test AR
</ModelARLauncherButton>
```

## Model Checklist

Before adding a model to production:

- [ ] GLB file created and optimized
- [ ] USDZ file created from GLB
- [ ] File size < 10MB
- [ ] Polygon count < 100k
- [ ] Textures compressed
- [ ] Materials are PBR
- [ ] Tested on Android device
- [ ] Tested on iOS device
- [ ] Model appears correctly
- [ ] Scale is appropriate
- [ ] Lighting looks good

## Common Issues

### Model too large
- Reduce texture resolution
- Optimize geometry
- Use Draco compression

### Model appears black
- Check materials have proper textures
- Ensure lighting is correct
- Verify normal maps

### Model wrong size
- Scale in 3D software before export
- Use meters as unit (1 unit = 1 meter)
- Test in AR to verify scale

### Textures missing
- Embed textures in GLB
- Check texture paths
- Verify texture format (JPEG/PNG)

## Best Practices

1. **Use real-world scale** - 1 unit = 1 meter
2. **Center pivot point** - Place at model base
3. **Optimize for mobile** - Keep it simple
4. **Test early** - Test on devices often
5. **Provide fallbacks** - Have low-poly versions
6. **Document models** - Keep notes on each model

## Example Model Structure

```
models/
  furniture/
    chair-modern.glb
    chair-modern.usdz
    table-coffee.glb
    table-coffee.usdz
  
  electronics/
    laptop.glb
    laptop.usdz
    phone.glb
    phone.usdz
  
  sample/
    cube.glb
    cube.usdz
    sphere.glb
    sphere.usdz
```

## Resources

- [glTF Specification](https://www.khronos.org/gltf/)
- [USDZ Format](https://graphics.pixar.com/usd/docs/index.html)
- [ARCore Model Guidelines](https://developers.google.com/ar/develop/scene-viewer)
- [AR Quick Look Guidelines](https://developer.apple.com/augmented-reality/quick-look/)
