# Automatic GLB to USDZ Conversion Guide

## Overview

Your app now automatically converts GLB files to USDZ format for iOS AR support! When you upload a GLB model, it will:

1. ✅ Store the GLB file (for Android)
2. 🔄 Automatically convert to USDZ (for iOS)
3. 💾 Store both files in Supabase
4. 📱 Serve the right format based on device

## How It Works

### Upload Flow

```
Admin uploads GLB → Stored in Supabase → Conversion API called → USDZ created → Both files available
```

### User Experience

```
Android user → Sees "View in AR" → Opens Google AR → Uses GLB file
iOS user → Sees "View in AR" → Opens AR Quick Look → Uses USDZ file
```

## Database Schema

### New Fields Added

```sql
ALTER TABLE models ADD COLUMN:
- usdz_url TEXT              -- Public URL for USDZ file
- usdz_path TEXT             -- Storage path for USDZ file
- auto_convert_usdz BOOLEAN  -- Enable/disable auto-conversion
- conversion_status TEXT     -- Status: pending, converting, completed, failed
```

### Conversion Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Waiting for conversion |
| `converting` | Currently converting |
| `completed` | USDZ file ready |
| `failed` | Conversion failed |

## Conversion Methods

The system supports multiple conversion methods (in order of preference):

### 1. External Conversion API (Recommended)

Use a cloud conversion service:

```env
# .env.local
CONVERSION_API_URL=https://api.example.com/convert
CONVERSION_API_KEY=your_api_key_here
```

**Pros:**
- ✅ Works on any platform
- ✅ Fast and reliable
- ✅ No local dependencies

**Cons:**
- ❌ Requires paid service
- ❌ External dependency

**Services:**
- [Autodesk Forge](https://forge.autodesk.com/)
- [Sketchfab API](https://sketchfab.com/developers)
- Custom conversion service

### 2. Reality Converter CLI (Mac Only)

Uses Apple's Reality Converter command-line tool:

```bash
# Automatically used if running on Mac
xcrun usdz_converter input.glb output.usdz
```

**Pros:**
- ✅ Free
- ✅ Official Apple tool
- ✅ High quality

**Cons:**
- ❌ Mac only
- ❌ Requires Xcode Command Line Tools

**Setup:**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify installation
xcrun usdz_converter --help
```

### 3. Python USD Library

Uses Pixar's USD Python library:

```env
# .env.local
PYTHON_USD_AVAILABLE=true
```

**Pros:**
- ✅ Cross-platform
- ✅ Open source
- ✅ Powerful

**Cons:**
- ❌ Complex setup
- ❌ Large dependencies

**Setup:**
```bash
# Install USD Python library
pip install usd-core

# Or use conda
conda install -c conda-forge usd-core
```

## Setup Instructions

### Option 1: External API (Easiest)

1. **Sign up for conversion service**
   - Choose a service (Autodesk Forge, etc.)
   - Get API credentials

2. **Add to environment variables**
   ```env
   CONVERSION_API_URL=https://api.example.com/convert
   CONVERSION_API_KEY=your_api_key
   ```

3. **Test conversion**
   ```bash
   # Upload a model via admin panel
   # Check conversion status in database
   ```

### Option 2: Reality Converter (Mac)

1. **Install Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Verify installation**
   ```bash
   xcrun usdz_converter --help
   ```

3. **Deploy to Mac server**
   - Your Next.js app must run on macOS
   - Vercel/Netlify won't work (Linux-based)
   - Use Mac mini server or similar

### Option 3: Manual Conversion

If automatic conversion isn't set up:

1. **Convert locally**
   ```bash
   # Mac
   xcrun usdz_converter model.glb model.usdz
   
   # Or use Reality Converter app
   ```

2. **Upload both files**
   - Upload GLB via admin panel
   - Manually upload USDZ to same bucket
   - Update database with USDZ URL

## API Endpoint

### POST /api/convert-model

Converts GLB to USDZ and stores in Supabase.

**Request:**
```json
{
  "modelId": "uuid-here",
  "glbUrl": "https://your-bucket.supabase.co/storage/v1/object/public/models/model.glb"
}
```

**Response (Success):**
```json
{
  "success": true,
  "usdzUrl": "https://your-bucket.supabase.co/storage/v1/object/public/models/model.usdz",
  "message": "GLB converted to USDZ successfully"
}
```

**Response (Error):**
```json
{
  "error": "Conversion failed: No conversion method available"
}
```

## Usage in Code

### Automatic Conversion Hook

```tsx
import { useAutoConvert } from '@/lib/hooks/use-auto-convert';

function ModelUploadSuccess({ modelId }: { modelId: string }) {
  const { converting, error, success } = useAutoConvert(modelId);

  return (
    <div>
      {converting && <p>Converting to USDZ...</p>}
      {error && <p>Error: {error}</p>}
      {success && <p>Conversion complete!</p>}
    </div>
  );
}
```

### Manual Conversion Trigger

```tsx
async function convertModel(modelId: string, glbUrl: string) {
  const response = await fetch('/api/convert-model', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId, glbUrl })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('USDZ URL:', result.usdzUrl);
  }
}
```

### Platform-Specific File Selection

The system automatically selects the right file:

```tsx
<ModelARLauncherButton 
  modelUrl={model.file_url}      // GLB for Android
  usdzUrl={model.usdz_url}       // USDZ for iOS
  modelTitle={model.name}
>
  View in AR
</ModelARLauncherButton>
```

**What happens:**
- Android user → Uses `modelUrl` (GLB)
- iOS user → Uses `usdzUrl` (USDZ)
- If no USDZ → Shows error message

## Monitoring Conversions

### Check Conversion Status

```sql
-- View all models with conversion status
SELECT 
  id, 
  name, 
  file_url, 
  usdz_url, 
  conversion_status,
  auto_convert_usdz
FROM models
ORDER BY created_at DESC;

-- Find pending conversions
SELECT * FROM models 
WHERE conversion_status = 'pending' 
AND auto_convert_usdz = true;

-- Find failed conversions
SELECT * FROM models 
WHERE conversion_status = 'failed';
```

### Retry Failed Conversions

```typescript
// Retry conversion for a specific model
async function retryConversion(modelId: string) {
  const supabase = createClient();
  
  // Reset status to pending
  await supabase
    .from('models')
    .update({ conversion_status: 'pending' })
    .eq('id', modelId);
  
  // Get model details
  const { data: model } = await supabase
    .from('models')
    .select('file_url')
    .eq('id', modelId)
    .single();
  
  // Trigger conversion
  await fetch('/api/convert-model', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      modelId,
      glbUrl: model.file_url
    })
  });
}
```

## Troubleshooting

### Conversion Fails

**Check:**
1. Is conversion method configured?
2. Are environment variables set?
3. Is the GLB file valid?
4. Check API logs for errors

**Fix:**
```bash
# Check environment variables
echo $CONVERSION_API_URL
echo $CONVERSION_API_KEY

# Test GLB file
# Open in Blender or online viewer

# Check API logs
# View server logs for error details
```

### USDZ Not Available on iOS

**Check:**
1. Was conversion successful?
2. Is `usdz_url` populated in database?
3. Is USDZ file accessible?

**Fix:**
```sql
-- Check USDZ URL
SELECT id, name, usdz_url, conversion_status 
FROM models 
WHERE id = 'MODEL_ID';

-- If null, trigger conversion
UPDATE models 
SET conversion_status = 'pending' 
WHERE id = 'MODEL_ID';
```

### Conversion Takes Too Long

**Solutions:**
1. Use faster conversion service
2. Optimize GLB file before upload
3. Implement queue system for batch processing

## Best Practices

1. **Always upload GLB files**
   - GLB is the source format
   - USDZ is generated automatically

2. **Monitor conversion status**
   - Check admin panel for failed conversions
   - Retry failed conversions

3. **Optimize models before upload**
   - Reduce file size
   - Compress textures
   - Simplify geometry

4. **Test on both platforms**
   - Android: Test with GLB
   - iOS: Test with USDZ

5. **Provide fallbacks**
   - Show conversion status to users
   - Allow manual USDZ upload if needed

## Migration

### Update Existing Models

```sql
-- Add new columns to existing models
ALTER TABLE models 
ADD COLUMN IF NOT EXISTS usdz_url TEXT,
ADD COLUMN IF NOT EXISTS usdz_path TEXT,
ADD COLUMN IF NOT EXISTS auto_convert_usdz BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS conversion_status TEXT DEFAULT 'pending';

-- Mark all existing models for conversion
UPDATE models 
SET conversion_status = 'pending',
    auto_convert_usdz = true
WHERE usdz_url IS NULL;
```

### Batch Convert Existing Models

```typescript
async function batchConvertModels() {
  const supabase = createClient();
  
  // Get all models without USDZ
  const { data: models } = await supabase
    .from('models')
    .select('id, file_url')
    .is('usdz_url', null);
  
  // Convert each model
  for (const model of models || []) {
    await fetch('/api/convert-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: model.id,
        glbUrl: model.file_url
      })
    });
    
    // Wait between conversions to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

## Summary

✅ **Automatic conversion** - GLB to USDZ on upload
✅ **Platform detection** - Right format for each device
✅ **Multiple methods** - External API, Reality Converter, or Python
✅ **Status tracking** - Monitor conversion progress
✅ **Fallback support** - Manual upload if needed

Your AR system now provides seamless cross-platform support! 🎉
