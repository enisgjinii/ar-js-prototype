# Admin Panel Quick Reference

## 🚀 5-Minute Setup

```bash
# 1. Install
npm install

# 2. Configure (add your Supabase keys)
cp .env.local.example .env.local

# 3. Run
npm run dev
```

Then follow [START_HERE.md](START_HERE.md) for Supabase setup.

## 📍 Routes

| Route | Description |
|-------|-------------|
| `/auth/login` | Login page |
| `/auth/signup` | Signup page |
| `/admin` | Dashboard |
| `/admin/voices` | Voice management |
| `/admin/voices/new` | Upload voice |
| `/admin/settings` | Settings |
| `/api/voices` | Public API (GET) |

## 🔑 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Database Tables

### profiles
- User profile data
- Auto-created on signup

### voices
- Audio file metadata
- Links to Supabase Storage

## 📦 Storage

### voices bucket
- Public bucket
- Audio files (MP3, WAV, OGG, M4A)
- User-organized folders

## 🔐 Authentication

### Email/Password
- Built-in, enabled by default
- Email verification required

### Google OAuth
- Optional
- Requires Google Cloud setup
- See [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

## 🎯 Common Tasks

### Upload Voice
1. Go to `/admin/voices`
2. Click "Upload Voice"
3. Fill form and select file
4. Click "Upload Voice"

### Toggle Active/Inactive
1. Go to `/admin/voices`
2. Use switch next to voice
3. Changes save automatically

### Delete Voice
1. Go to `/admin/voices`
2. Click trash icon
3. Confirm deletion
4. File removed from storage + database

### Preview Audio
1. Go to `/admin/voices`
2. Click play button
3. Click again to pause

## 🌐 API Usage

### Get Active Voices
```javascript
const response = await fetch('/api/voices')
const { voices } = await response.json()

voices.forEach(voice => {
  console.log(voice.name, voice.file_url)
})
```

### Response Format
```json
{
  "voices": [
    {
      "id": "uuid",
      "name": "Voice Name",
      "description": "Description",
      "file_url": "https://...",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## 🛠️ Supabase Setup

### 1. Database Migration
Run in SQL Editor:
```sql
-- Copy from supabase/migrations/001_initial_schema.sql
```

### 2. Create Storage Bucket
- Name: `voices`
- Public: ✅

### 3. Storage Policies
Run in SQL Editor:
```sql
-- Copy storage policies from migration file
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Check `.env.local`, restart server |
| "relation does not exist" | Run SQL migration |
| "Storage bucket not found" | Create `voices` bucket |
| Can't access admin | Check if logged in |
| Upload fails | Check storage policies |

## 📚 Documentation

| File | Purpose |
|------|---------|
| [START_HERE.md](START_HERE.md) | ⭐ Start here! |
| [QUICK_START.md](QUICK_START.md) | 5-minute guide |
| [INSTALLATION.md](INSTALLATION.md) | Detailed setup |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | Supabase config |
| [README_ADMIN.md](README_ADMIN.md) | Features |
| [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) | Verify setup |

## 🎨 Customization

### Change Sidebar Title
Edit `components/admin/sidebar.tsx`:
```tsx
<h1 className="text-2xl font-bold">Your Title</h1>
```

### Add Navigation Link
Edit `components/admin/sidebar.tsx`:
```tsx
{
  label: 'New Page',
  icon: Icon,
  href: '/admin/new-page',
  color: 'text-blue-500',
}
```

### Modify Colors
Edit Tailwind classes in components

## 🚀 Deployment

### Vercel
```bash
git push origin main
# Import in Vercel
# Add environment variables
# Deploy
```

### Environment Variables (Production)
Same as local, but update:
```env
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

## ✅ Verification

- [ ] Dependencies installed
- [ ] Supabase project created
- [ ] Environment variables set
- [ ] Database migration run
- [ ] Storage bucket created
- [ ] Storage policies created
- [ ] App runs locally
- [ ] Can signup/login
- [ ] Can upload voice
- [ ] Can toggle active/inactive
- [ ] Can delete voice
- [ ] API returns voices

## 🆘 Quick Help

**Setup issues?** → [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
**Supabase issues?** → [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
**Need features?** → [README_ADMIN.md](README_ADMIN.md)

## 📞 Support

1. Check documentation files
2. Review Supabase logs
3. Check browser console
4. Verify environment variables

---

**Ready to start?** Open [START_HERE.md](START_HERE.md) 🚀
