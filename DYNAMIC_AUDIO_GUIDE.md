# Dynamic Audio from Supabase

## Overview

Audio is now **dynamically loaded from Supabase**! No more static audio files - all audio guides are managed through the admin panel and played from the database.

## ✨ What Changed

### Before:
- Static audio file (`/sample-audio.mp3`)
- Hardcoded in the page
- Can't change without redeploying
- No management interface

### After:
- Dynamic audio from Supabase
- Managed via admin panel
- Upload/enable/disable anytime
- Multiple audio tracks
- Switch between tracks

## 🎯 How It Works

### Data Flow:
```
1. Page loads
   ↓
2. Fetches active voices from Supabase
   ↓
3. Displays voice selector (if multiple)
   ↓
4. User selects voice
   ↓
5. Audio source updates
   ↓
6. User clicks Play
   ↓
7. Audio plays from Supabase URL
```

### API Endpoint:
```
GET /api/voices
→ Returns all active voices from database
```

### Component Props:
```typescript
<AudioGuideView
  voices={voices}              // Array from Supabase
  selectedVoice={selectedVoice} // Current voice
  onVoiceChange={setSelectedVoice} // Switch voice
  loadingVoices={loading}      // Loading state
  isPlaying={isPlaying}        // Play state
  onPlay={handlePlay}          // Play handler
  onPause={handlePause}        // Pause handler
  onStop={handleStop}          // Stop handler
/>
```

## 🎮 Features

### 1. **Voice Selection**
- Shows all active voices
- Click to switch between voices
- Highlights selected voice
- Shows voice name and description

### 2. **Dynamic Loading**
- Fetches voices on page load
- Updates audio source automatically
- No page reload needed

### 3. **Audio Controls**
- Play button (sidebar)
- Pause button (sidebar)
- Reset button (sidebar)
- Disabled when no voice available

### 4. **Visual Feedback**
- Loading state while fetching
- "No audio available" if empty
- Voice name displayed
- Description shown

## 📱 User Experience

### Single Voice:
```
1. Page loads
2. Fetches voice from Supabase
3. Shows voice name and description
4. User clicks Play
5. Audio plays
```

### Multiple Voices:
```
1. Page loads
2. Fetches all voices
3. Shows voice selector
4. User selects voice
5. Audio source updates
6. User clicks Play
7. Selected audio plays
8. User can switch to another voice
9. Audio updates automatically
```

## 🔧 Admin Management

### Upload Audio:
```
1. Go to /admin/voices/new
2. Upload audio file
3. Add name: "Historical Tour"
4. Add description: "Learn about the history"
5. Click Upload
```

### Enable/Disable:
```
1. Go to /admin/voices
2. Find your voice
3. Toggle "Active" switch
4. Voice appears/disappears in app
```

### Multiple Voices:
```
1. Upload multiple audio files
2. Enable the ones you want
3. Users can switch between them
4. Perfect for different languages or topics
```

## 🎨 UI Components

### Voice Selector (Multiple Voices):
```
┌─────────────────────────────┐
│ Current Track:              │
│                             │
│ ┌─────────────────────────┐ │
│ │ ✓ Historical Tour       │ │ ← Selected
│ │   Learn about history   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │   Architecture Guide    │ │
│ │   Explore buildings     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Audio Display:
```
┌─────────────────────────────┐
│     [Audio Icon]            │
│   Historical Tour           │ ← Voice name
└─────────────────────────────┘

┌─────────────────────────────┐
│ Historical Tour             │ ← Title
│ Learn about the history...  │ ← Description
└─────────────────────────────┘
```

### Controls:
```
[▶ Play Audio Guide]  ← Enabled when voice available
[⏸ Pause Audio]       ← When playing
[⏹ Stop]              ← When playing
```

## 💾 Database Structure

### Voices Table:
```sql
voices (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### API Response:
```json
{
  "voices": [
    {
      "id": "uuid",
      "name": "Historical Tour",
      "description": "Learn about the history of this site",
      "file_url": "https://...supabase.co/.../audio.mp3",
      "is_active": true
    }
  ]
}
```

## 🔄 State Management

### Page State:
```typescript
const [voices, setVoices] = useState<Voice[]>([]);
const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
const [loadingVoices, setLoadingVoices] = useState(false);
const [isAudioPlaying, setIsAudioPlaying] = useState(false);
```

### Audio Source Update:
```typescript
useEffect(() => {
  if (selectedVoice && audioRef.current) {
    audioRef.current.src = selectedVoice.file_url;
    audioRef.current.load();
    setIsAudioPlaying(false);
  }
}, [selectedVoice]);
```

## 🎯 Use Cases

### Museum Tour:
```
Voice 1: "English Tour"
Voice 2: "German Tour"
Voice 3: "Kids Tour"

User selects language → Plays appropriate tour
```

### Historical Site:
```
Voice 1: "Overview"
Voice 2: "Detailed History"
Voice 3: "Architecture Focus"

User selects topic → Plays relevant audio
```

### Product Demo:
```
Voice 1: "Quick Overview"
Voice 2: "Technical Details"
Voice 3: "User Testimonials"

User selects content → Plays selected audio
```

## 📊 Benefits

### For Users:
- ✅ **Multiple options** - Choose audio track
- ✅ **Dynamic content** - Always up-to-date
- ✅ **Easy switching** - Change tracks anytime
- ✅ **Clear labels** - Know what you're listening to

### For Admins:
- ✅ **Easy management** - Upload via admin panel
- ✅ **No deployment** - Changes live immediately
- ✅ **Enable/disable** - Control availability
- ✅ **Multiple tracks** - Offer variety

### For Developers:
- ✅ **Clean code** - Centralized audio management
- ✅ **Scalable** - Add unlimited voices
- ✅ **Maintainable** - No hardcoded files
- ✅ **Type-safe** - TypeScript interfaces

## 🚀 Testing

### Test Single Voice:
```
1. Upload one voice via /admin/voices/new
2. Enable it
3. Open homepage
4. See voice name displayed
5. Click Play
6. Audio plays from Supabase
```

### Test Multiple Voices:
```
1. Upload multiple voices
2. Enable all
3. Open homepage
4. See voice selector
5. Click different voices
6. Audio source updates
7. Click Play
8. Selected audio plays
```

### Test No Voices:
```
1. Disable all voices
2. Open homepage
3. See "No audio available"
4. Play button disabled
```

## 🔧 Files Changed

**Created:**
- `app/api/voices/route.ts` - API to fetch voices

**Updated:**
- `app/page.tsx` - Fetches and manages voices
- `components/audio-guide-view.tsx` - Displays voice selector

## ✨ Summary

Your audio system now:
- ✅ **Loads from Supabase** - Dynamic content
- ✅ **Multiple voices** - Switch between tracks
- ✅ **Admin managed** - Upload/enable/disable
- ✅ **Auto-updates** - No deployment needed
- ✅ **User-friendly** - Clear selection interface

**Audio guides are now fully dynamic and manageable!** 🎵🎉
