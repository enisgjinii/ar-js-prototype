# 🚨 Quick Fix: Models Bucket Setup

## The Errors

```
StorageApiError: Bucket not found
new row violates row-level security policy
```

## ✅ Quick Fix (3 minutes)

### Step 1: Create Storage Bucket (1 minute)

1. Go to [Supabase Dashboard](https://supabase.com)
2. Open your project
3. Click **Storage** in left sidebar
4. Click **Create a new bucket**
5. Fill in:
   - **Name:** `models` (exactly this!)
   - **Public:** ✅ **CHECK THIS BOX**
6. Click **Create bucket**

### Step 2: Add Storage Policies (1 minute)

1. Go to **SQL Editor** in Supabase
2. Copy and paste this SQL:

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

3. Click **Run**

### Step 3: Run Database Migration (1 minute)

1. Still in **SQL Editor**
2. Open `supabase/migrations/002_models_table.sql` in your project
3. Copy the SQL (the CREATE TABLE part)
4. Paste in SQL Editor
5. Click **Run**

This creates the `models` table.

### Step 4: Test Upload

1. Go back to `http://localhost:3000/admin/models/new`
2. Drag and drop a GLB or GLTF file
3. Fill in name
4. Click **Upload Model**
5. Should work now! ✅

## 📋 Checklist

- [ ] Storage bucket `models` created
- [ ] Bucket is set to **Public**
- [ ] 4 storage policies created
- [ ] `models` table created in database
- [ ] Test upload works

## 🎯 What You're Creating

**Storage Bucket:** `models`
- For GLB/GLTF 3D model files
- Public access for viewing
- User-scoped upload/delete

**Database Table:** `models`
- Stores model metadata
- Links to storage files
- Tracks active/inactive status

## ⚠️ Common Mistakes

### ❌ Wrong: Bucket name is "model" (singular)
### ✅ Correct: Bucket name is "models" (plural)

### ❌ Wrong: Bucket is Private
### ✅ Correct: Bucket is Public

### ❌ Wrong: Forgot to run policies
### ✅ Correct: All 4 policies created

## 🔍 Verify Setup

### Check Bucket
1. Go to Storage in Supabase
2. Should see `models` bucket
3. Should have "Public" badge

### Check Policies
1. Click on `models` bucket
2. Click **Policies** tab
3. Should see 4 policies

### Check Table
1. Go to Table Editor
2. Should see `models` table
3. Should have columns: id, name, file_url, etc.

## 🎊 After Setup

Once complete, you can:
- ✅ Upload GLB/GLTF files
- ✅ Drag and drop models
- ✅ View model list
- ✅ Toggle active/inactive
- ✅ Download models
- ✅ Delete models

---

**Do this now:** Follow the 3 steps above to fix the upload error!
