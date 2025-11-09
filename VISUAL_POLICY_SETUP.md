# Visual Guide: Add Storage Policies

## 🎯 Goal

Fix the "row-level security policy" error by adding 4 storage policies.

## 📸 Step-by-Step with Screenshots

### Step 1: Open SQL Editor

```
Supabase Dashboard
  └─ Left Sidebar
      └─ Click "SQL Editor" 📝
          └─ Click "New query" button
```

### Step 2: Copy the SQL

Copy this entire block:

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

-- Policy 4: Allow anyone to view files
CREATE POLICY "Anyone can view voice files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voices');
```

### Step 3: Paste and Run

```
SQL Editor
  ├─ Paste the SQL code
  └─ Click "Run" button (or press Cmd/Ctrl + Enter)
```

### Step 4: Verify Success

You should see:

```
Success. No rows returned
```

This is normal! It means the policies were created.

### Step 5: Check Policies

```
Supabase Dashboard
  └─ Storage
      └─ voices bucket
          └─ Policies tab
              └─ Should see 4 policies ✅
```

## 🎨 What You'll See

### Before (0 policies)

```
┌─────────────────────────────────┐
│ voices bucket                   │
├─────────────────────────────────┤
│ Policies (0)                    │
│                                 │
│ No policies yet                 │
│ Click "New Policy" to add       │
└─────────────────────────────────┘
```

### After (4 policies)

```
┌─────────────────────────────────┐
│ voices bucket                   │
├─────────────────────────────────┤
│ Policies (4)                    │
│                                 │
│ ✅ Authenticated users can...   │
│ ✅ Users can update their...    │
│ ✅ Users can delete their...    │
│ ✅ Anyone can view voice...     │
└─────────────────────────────────┘
```

## 🔍 Troubleshooting

### "Policy already exists"

✅ **Good!** This means you already ran the command. Skip to testing.

### "Permission denied"

❌ Make sure you're the project owner or have admin access.

### "Relation does not exist"

❌ The storage bucket might not exist. Create it first:

1. Go to Storage
2. Create bucket named `voices`
3. Make it Public
4. Then run the policies

### "Syntax error"

❌ Make sure you copied the ENTIRE SQL block, including all 4 policies.

## ✅ Verify It Worked

### Test 1: Check Policies in UI

1. Go to Storage > voices > Policies
2. Count the policies
3. Should see exactly 4

### Test 2: Try Upload

1. Go to your app: `http://localhost:3000/admin/voices/new`
2. Upload a test file
3. Should work without errors! ✅

### Test 3: Check Storage

1. Go to Storage > voices in Supabase
2. You should see your uploaded file
3. Organized in a folder by user ID

## 🎯 Quick Reference

| What                | Where                       | Action             |
| ------------------- | --------------------------- | ------------------ |
| **Add Policies**    | SQL Editor                  | Run 4 SQL commands |
| **Verify Policies** | Storage > voices > Policies | See 4 policies     |
| **Test Upload**     | Your app                    | Upload audio file  |
| **Check Files**     | Storage > voices            | See uploaded files |

## 📋 Policy Summary

| Policy Name   | What It Does                    | Why Needed          |
| ------------- | ------------------------------- | ------------------- |
| Upload voices | Lets authenticated users upload | Required for upload |
| Update files  | Lets users update their files   | For future edits    |
| Delete files  | Lets users delete their files   | For delete button   |
| View files    | Lets anyone view files          | For public playback |

## 🚀 After Setup

Once policies are added, you can:

- ✅ Upload audio files from admin panel
- ✅ Files stored in Supabase Storage
- ✅ Play audio preview
- ✅ Delete files
- ✅ Public API returns file URLs
- ✅ Users can play audio in your app

## 🎊 You're Almost Done!

After adding these 4 policies:

1. Upload will work ✅
2. Admin panel fully functional ✅
3. Ready for production ✅

---

**Next:** Run the SQL commands, then test your upload!
