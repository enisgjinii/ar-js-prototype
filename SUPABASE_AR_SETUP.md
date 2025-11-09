# Supabase AR Integration Guide

## Overview

Your app now loads 3D models from Supabase database and displays them in AR! This works similar to how audio files are managed - upload models via admin panel, enable/disable them, and users can view them in AR.

## Database Schema

The `models` table already exists with this structure:

```sql
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

## Storage Bucket

Models are stored in the `models` storage bucket in Supabase.

### Bucket Configuration

```typescript
// Bucket settings
{
  name: 'models',
  public: true,
  fileSizeLimit: 52428800, // 50MB
  allowedMimeTypes: [
    'model/gltf-binary',      // .glb
    'model/gltf+json',        // .gltf
    'model/vnd.usdz+zip'      // .usdz (iOS)
  ]
}
```

## How It Works

### 1. Admin Upload (Already Working)

Admins can upload models via `/admin/models/new`:
- Upload GLB/GLTF files
- Add name and description
- Toggle active/inactive status
- Files stored in Supabase Storage
- Metadata saved to database

### 2. Model Management (Already Working)

Admins can manage models via `/admin/models`:
- View all uploaded models
- Enable/disable models (like audio)
- Edit model details
- Delete models
- **NEW: View in AR button** (blue eye icon)

### 3. Public AR Viewing (NEW!)

Users can view models in AR via:

#### Option A: AR Viewer Page
```
/ar-viewer
```
- Shows all active models
- Select model from sidebar
- Click "View in AR" button
- Opens native AR (Google AR or AR Quick Look)

#### Option B: Direct Model Link
```
/ar-viewer?model=MODEL_ID
```
- Opens specific model directly
- Great for sharing links
- Auto-selects the model

#### Option C: Gallery View
```
/models
```
- Grid view of all models
- Click any model to view in AR
- Similar to product catalog

#### Option D: Legacy AR Page
```
/ar
```
- Redirects to first active model
- Backwards compatible

## Usage Examples

### Admin: Upload Model

1. Go to `/admin/models`
2. Click "Upload Model"
3. Fill in details:
   - Name: "Modern Chair"
   - Description: "Stylish modern chair for living room"
   - File: Upload `chair.glb`
4. Click "Upload"
5. Model appears in list with toggle switch

### Admin: Enable AR Viewing

1. Go to `/admin/models`
2. Find your model
3. Toggle switch to "Active" (green)
4. Click blue eye icon to preview in AR
5. Share the AR viewer link with users

### User: View in AR

1. Visit `/ar-viewer` or `/models`
2. Select a model
3. Click "View in AR"
4. On Android: Google AR opens
5. On iOS: AR Quick Look opens
6. Place model in your space!

## Component Architecture

### ARModelViewer Component

Main component for viewing models from database:

```tsx
import ARModelViewer from '@/components/ar-model-viewer';

<ARModelViewer 
  models={models}              // Array of models from Supabase
  selectedModelId="uuid"       // Optional: Pre-select model
  onBack={() => router.back()} // Optional: Back button handler
  showInactive={false}         // Optional: Show inactive models
/>
```

Features:
- ✅ Model list sidebar
- ✅ Model details display
- ✅ Platform detection (iOS/Android/Desktop)
- ✅ AR launch button
- ✅ Copy URL / Download options
- ✅ Active/Inactive badge
- ✅ Responsive design

### ARModelGallery Component

Grid view for browsing models:

```tsx
import ARModelGallery from '@/components/ar-model-gallery';

<ARModelGallery 
  models={arModels}
  columns={3}
  showCategory={true}
/>
```

### ModelARLauncherButton Component

Simple AR button for any page:

```tsx
import ModelARLauncherButton from '@/components/model-ar-launcher';

<ModelARLauncherButton 
  modelUrl={model.file_url}
  modelTitle={model.name}
>
  📱 View in AR
</ModelARLauncherButton>
```

## API Routes

### Fetch Active Models

```typescript
const supabase = createClient();

const { data: models } = await supabase
  .from('models')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: false });
```

### Fetch Single Model

```typescript
const { data: model } = await supabase
  .from('models')
  .select('*')
  .eq('id', modelId)
  .single();
```

### Toggle Model Status

```typescript
const { error } = await supabase
  .from('models')
  .update({ is_active: !currentState })
  .eq('id', modelId);
```

## Pages Created

| Page | URL | Purpose |
|------|-----|---------|
| AR Viewer | `/ar-viewer` | Main AR viewing interface |
| Model Gallery | `/models` | Browse all models |
| AR Redirect | `/ar` | Redirects to first model |
| Admin Models | `/admin/models` | Manage models (existing) |

## Features

### ✅ What Works Now

1. **Upload Models** - Admin can upload GLB/GLTF files
2. **Enable/Disable** - Toggle models on/off like audio
3. **View in AR** - Click eye icon in admin to preview
4. **Public Gallery** - Users can browse all active models
5. **Direct Links** - Share specific model AR links
6. **Platform Detection** - Auto-detects iOS/Android
7. **Native AR** - Uses Google AR or AR Quick Look
8. **Responsive** - Works on all screen sizes

### 🎯 Similar to Audio System

Just like the voice/audio system:

| Feature | Audio | 3D Models |
|---------|-------|-----------|
| Upload | ✅ `/admin/voices/new` | ✅ `/admin/models/new` |
| List | ✅ Voice list with play | ✅ Model list with AR view |
| Toggle | ✅ Active/Inactive switch | ✅ Active/Inactive switch |
| Preview | ✅ Play button | ✅ AR view button |
| Public View | ✅ Audio player | ✅ AR viewer |
| Storage | ✅ Supabase Storage | ✅ Supabase Storage |
| Database | ✅ `voices` table | ✅ `models` table |

## Testing

### Test Admin Upload

1. Go to `/admin/models/new`
2. Upload a test GLB file
3. Check it appears in `/admin/models`
4. Toggle it active
5. Click eye icon to view in AR

### Test Public Viewing

1. Open `/ar-viewer` on your phone
2. Select a model
3. Click "View in AR"
4. Verify AR opens correctly

### Test Gallery

1. Open `/models`
2. See all active models
3. Click "View in AR" on any model
4. Verify it opens AR viewer

## File Format Support

### Android (Google AR)
- ✅ GLB (recommended)
- ✅ GLTF
- ✅ Embedded textures
- ✅ External textures
- ✅ Animations

### iOS (AR Quick Look)
- ✅ USDZ only
- ⚠️ Need to convert GLB to USDZ
- ✅ PBR materials

### Conversion

For iOS support, convert GLB to USDZ:

```bash
# Mac only
xcrun usdz_converter input.glb output.usdz
```

Or use online converters:
- Reality Converter (Mac app)
- Autodesk online converter

## Troubleshooting

### Models not showing in AR viewer

**Check:**
1. Is model marked as `is_active: true`?
2. Is file_url accessible?
3. Is file format GLB/GLTF?

**Fix:**
```sql
-- Check model status
SELECT id, name, is_active, file_url FROM models;

-- Enable model
UPDATE models SET is_active = true WHERE id = 'MODEL_ID';
```

### AR button doesn't work

**Check:**
1. Are you on mobile device?
2. Is it iOS or Android?
3. Is file URL accessible?

**Fix:**
- Test on actual device (not emulator)
- Check browser console for errors
- Verify file URL in browser

### File upload fails

**Check:**
1. File size < 50MB?
2. File type is GLB/GLTF?
3. Storage bucket exists?

**Fix:**
```typescript
// Check storage bucket
const { data: buckets } = await supabase.storage.listBuckets();
console.log(buckets);

// Create bucket if missing
await supabase.storage.createBucket('models', {
  public: true,
  fileSizeLimit: 52428800
});
```

## Security

### Row Level Security (RLS)

```sql
-- Public read access for active models
CREATE POLICY "Active models are viewable by everyone"
  ON models FOR SELECT
  USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage models"
  ON models FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### Storage Policies

```sql
-- Public read access
CREATE POLICY "Models are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'models');

-- Admin upload access
CREATE POLICY "Admins can upload models"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'models' AND
    auth.jwt() ->> 'role' = 'admin'
  );
```

## Next Steps

1. **Upload test models** to `/admin/models/new`
2. **Enable models** using toggle switch
3. **Test AR viewing** on mobile device
4. **Share links** with users
5. **Monitor usage** via admin panel

## Resources

- Admin Panel: `/admin/models`
- AR Viewer: `/ar-viewer`
- Model Gallery: `/models`
- Documentation: `NATIVE_AR_GUIDE.md`

---

**Your AR system is now fully integrated with Supabase!** 🎉

Upload models via admin panel, enable them, and users can view them in AR on their phones. It works exactly like the audio system but for 3D models!
