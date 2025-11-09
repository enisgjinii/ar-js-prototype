# User Management Page - Setup Guide

## ✅ What Was Added

1. **New sidebar item** - "Users" link in admin sidebar
2. **Users page** - `/admin/users` with complete user management
3. **User list component** - Advanced user display with search/filter
4. **Statistics** - User metrics and analytics

## 🎯 Files Created

```
app/admin/users/
└── page.tsx                    # Main users page

components/admin/
├── sidebar.tsx                 # Updated with Users link
└── user-list.tsx              # User list component (NEW)
```

## 🚀 How to Access

### 1. From Sidebar

Click **"Users"** in the admin sidebar (orange icon 👤)

### 2. Direct URL

Navigate to: `http://localhost:3000/admin/users`

## 📊 What You'll See

### Statistics Dashboard

```
[Total: 25] [Verified: 20] [Unverified: 5] [Recent: 3]
```

### Search & Filters

```
[🔍 Search] [Filter ▼] [Sort ▼] [Export CSV]
```

### User List

```
Each user shows:
- Avatar/Initials
- Name & Email
- Verification status
- Join date
- Last login
- Role (admin/user)
- Quick actions
```

## 🔧 Requirements

### Service Role Key

The users page uses `supabase.auth.admin.listUsers()` which requires the **service role key**.

Make sure your `.env.local` has:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Where to Find It

1. Go to Supabase Dashboard
2. Project Settings > API
3. Copy "service_role" key (keep it secret!)
4. Add to `.env.local`

## ⚠️ Important Notes

### Security

- Service role key has admin privileges
- Never expose it to the client
- Only used server-side
- Protected by middleware

### Data Source

- Fetches from `auth.users` table
- Merges with `profiles` table
- Shows all registered users
- Real-time data

## 🎨 Features Available

### Search

- Search by name
- Search by email
- Real-time filtering
- Case-insensitive

### Filters

- All users
- Verified only
- Unverified only

### Sort

- Newest first (default)
- Oldest first
- Name (A-Z)

### Export

- Download CSV
- All user data
- Filtered results
- Date in filename

### Actions

- Copy email
- Send email
- View details

## 📱 Responsive

Works on:

- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## 🐛 Troubleshooting

### "Error fetching users"

**Cause:** Service role key missing or invalid

**Fix:**

1. Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
2. Verify key is correct
3. Restart dev server

### "No users found"

**Cause:** No users registered yet

**Fix:**

1. Create a test account at `/auth/signup`
2. Refresh users page
3. User should appear

### "Permission denied"

**Cause:** Not logged in as admin

**Fix:**

1. Make sure you're logged in
2. Check middleware is working
3. Verify admin access

## ✅ Verification Checklist

- [ ] Service role key in `.env.local`
- [ ] Dev server restarted
- [ ] Logged into admin panel
- [ ] Can access `/admin/users`
- [ ] Users list displays
- [ ] Search works
- [ ] Filters work
- [ ] Export works

## 🎊 You're Done!

Your user management page is ready to use. You can now:

- ✅ View all users
- ✅ Search and filter
- ✅ Export data
- ✅ Monitor activity
- ✅ Contact users

---

**Next:** Visit `http://localhost:3000/admin/users` to see your users!
