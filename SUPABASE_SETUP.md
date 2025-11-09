# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details and wait for setup to complete

## 2. Get Your API Keys

1. Go to Project Settings > API
2. Copy the following values to your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (keep this secret!)

## 3. Run Database Migrations

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL script
4. This will create:
   - `profiles` table for user data
   - `voices` table for audio files
   - Row Level Security policies
   - Triggers for automatic profile creation

## 4. Create Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Click "Create a new bucket"
3. Name it `voices`
4. Make it **public**
5. Click "Create bucket"

## 5. Set Up Storage Policies

Run these SQL commands in the SQL Editor:

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

## 6. Configure Authentication

1. Go to Authentication > Providers
2. Enable **Email** provider (enabled by default)
3. Enable **Google** provider:
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

## 7. Configure Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize the confirmation email template
3. Update the redirect URL if needed

## 8. Environment Variables

Create `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, add these to your hosting platform (Vercel, Netlify, etc.)

## 9. Test the Setup

1. Install dependencies: `npm install`
2. Run the dev server: `npm run dev`
3. Navigate to `http://localhost:3000/auth/signup`
4. Create an account
5. Check your email for verification
6. Login and access `/admin`

## Features Included

- ✅ Email/Password authentication
- ✅ Google OAuth authentication
- ✅ Protected admin routes
- ✅ User profiles with automatic creation
- ✅ Voice file upload to Supabase Storage
- ✅ Voice management (CRUD operations)
- ✅ Active/Inactive voice toggle
- ✅ Audio playback in admin panel
- ✅ Public API endpoint for active voices
- ✅ Row Level Security for data protection

## API Endpoints

### Get Active Voices (Public)
```
GET /api/voices
```

Returns all active voices that should be displayed to users.

## Database Schema

### profiles
- `id` (UUID, Primary Key)
- `email` (TEXT)
- `full_name` (TEXT)
- `avatar_url` (TEXT)
- `role` (TEXT: 'admin' | 'user')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### voices
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `description` (TEXT)
- `file_url` (TEXT)
- `file_path` (TEXT)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `created_by` (UUID, Foreign Key)

## Troubleshooting

### "Invalid API key" error
- Check that your environment variables are correct
- Restart your dev server after updating `.env.local`

### "Row Level Security policy violation"
- Make sure you ran all the SQL migrations
- Check that the policies are created in Supabase dashboard

### Google OAuth not working
- Verify redirect URI in Google Cloud Console
- Check that Google provider is enabled in Supabase
- Make sure Client ID and Secret are correct

### File upload fails
- Verify the `voices` bucket exists and is public
- Check storage policies are created
- Ensure user is authenticated
