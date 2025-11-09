# Quick Start Guide

Get your admin panel running in 5 minutes!

## 1. Install Dependencies (1 min)

```bash
npm install
```

## 2. Set Up Supabase (2 min)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy your credentials from **Project Settings > API**

## 3. Configure Environment (30 sec)

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials.

## 4. Set Up Database (1 min)

1. Open Supabase **SQL Editor**
2. Copy/paste from `supabase/migrations/001_initial_schema.sql`
3. Click **Run**

## 5. Create Storage Bucket (30 sec)

1. Go to **Storage** in Supabase
2. Create bucket named `voices`
3. Make it **Public**

## 6. Run the App (10 sec)

```bash
npm run dev
```

## 7. Create Your Account

1. Visit `http://localhost:3000/auth/signup`
2. Sign up with email/password
3. Verify your email
4. Login at `http://localhost:3000/auth/login`
5. Access admin panel at `http://localhost:3000/admin`

## Done! 🎉

You now have a fully functional admin panel with:
- ✅ Authentication (Email + Google OAuth)
- ✅ Voice file management
- ✅ File upload to Supabase Storage
- ✅ Active/inactive toggle
- ✅ Audio preview
- ✅ Public API endpoint

## What's Next?

- Upload your first voice file
- Customize the dashboard
- Add more features
- Deploy to production

## Need Help?

- Full guide: `INSTALLATION.md`
- Supabase setup: `SUPABASE_SETUP.md`
- Admin features: `README_ADMIN.md`
