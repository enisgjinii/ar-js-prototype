# 🚀 Auto-Conversion Quick Start

## What's New?

Your app now **automatically converts GLB to USDZ** for iOS support!

### Before:
- Upload GLB → Works on Android only ❌
- iOS users can't view in AR ❌

### After:
- Upload GLB → Auto-converts to USDZ ✅
- Android users get GLB (Google AR) ✅
- iOS users get USDZ (AR Quick Look) ✅

## How It Works

```
1. Admin uploads GLB file
   ↓
2. System stores GLB in Supabase
   ↓
3. System automatically converts to USDZ
   ↓
4. System stores USDZ in Supabase
   ↓
5. Both files available!
```

## Database Changes

Run this migration:

```sql
-- Add USDZ fields
ALTER TABLE models 
ADD COLUMN IF NOT EXISTS usdz_url TEXT,
ADD COLUMN IF NOT EXISTS usdz_path TEXT,
ADD COLUMN IF NOT EXISTS auto_convert_usdz BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS conversion_status TEXT DEFAULT 'pending';
```

Or use the migration file:
```bash
# Apply migration
psql -d your_database -f supabase/migrations/add_usdz_fields.sql
```

## Setup Conversion Method

Choose ONE of these options:

### Option 1: External API (Easiest) ⭐

```env
# .env.local
CONVERSION_API_URL=https://api.example.com/convert
CONVERSION_API_KEY=your_api_key
```

**Best for:** Production, any platform

### Option 2: Reality Converter (Mac Only)

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify
xcrun usdz_converter --help
```

**Best for:** Mac servers, development

### Option 3: Manual (No Setup)

Convert files manually and upload both:
1. Convert GLB to USDZ locally
2. Upload GLB via admin
3. Upload USDZ to same bucket
4. Update database

**Best for:** Small projects, testing

## Test It

### 1. Upload a Model

```
1. Go to /admin/models/new
2. Upload a GLB file
3. Click "Upload"
```

### 2. Check Conversion Status

```sql
SELECT 
  name, 
  file_url, 
  usdz_url, 
  conversion_status 
FROM models 
ORDER BY created_at DESC 
LIMIT 1;
```

**Status values:**
- `pending` - Waiting to convert
- `converting` - In progress
- `completed` - Done! ✅
- `failed` - Error ❌

### 3. Test on Devices

**Android:**
```
1. Open /ar-viewer on Android phone
2. Select model
3. Click "View in AR"
4. Should open Google AR with GLB ✅
```

**iOS:**
```
1. Open /ar-viewer on iPhone
2. Select model
3. Click "View in AR"
4. Should open AR Quick Look with USDZ ✅
```

## How Files Are Served

The system automatically picks the right format:

```typescript
// Android user
User clicks "View in AR"
→ System detects Android
→ Opens Google AR Scene Viewer
→ Uses GLB file ✅

// iOS user
User clicks "View in AR"
→ System detects iOS
→ Opens AR Quick Look
→ Uses USDZ file ✅
```

## Conversion Status in UI

Users see conversion status:

- 🔄 **Converting** - "Converting to USDZ for iOS..."
- ⏳ **Pending** - "USDZ conversion pending"
- ❌ **Failed** - "USDZ conversion failed"
- ✅ **Completed** - No message (ready to use)

## Troubleshooting

### No conversion happening?

**Check:**
```bash
# 1. Is conversion method configured?
echo $CONVERSION_API_URL

# 2. Check database
SELECT conversion_status FROM models WHERE id = 'MODEL_ID';

# 3. Check API logs
# Look for conversion errors in server logs
```

### iOS shows "USDZ not available"?

**Fix:**
```sql
-- Check if USDZ URL exists
SELECT usdz_url FROM models WHERE id = 'MODEL_ID';

-- If null, retry conversion
UPDATE models 
SET conversion_status = 'pending' 
WHERE id = 'MODEL_ID';
```

### Conversion failed?

**Common causes:**
1. No conversion method configured
2. Invalid GLB file
3. API rate limit exceeded
4. Network error

**Fix:**
```sql
-- Reset and retry
UPDATE models 
SET conversion_status = 'pending' 
WHERE conversion_status = 'failed';
```

## API Usage

### Trigger Conversion Manually

```typescript
const response = await fetch('/api/convert-model', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    modelId: 'uuid-here',
    glbUrl: 'https://your-bucket.supabase.co/.../model.glb'
  })
});

const result = await response.json();
console.log(result.usdzUrl); // USDZ file URL
```

### Check Status

```typescript
const { data: model } = await supabase
  .from('models')
  .select('conversion_status, usdz_url')
  .eq('id', modelId)
  .single();

if (model.conversion_status === 'completed') {
  console.log('USDZ ready:', model.usdz_url);
}
```

## Files Created

| File | Purpose |
|------|---------|
| `app/api/convert-model/route.ts` | Conversion API endpoint |
| `lib/hooks/use-auto-convert.ts` | Auto-conversion hook |
| `supabase/migrations/add_usdz_fields.sql` | Database migration |
| `AUTO_CONVERSION_GUIDE.md` | Full documentation |

## Summary

✅ **Upload GLB** - Admin uploads once
✅ **Auto-convert** - System creates USDZ
✅ **Store both** - Both files in Supabase
✅ **Smart serving** - Right format per platform
✅ **Status tracking** - Monitor progress

**Your AR now works on both Android AND iOS!** 🎉

---

## Next Steps

1. **Run migration** - Add USDZ fields to database
2. **Configure conversion** - Choose a conversion method
3. **Upload test model** - Try it out
4. **Test on devices** - Verify both platforms work

Read `AUTO_CONVERSION_GUIDE.md` for detailed setup instructions!
