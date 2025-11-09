# 🚨 Quick Fix: Upload Error (400 Bad Request)

## The Problem

You're seeing this error when trying to upload a voice file:

```
POST https://xxx.supabase.co/storage/v1/object/voices/... 400 (Bad Request)
```

## The Solution (2 minutes)

### Step 1: Create Storage Bucket

1. Go to [supabase.com](https://supabase.com) → Your Project
2. Click **Storage** in left sidebar
3. Click **Create a new bucket**
4. Enter:
   - Name: `voices`
   - Public: ✅ **CHECK THIS BOX**
5. Click **Create bucket**

### Step 2: Add Storage Policies

1. Go to **SQL Editor** in Supabase
2. Copy and paste this SQL:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload voices"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'voices' AND auth.role() = 'authenticated');

-- Allow users to update their own files
CREATE POLICY "Users can update their own voice files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'voices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own voice files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'voices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow anyone to view files
CREATE POLICY "Anyone can view voice files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voices');
```

3. Click **Run**

### Step 3: Test Upload

1. Go back to your app: `http://localhost:3000/admin/voices/new`
2. Try uploading again
3. Should work now! ✅

## Still Not Working?

### Check These:

- [ ] Bucket name is exactly `voices` (lowercase)
- [ ] Bucket is marked as **Public**
- [ ] You ran ALL 4 policy commands
- [ ] You're logged into the admin panel
- [ ] Your `.env.local` has correct Supabase credentials

### Get More Help:

- See [STORAGE_SETUP_GUIDE.md](STORAGE_SETUP_GUIDE.md) for detailed troubleshooting
- See [START_HERE.md](START_HERE.md) for complete setup guide

---

**TL;DR:** Create a public bucket named `voices` in Supabase Storage, then run the 4 SQL policy commands.
