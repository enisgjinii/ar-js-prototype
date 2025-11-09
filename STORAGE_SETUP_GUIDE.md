# Storage Setup Guide - Fix Upload Errors

## ❌ Error: 400 Bad Request on Upload

If you're seeing this error when trying to upload a voice file:
```
POST https://xxx.supabase.co/storage/v1/object/voices/... 400 (Bad Request)
```

This means the storage bucket hasn't been created yet. Follow these steps:

## ✅ Step-by-Step Fix

### 1. Create the Storage Bucket (2 minutes)

1. Go to your Supabase dashboard: [supabase.com](https://supabase.com)
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **Create a new bucket** button
5. Fill in the form:
   - **Name:** `voices` (must be exactly this)
   - **Public bucket:** ✅ **Check this box** (important!)
   - **File size limit:** Leave default or set to 50MB
   - **Allowed MIME types:** Leave empty (allows all audio files)
6. Click **Create bucket**

### 2. Set Up Storage Policies (1 minute)

After creating the bucket, you need to add policies:

1. Stay in **Storage** section
2. Click on the **voices** bucket
3. Click **Policies** tab
4. Click **New Policy**

Or go to **SQL Editor** and run these commands:

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

-- Allow anyone to view files (for public playback)
CREATE POLICY "Anyone can view voice files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voices');
```

### 3. Verify Setup

1. Go back to **Storage** in Supabase
2. Click on **voices** bucket
3. You should see:
   - ✅ Bucket is **Public**
   - ✅ 4 policies listed under **Policies** tab

### 4. Test Upload

1. Go back to your app: `http://localhost:3000/admin/voices/new`
2. Fill in the form:
   - Name: "Test Voice"
   - Description: "Testing upload"
   - Select an audio file
3. Click **Upload Voice**
4. Should work now! ✅

## 🔍 Troubleshooting

### Still getting 400 error?

**Check 1: Bucket Name**
- Must be exactly `voices` (lowercase, no spaces)
- Check in Supabase Storage that bucket exists

**Check 2: Bucket is Public**
- Go to Storage > voices bucket
- Check that "Public" badge is visible
- If not, edit bucket and make it public

**Check 3: Policies Exist**
- Go to Storage > voices > Policies
- Should see 4 policies
- If not, run the SQL commands above

**Check 4: Authentication**
- Make sure you're logged in
- Try logging out and back in
- Check browser console for auth errors

**Check 5: Environment Variables**
- Verify `.env.local` has correct Supabase URL and keys
- Restart dev server after changing `.env.local`

### Getting "Policy violation" error?

This means policies aren't set up correctly:

1. Go to **SQL Editor** in Supabase
2. Run the policy commands above
3. Verify policies appear in Storage > voices > Policies
4. Try upload again

### Getting "Not authenticated" error?

1. Log out of admin panel
2. Log back in
3. Try upload again
4. If still fails, check Supabase Auth logs

## 📊 Verify Your Setup

Use this checklist:

- [ ] Supabase project created
- [ ] Database migration run (tables created)
- [ ] **Storage bucket "voices" created**
- [ ] **Bucket is set to Public**
- [ ] **4 storage policies created**
- [ ] Environment variables in `.env.local`
- [ ] Logged into admin panel
- [ ] Can access `/admin/voices/new`

## 🎯 Quick Test

After setup, test with this:

1. Go to Supabase Storage > voices
2. Try uploading a file manually through Supabase UI
3. If that works, your bucket is set up correctly
4. If app still fails, check browser console for errors

## 📸 Visual Guide

### Creating Bucket
```
Supabase Dashboard
  └─ Storage
      └─ Create a new bucket
          ├─ Name: voices
          ├─ Public: ✅ (checked)
          └─ Create bucket
```

### Adding Policies
```
Supabase Dashboard
  └─ Storage
      └─ voices bucket
          └─ Policies tab
              └─ New Policy (or use SQL Editor)
```

## 🆘 Still Having Issues?

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click **Logs** in sidebar
3. Select **Storage Logs**
4. Look for errors related to your upload

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try upload again
4. Look for detailed error messages

### Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "Bucket not found" | Bucket doesn't exist | Create `voices` bucket |
| "Policy violation" | Missing policies | Run SQL policy commands |
| "Not authenticated" | Not logged in | Log in again |
| "Invalid bucket" | Wrong bucket name | Must be exactly `voices` |
| "File too large" | File size limit | Increase limit in bucket settings |

## ✅ Success!

Once setup is complete, you should be able to:
- ✅ Upload audio files
- ✅ See files in Supabase Storage
- ✅ Play audio in admin panel
- ✅ Delete files
- ✅ Access files via public URL

## 📚 Related Documentation

- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Complete Supabase setup
- [START_HERE.md](START_HERE.md) - Full setup guide
- [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - Verify your setup

---

**Need help?** Make sure you've completed all steps in [START_HERE.md](START_HERE.md) first!
