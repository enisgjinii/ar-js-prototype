# Installation Guide

## Prerequisites

- Node.js 18+ installed
- npm, pnpm, or yarn package manager
- A Supabase account (free tier works)

## Step-by-Step Installation

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

This will install:

- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Supabase SSR helpers for Next.js
- All existing project dependencies

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up (2-3 minutes)
3. Go to **Project Settings > API** and copy:
   - Project URL
   - Anon/Public key
   - Service Role key (keep this secret!)

### 3. Configure Environment Variables

1. Copy the example file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 4. Set Up Database

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor and click **Run**

This creates:

- `profiles` table for user data
- `voices` table for audio files
- Row Level Security policies
- Automatic triggers for profile creation

### 5. Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Name it: `voices`
4. Make it **Public**
5. Click **Create bucket**

### 6. Set Up Storage Policies

Go back to **SQL Editor** and run:

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

### 7. Configure Authentication Providers

#### Email Authentication (Already Enabled)

Email/password authentication is enabled by default.

#### Google OAuth (Optional)

1. Go to **Authentication > Providers** in Supabase
2. Find **Google** and click to configure
3. You'll need to create OAuth credentials in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to **Credentials > Create Credentials > OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
4. Paste Client ID and Client Secret in Supabase
5. Click **Save**

### 8. Run the Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 9. Test the Setup

1. Navigate to `http://localhost:3000/auth/signup`
2. Create a new account with email/password
3. Check your email for verification link (check spam folder)
4. Click the verification link
5. Go to `http://localhost:3000/auth/login` and login
6. You should be redirected to `http://localhost:3000/admin`

### 10. Upload Your First Voice

1. In the admin panel, click **Voice Management** in the sidebar
2. Click **Upload Voice** button
3. Fill in the form:
   - Name: "Test Voice"
   - Description: "My first voice upload"
   - Select an audio file (MP3, WAV, OGG, or M4A)
   - Toggle "Active Status" on
4. Click **Upload Voice**
5. You should see your voice in the list

## Verify Installation

### Check Database Tables

In Supabase dashboard, go to **Table Editor** and verify:

- ✅ `profiles` table exists
- ✅ `voices` table exists
- ✅ Your profile was created automatically

### Check Storage

In Supabase dashboard, go to **Storage** and verify:

- ✅ `voices` bucket exists
- ✅ Your uploaded file appears in the bucket

### Check API

Open `http://localhost:3000/api/voices` in your browser.
You should see JSON with your active voices.

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub (make sure `.env.local` is in `.gitignore`)
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL, e.g., `https://yourapp.vercel.app`)
4. Deploy
5. Update Google OAuth redirect URI if using Google login:
   - Add `https://yourapp.vercel.app/auth/callback` to authorized redirect URIs

### Other Platforms

The same environment variables work on:

- Netlify
- Railway
- Render
- AWS Amplify
- Any Node.js hosting platform

## Troubleshooting

### "Invalid API key" error

- Double-check your `.env.local` file
- Make sure there are no extra spaces
- Restart your dev server after changing `.env.local`

### "relation does not exist" error

- Make sure you ran the SQL migration
- Check that tables were created in Supabase Table Editor

### "Storage bucket not found" error

- Verify the `voices` bucket exists in Supabase Storage
- Make sure it's set to **Public**

### Google OAuth not working

- Check redirect URI matches exactly
- Verify Google provider is enabled in Supabase
- Make sure Client ID and Secret are correct

### Email verification not received

- Check spam/junk folder
- Verify email settings in Supabase Authentication settings
- Try with a different email provider

## Next Steps

- Read `README_ADMIN.md` for admin panel features
- Read `SUPABASE_SETUP.md` for detailed Supabase configuration
- Customize the admin dashboard design
- Add more features to your application

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase logs in the dashboard
3. Check browser console for errors
4. Verify all environment variables are set correctly
