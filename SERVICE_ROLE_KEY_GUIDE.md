# Service Role Key Setup Guide

## 🎯 What You Need

To use the Users page, you need to add the **service role key** to your `.env.local` file.

## 📸 Visual Guide

### Step 1: Open Supabase Dashboard

```
1. Go to supabase.com
2. Click on your project
3. You should see the project dashboard
```

### Step 2: Navigate to API Settings

```
Left Sidebar
  └─ ⚙️ Project Settings (at bottom)
      └─ API (in settings menu)
```

### Step 3: Find Service Role Key

You'll see a section called **Project API keys** with two keys:

```
┌─────────────────────────────────────────────────┐
│ Project API keys                                │
├─────────────────────────────────────────────────┤
│                                                 │
│ anon public                                     │
│ This key is safe to use in a browser           │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...        │
│ [Copy]                                          │
│                                                 │
│ service_role secret                             │
│ This key has the ability to bypass Row Level   │
│ Security. Never share it publicly.              │
│ •••••••••••••••••••••••••••••••••••••••••••    │
│ [Reveal] [Copy]                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Step 4: Copy Service Role Key

1. Click **Reveal** on the service_role key
2. Click **Copy** to copy it
3. ⚠️ This is the SECRET key - keep it safe!

### Step 5: Add to .env.local

Open your `.env.local` file and add:

```env
SUPABASE_SERVICE_ROLE_KEY=paste-your-key-here
```

**Complete example:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pwosnfwrgcxoelbnsejs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3b3NuZndyZ2N4b2VsYm5zZWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1MjQwMDAsImV4cCI6MjAwNTEwMDAwMH0.xxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3b3NuZndyZ2N4b2VsYm5zZWpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTUyNDAwMCwiZXhwIjoyMDA1MTAwMDAwfQ.yyy

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 6: Restart Server

```bash
# Stop the server
Ctrl+C (or Cmd+C on Mac)

# Start again
npm run dev
```

### Step 7: Test

Visit: `http://localhost:3000/admin/users`

Should now show the users page! ✅

## 🔐 Security Checklist

- [ ] Service role key added to `.env.local`
- [ ] `.env.local` is in `.gitignore` (already done)
- [ ] Never commit `.env.local` to git
- [ ] Never share service role key publicly
- [ ] Only use service role key server-side

## 🎨 What Each Key Does

### ANON KEY (Public)

```
✅ Safe to expose in browser
✅ Used for client-side operations
✅ Respects Row Level Security
✅ Limited permissions
```

### SERVICE ROLE KEY (Secret)

```
⚠️ Must be kept secret
⚠️ Only used server-side
⚠️ Bypasses Row Level Security
⚠️ Full admin permissions
```

## 📊 Key Comparison

| Feature         | Anon Key        | Service Role Key |
| --------------- | --------------- | ---------------- |
| **Visibility**  | Public          | Secret           |
| **Usage**       | Client & Server | Server only      |
| **Permissions** | Limited         | Full admin       |
| **RLS**         | Enforced        | Bypassed         |
| **Prefix**      | `NEXT_PUBLIC_`  | No prefix        |

## 🚨 Common Mistakes

### ❌ Wrong: Using Anon Key

```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...anon-key...
```

### ✅ Correct: Using Service Role Key

```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...service-role-key...
```

### ❌ Wrong: Extra Spaces

```env
SUPABASE_SERVICE_ROLE_KEY= eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### ✅ Correct: No Spaces

```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### ❌ Wrong: Quotes

```env
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY='eyJ...'
```

### ✅ Correct: No Quotes

```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 🔍 How to Verify

### Check 1: File Exists

```bash
ls -la .env.local
```

Should show the file.

### Check 2: Key is Set

Add this to a server component temporarily:

```typescript
console.log('Has service key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
```

Should print: `Has service key: true`

### Check 3: Users Page Works

Visit `/admin/users` - should show users list.

## 🎊 Success Indicators

When correctly set up:

- ✅ No "User not allowed" error
- ✅ Users page loads
- ✅ User list displays
- ✅ Statistics show correct numbers
- ✅ Search and filters work

## 📚 Related Docs

- [FIX_SERVICE_ROLE_ERROR.md](FIX_SERVICE_ROLE_ERROR.md) - Fix the error
- [USER_PAGE_SETUP.md](USER_PAGE_SETUP.md) - Complete setup
- [USER_MANAGEMENT_FEATURE.md](USER_MANAGEMENT_FEATURE.md) - Feature guide

---

**Quick Summary:**

1. Get service_role key from Supabase Dashboard → Settings → API
2. Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your-key`
3. Restart server: `npm run dev`
4. Visit `/admin/users` ✅
