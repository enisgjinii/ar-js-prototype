# 3D Models Setup Guide

## ✅ What Was Added

1. **New sidebar item** - "3D Models" link (green box icon)
2. **Models page** - `/admin/models` with statistics
3. **Upload page** - `/admin/models/new` with drag and drop
4. **Model list** - Advanced display with actions
5. **Database table** - `models` table for metadata
6. **Storage bucket** - `models` bucket for files

## 🚀 Setup Steps

### Step 1: Run Database Migration (2 minutes)

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Open `supabase/migrations/002_models_table.sql`
4. Copy ALL the SQL code
5. Paste in SQL Editor
6. Click **Run**

This creates:
- `models` table
- Row Level Security policies
- Triggers for timestamps

### Step 2: Create Storage Bucket (1 minute)

1. Go to Supabase → **Storage**
2. Click **Create a new bucket**
3. Name: `models` (exactly this)
4. Make it **Public** ✅
5. Click **Create bucket**

### Step 3: Add Storage Policies (1 minute)

Go to **SQL Editor** and run:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload models"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'models' AND auth.role() = 'authenticated');

-- Allow users to update their own files
CREATE POLICY "Users can update their own model files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'models' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own model files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'models' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow anyone to view files
CREATE POLICY "Anyone can view model files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'models');
```

### Step 4: Test Upload (1 minute)

1. Go to `http://localhost:3000/admin/models`
2. Click **Upload Model**
3. Drag and drop a GLB or GLTF file
4. Fill in name and description
5. Click **Upload Model**
6. Should work! ✅

## 📁 Files Created

```
app/admin/models/
├── page.tsx                    # Models list page
└── new/
    └── page.tsx                # Upload page with drag & drop

components/admin/
├── sidebar.tsx                 # Updated with Models link
└── model-list.tsx             # Model list component (NEW)

supabase/migrations/
└── 002_models_table.sql       # Database migration (NEW)
```

## 🎯 Access Points

### From Sidebar
Click **"3D Models"** in the admin sidebar (green box icon 📦)

### Direct URLs
- **Models List:** `http://localhost:3000/admin/models`
- **Upload:** `http://localhost:3000/admin/models/new`

## 🎨 Features Available

### Drag and Drop
- Drag GLB/GLTF files onto upload zone
- Visual feedback when dragging
- File validation
- Auto-naming from filename

### File Management
- View all models
- Toggle active/inactive
- Copy public URL
- Download files
- Edit details
- Delete models

### Statistics
- Total models count
- Active models count
- Inactive models count
- Recent uploads (24h)

## 📊 Supported Files

### GLB Files
- **Extension:** `.glb`
- **Type:** Binary
- **Best for:** Web delivery
- **Size:** Typically smaller

### GLTF Files
- **Extension:** `.gltf`
- **Type:** JSON + assets
- **Best for:** Editing
- **Size:** Larger (multiple files)

## ⚠️ Important Notes

### File Size Limit
- Default: 50MB per file
- Can be increased in Supabase settings
- Larger files take longer to upload

### Storage Bucket
- Must be named exactly `models`
- Must be set to **Public**
- Policies must be created

### File Types
- Only GLB and GLTF accepted
- Other formats will be rejected
- Validation happens on upload

## 🔍 Troubleshooting

### "Storage bucket not found"
**Fix:** Create the `models` bucket in Supabase Storage

### "Policy violation"
**Fix:** Run the storage policy SQL commands

### "Upload failed"
**Fix:** Check file is GLB or GLTF, under 50MB

### Can't see models
**Fix:** Make sure you're logged in and bucket is public

## ✅ Verification Checklist

- [ ] Database migration run
- [ ] `models` table exists
- [ ] Storage bucket `models` created
- [ ] Bucket is set to Public
- [ ] Storage policies created
- [ ] Can access `/admin/models`
- [ ] Can upload a test file
- [ ] File appears in list
- [ ] Can toggle active/inactive
- [ ] Can download file

## 🎯 Quick Test

1. Find a GLB or GLTF file (or download a free one)
2. Go to `/admin/models/new`
3. Drag file onto upload zone
4. Enter name: "Test Model"
5. Click "Upload Model"
6. Should see it in the list! ✅

## 📚 Where to Get Test Models

Free 3D models in GLB/GLTF format:
- **Sketchfab** - sketchfab.com (download as GLB)
- **Poly Haven** - polyhaven.com
- **Google Poly** - Archive available
- **Three.js Examples** - threejs.org/examples

## 🎊 You're Done!

Your 3D model management system is ready. You can now:
- ✅ Upload GLB/GLTF files
- ✅ Drag and drop models
- ✅ Manage model library
- ✅ Toggle visibility
- ✅ Share model URLs

---

**Next:** Visit `http://localhost:3000/admin/models` and upload your first 3D model!
