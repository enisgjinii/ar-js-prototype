# Fix: "User not allowed" Error

## 🚨 The Error

When accessing `/admin/users`, you see:
```
AuthApiError: User not allowed
```

## 🔍 What This Means

The users page needs the **service role key** to access Supabase Auth admin functions. This key is missing or incorrect in your `.env.local` file.

## ✅ Quick Fix (2 minutes)

### Step 1: Get Your Service Role Key

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Click **Project Settings** (gear icon)
4. Click **API** in the left menu
5. Scroll to **Project API keys**
6. Find the **service_role** key (NOT the anon key!)
7. Click **Copy** or **Reveal** and copy it

### Step 2: Add to .env.local

1. Open `.env.local` in your project root
2. Add this line (or update if it exists):

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual service role key.

### Step 3: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 4: Test

1. Go to `http://localhost:3000/admin/users`
2. Should work now! ✅

## 📋 Complete .env.local Example

Your `.env.local` should have all three keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ⚠️ Important Security Notes

### Service Role Key
- **Has admin privileges** - can bypass Row Level Security
- **Must be kept secret** - never commit to git
- **Server-side only** - never expose to client
- **Different from anon key** - don't confuse them!

### What Each Key Does

| Key | Purpose | Where Used | Security |
|-----|---------|------------|----------|
| **ANON_KEY** | Public API access | Client & Server | Public, safe to expose |
| **SERVICE_ROLE_KEY** | Admin operations | Server only | Secret, never expose |

## 🔍 Troubleshooting

### Still getting "User not allowed"?

**Check 1: Correct Key**
- Make sure you copied the **service_role** key, not the anon key
- Service role keys are usually longer
- They start with `eyJ...`

**Check 2: No Extra Spaces**
- Remove any spaces before/after the key
- No quotes around the key
- Just: `SUPABASE_SERVICE_ROLE_KEY=eyJ...`

**Check 3: Server Restarted**
- Stop dev server completely (Ctrl+C)
- Start again: `npm run dev`
- Changes to `.env.local` require restart

**Check 4: File Location**
- `.env.local` must be in project root
- Same folder as `package.json`
- Not in a subfolder

**Check 5: File Name**
- Must be exactly `.env.local`
- Not `.env` or `env.local`
- The dot at the start is important

### How to Verify

Check your environment variables are loaded:

```typescript
// In a server component
console.log('Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
```

Should print: `Service role key exists: true`

## 🎯 Why This Key is Needed

The users page uses:
```typescript
await supabase.auth.admin.listUsers()
```

This is an **admin function** that:
- Lists all users in your project
- Bypasses Row Level Security
- Requires service role privileges
- Only works server-side

Without the service role key, Supabase returns "User not allowed".

## 📖 Visual Guide

### Where to Find the Key

```
Supabase Dashboard
  └─ Project Settings (⚙️)
      └─ API
          └─ Project API keys
              ├─ anon public (for client)
              └─ service_role (for admin) ← THIS ONE!
```

### What to Copy

```
❌ Wrong: anon key
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...

✅ Correct: service_role key
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   (usually longer than anon key)
```

## 🚀 After Fixing

Once the service role key is added:
- ✅ Users page will load
- ✅ You'll see all registered users
- ✅ Search and filters will work
- ✅ Export will work

## 🎊 Summary

**Problem:** Service role key missing
**Solution:** Add to `.env.local` and restart server
**Time:** 2 minutes
**Difficulty:** Easy

---

**Need more help?** See [USER_PAGE_SETUP.md](USER_PAGE_SETUP.md) for complete setup guide.
