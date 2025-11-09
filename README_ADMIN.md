# Admin Panel Setup

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up Supabase:**
   - Follow the detailed guide in `SUPABASE_SETUP.md`
   - Create a Supabase project
   - Run the SQL migration from `supabase/migrations/001_initial_schema.sql`
   - Create the `voices` storage bucket
   - Configure authentication providers

3. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the admin panel:**
   - Sign up: `http://localhost:3000/auth/signup`
   - Login: `http://localhost:3000/auth/login`
   - Admin: `http://localhost:3000/admin`

## Features

### Authentication
- ✅ Email/Password sign up and login
- ✅ Google OAuth integration
- ✅ Protected admin routes
- ✅ Automatic profile creation
- ✅ Session management

### Voice Management
- ✅ Upload audio files to Supabase Storage
- ✅ View all uploaded voices
- ✅ Toggle active/inactive status
- ✅ Play audio preview
- ✅ Edit voice details
- ✅ Delete voices (with confirmation)
- ✅ Automatic file cleanup on delete

### Admin Dashboard
- ✅ Statistics overview
- ✅ Sidebar navigation
- ✅ User profile display
- ✅ Settings page
- ✅ Responsive design

## Project Structure

```
app/
├── admin/                  # Admin panel pages
│   ├── layout.tsx         # Admin layout with sidebar
│   ├── page.tsx           # Dashboard
│   ├── voices/            # Voice management
│   │   ├── page.tsx       # Voice list
│   │   └── new/           # Upload new voice
│   └── settings/          # Settings page
├── auth/                  # Authentication pages
│   ├── login/            # Login page
│   ├── signup/           # Sign up page
│   └── callback/         # OAuth callback
└── api/
    └── voices/           # Public API for voices

components/
└── admin/
    ├── sidebar.tsx       # Admin sidebar
    └── voice-list.tsx    # Voice list component

lib/
└── supabase/
    ├── client.ts         # Browser client
    ├── server.ts         # Server client
    └── middleware.ts     # Auth middleware

supabase/
└── migrations/
    └── 001_initial_schema.sql  # Database schema
```

## Database Schema

### Tables

**profiles**
- User profile information
- Automatically created on sign up
- Links to auth.users

**voices**
- Audio file metadata
- Links to Supabase Storage
- Active/inactive status
- Creator tracking

### Storage

**voices bucket**
- Public bucket for audio files
- Organized by user ID
- Automatic cleanup on delete

## API Endpoints

### Public API

**GET /api/voices**
- Returns all active voices
- No authentication required
- Used by client-side application

Example response:
```json
{
  "voices": [
    {
      "id": "uuid",
      "name": "Welcome Message",
      "description": "Intro audio",
      "file_url": "https://...",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)
4. Deploy

### Other Platforms

Add the same environment variables to your hosting platform:
- Netlify
- Railway
- Render
- AWS Amplify

## Security

- ✅ Row Level Security (RLS) enabled
- ✅ Protected admin routes
- ✅ Secure file uploads
- ✅ User-scoped data access
- ✅ Service role key kept server-side only

## Troubleshooting

See `SUPABASE_SETUP.md` for detailed troubleshooting steps.

## Next Steps

1. Customize the admin dashboard design
2. Add more voice metadata fields
3. Implement voice categories/tags
4. Add analytics and usage tracking
5. Create user roles (admin vs regular user)
6. Add bulk upload functionality
7. Implement voice search and filtering
