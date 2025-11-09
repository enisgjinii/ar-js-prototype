# 🚨 Fix: Row-Level Security Policy Error

## The Error
```
Upload error: StorageApiError: new row violates row-level security policy
```

## What This Means
✅ Good news: Your storage bucket exists!
❌ Problem: Storage policies are missing

## Quick Fix (1 minute)

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run These 4 Policies

Copy and paste this SQL, then click **Run**:

```sql
-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload voices"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'voices' AND auth.role() = 'authenticated');

-- Policy 2: Allow users to update their own files
CREATE POLICY "Users can update their own voice files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'voices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy 3: Allow users to delete their own files
CREATE POLICY "Users can delete their own voice files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'voices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy 4: Allow anyone to view files (for public playback)
CREATE POLICY "Anyone can view voice files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voices');
```

### Step 3: Verify Policies
1. Go to **Storage** in Supabase
2. Click on **voices** bucket
3. Click **Policies** tab
4. You should see 4 policies listed

### Step 4: Test Upload
1. Go back to your app: `http://localhost:3000/admin/voices/new`
2. Try uploading again
3. Should work now! ✅

## What These Policies Do

| Policy | What It Does |
|--------|--------------|
| **INSERT** | Lets authenticated users upload files |
| **UPDATE** | Lets users update their own files |
| **DELETE** | Lets users delete their own files |
| **SELECT** | Lets anyone view/download files (for public playback) |

## Verify Your Setup

After running the SQL, check:
- [ ] 4 policies appear in Storage > voices > Policies
- [ ] Each policy has a green checkmark
- [ ] Upload now works without errors

## Still Getting Errors?

### Error: "policy already exists"
✅ Good! This means policies are already created. Try uploading again.

### Error: "permission denied"
1. Make sure you're logged into the admin panel
2. Try logging out and back in
3. Check that your user is authenticated

### Error: "bucket not found"
1. Go to Storage in Supabase
2. Verify the `voices` bucket exists
3. Make sure it's set to **Public**

## Alternative: Use Supabase UI

Instead of SQL, you can create policies through the UI:

1. Go to **Storage** > **voices** bucket
2. Click **Policies** tab
3. Click **New Policy**
4. Choose template: **Allow authenticated uploads**
5. Repeat for other policies

## 🎉 Success!

Once policies are set up, you can:
- ✅ Upload audio files
- ✅ See files in Supabase Storage
- ✅ Play audio in admin panel
- ✅ Delete files
- ✅ Toggle active/inactive

## Next Steps

After fixing this:
1. Upload a test voice file
2. Check it appears in `/admin/voices`
3. Try playing the audio
4. Test the public API: `http://localhost:3000/api/voices`

---

**TL;DR:** Run the 4 SQL policy commands in Supabase SQL Editor, then try uploading again.
