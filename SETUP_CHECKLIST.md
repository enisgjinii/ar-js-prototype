# Setup Checklist

Use this checklist to ensure your admin panel is properly configured.

## ✅ Installation

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] No installation errors

## ✅ Supabase Project

- [ ] Supabase account created
- [ ] New project created
- [ ] Project fully initialized (not "Setting up...")

## ✅ Environment Variables

- [ ] `.env.local` file created
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] `NEXT_PUBLIC_APP_URL` set
- [ ] No extra spaces or quotes in values

## ✅ Database Setup

- [ ] SQL migration run in Supabase SQL Editor
- [ ] `profiles` table exists (check Table Editor)
- [ ] `voices` table exists (check Table Editor)
- [ ] Row Level Security enabled on both tables
- [ ] Triggers created (check Database > Triggers)

## ✅ Storage Setup

- [ ] `voices` bucket created
- [ ] Bucket is set to **Public**
- [ ] Storage policies created (4 policies total)
- [ ] Policies visible in Storage > Policies

## ✅ Authentication

- [ ] Email provider enabled (default)
- [ ] Email templates configured (optional)
- [ ] Google OAuth configured (optional)
  - [ ] Google Cloud project created
  - [ ] OAuth credentials created
  - [ ] Redirect URI added
  - [ ] Client ID and Secret added to Supabase

## ✅ Application Running

- [ ] Dev server starts without errors (`npm run dev`)
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Home page loads at `http://localhost:3000`

## ✅ Authentication Flow

- [ ] Signup page loads (`/auth/signup`)
- [ ] Can create account with email/password
- [ ] Verification email received
- [ ] Email verification link works
- [ ] Login page loads (`/auth/login`)
- [ ] Can login with credentials
- [ ] Redirected to `/admin` after login
- [ ] Google login button appears (if configured)
- [ ] Google OAuth works (if configured)

## ✅ Admin Panel

- [ ] Admin dashboard loads (`/admin`)
- [ ] Sidebar displays correctly
- [ ] User profile shows in sidebar footer
- [ ] Statistics cards display
- [ ] Voice Management link works
- [ ] Settings link works
- [ ] Logout button works

## ✅ Voice Management

- [ ] Voice list page loads (`/admin/voices`)
- [ ] "Upload Voice" button visible
- [ ] Upload form loads (`/admin/voices/new`)
- [ ] Can select audio file
- [ ] Can fill in name and description
- [ ] Active toggle works
- [ ] Upload succeeds
- [ ] Redirected to voice list
- [ ] Uploaded voice appears in list
- [ ] Can play audio preview
- [ ] Can toggle active/inactive
- [ ] Can delete voice
- [ ] Delete confirmation dialog appears
- [ ] File removed from storage after delete

## ✅ API Endpoints

- [ ] `/api/voices` returns JSON
- [ ] Only active voices returned
- [ ] Response format correct

## ✅ Security

- [ ] Cannot access `/admin` when logged out
- [ ] Redirected to login when accessing protected routes
- [ ] Cannot access other users' files
- [ ] Service role key not exposed in client
- [ ] `.env.local` in `.gitignore`

## ✅ Production Ready (Optional)

- [ ] Code pushed to GitHub
- [ ] `.env.local` not committed
- [ ] Deployed to hosting platform
- [ ] Production environment variables set
- [ ] Production URL updated in Supabase (if using OAuth)
- [ ] Production site loads correctly
- [ ] Authentication works in production
- [ ] File uploads work in production

## Common Issues

### ❌ "Invalid API key"
**Fix:** Check `.env.local` values, restart dev server

### ❌ "relation does not exist"
**Fix:** Run SQL migration in Supabase

### ❌ "Storage bucket not found"
**Fix:** Create `voices` bucket in Supabase Storage

### ❌ "Row Level Security policy violation"
**Fix:** Verify all policies created, check user is authenticated

### ❌ "Failed to upload"
**Fix:** Check storage policies, verify bucket is public

### ❌ Can't access admin panel
**Fix:** Verify user is logged in, check middleware configuration

### ❌ Google OAuth not working
**Fix:** Verify redirect URI, check credentials in Supabase

## Need Help?

If you're stuck on any step:

1. ✅ Check the box for completed steps
2. ❌ Find the first unchecked box
3. 📖 Refer to detailed guides:
   - `QUICK_START.md` - Fast setup
   - `INSTALLATION.md` - Detailed installation
   - `SUPABASE_SETUP.md` - Supabase configuration
   - `README_ADMIN.md` - Admin panel features

## All Done? 🎉

If all boxes are checked, you're ready to:
- Customize the admin panel
- Add more features
- Deploy to production
- Build your application

Congratulations on setting up your admin panel!
