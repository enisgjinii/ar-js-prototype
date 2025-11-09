# AR Experience with Audio Guide

## Overview

The new **AR Experience** page combines 3D model viewing in AR with audio playback and a navigation sidebar - all in one unified interface!

## ✨ Features

### 1. **Sidebar Navigation**
- Browse all 3D models
- Browse all audio guides
- Quick links to other pages
- Collapsible on mobile
- Always accessible

### 2. **AR Model Viewing**
- View 3D models in augmented reality
- Platform-specific AR (Android/iOS)
- Automatic format selection (GLB/USDZ)
- Model details and descriptions
- Conversion status indicators

### 3. **Audio Playback**
- Play audio guides while viewing AR
- Full audio controls (play, pause, skip)
- Progress bar with time display
- Mute/unmute toggle
- Switch between audio tracks
- Fixed bottom player (always visible)

### 4. **Responsive Design**
- Desktop: Sidebar always visible
- Mobile: Collapsible sidebar with overlay
- Touch-friendly controls
- Optimized for all screen sizes

## 🎯 Use Cases

### Museum/Gallery Experience
```
User opens AR Experience
→ Selects artifact model from sidebar
→ Views artifact in AR in their space
→ Plays audio guide to learn about it
→ Switches to next artifact
→ Audio continues playing
```

### Product Showcase
```
User browses products in sidebar
→ Selects product to view in AR
→ Places product in their room
→ Listens to product description
→ Compares with other products
→ Makes informed decision
```

### Educational Content
```
Student selects 3D model (e.g., anatomy)
→ Views model in AR
→ Plays educational audio
→ Learns while interacting
→ Switches between topics
→ Complete learning experience
```

## 📍 Pages

| Page | URL | Purpose |
|------|-----|---------|
| **AR Experience** | `/ar-experience` | Full experience with audio + sidebar |
| AR Viewer | `/ar-viewer` | Simple AR viewer (models only) |
| Model Gallery | `/models` | Browse models in grid view |

## 🎨 Layout

```
┌─────────────────────────────────────────┐
│  Sidebar    │  Top Bar                  │
│             ├───────────────────────────┤
│  Models:    │                           │
│  • Chair    │  AR Content Area          │
│  • Table    │  (Model viewer)           │
│  • Lamp     │                           │
│             │                           │
│  Audio:     │                           │
│  • Guide 1  │                           │
│  • Guide 2  │                           │
│             ├───────────────────────────┤
│             │  Audio Player (Fixed)     │
└─────────────┴───────────────────────────┘
```

## 🎮 Controls

### Sidebar
- **Desktop**: Always visible on left
- **Mobile**: Tap menu icon to open/close
- **Click model**: Switch to that model
- **Click audio**: Switch to that audio track

### Audio Player
- **Play/Pause**: Toggle audio playback
- **Skip Back**: Previous audio track
- **Skip Forward**: Next audio track
- **Mute**: Toggle audio mute
- **Progress Bar**: Shows playback progress

### AR Viewing
- **View in AR**: Launch native AR viewer
- **Platform Detection**: Automatic (Android/iOS)
- **Format Selection**: Automatic (GLB/USDZ)

## 🚀 How to Use

### For Admins

1. **Upload Models**
   ```
   /admin/models/new
   → Upload GLB files
   → Models appear in AR Experience
   ```

2. **Upload Audio**
   ```
   /admin/voices/new
   → Upload audio files
   → Audio appears in AR Experience
   ```

3. **Enable Content**
   ```
   /admin/models or /admin/voices
   → Toggle "Active" switch
   → Content becomes available
   ```

### For Users

1. **Open AR Experience**
   ```
   Visit: /ar-experience
   ```

2. **Browse Content**
   ```
   Sidebar shows:
   • All active 3D models
   • All active audio guides
   ```

3. **View in AR**
   ```
   • Select model from sidebar
   • Click "View in AR"
   • Place in your space
   ```

4. **Play Audio**
   ```
   • Select audio from sidebar
   • Click play in bottom player
   • Listen while viewing AR
   ```

## 📱 Mobile Experience

### Sidebar Behavior
- **Closed by default** on mobile
- **Tap menu icon** to open
- **Tap outside** to close
- **Overlay darkens** background

### Audio Player
- **Always visible** at bottom
- **Touch-friendly** controls
- **Swipe-friendly** progress bar

### AR Viewing
- **Full-screen** AR experience
- **Native AR apps** (Google AR / AR Quick Look)
- **Seamless** transition

## 🎯 Integration

### Add to Navigation

Already added to admin sidebar:
```typescript
{
  label: 'AR Experience',
  icon: Box,
  href: '/ar-experience',
  color: 'text-blue-500',
}
```

### Link from Other Pages

```tsx
import Link from 'next/link';

<Link href="/ar-experience">
  <Button>Open AR Experience</Button>
</Link>
```

### Direct Model Link

```tsx
// Link to specific model
<Link href="/ar-experience?model=MODEL_ID">
  <Button>View This Model in AR</Button>
</Link>
```

## 🎨 Customization

### Change Colors

```tsx
// In ar-viewer-with-audio.tsx
className="bg-gradient-to-r from-blue-600 to-purple-600"
// Change to your brand colors
```

### Add More Sidebar Sections

```tsx
// Add new section in sidebar
<div className="p-4 border-t">
  <h3 className="font-semibold mb-3">
    Your Section
  </h3>
  {/* Your content */}
</div>
```

### Customize Audio Player

```tsx
// Modify audio player in ar-viewer-with-audio.tsx
<div className="bg-white dark:bg-gray-800 border-t p-4">
  {/* Your custom player */}
</div>
```

## 🔧 Technical Details

### Data Loading

```typescript
// Fetches from Supabase
const models = await supabase
  .from('models')
  .select('*')
  .eq('is_active', true);

const voices = await supabase
  .from('voices')
  .select('*')
  .eq('is_active', true);
```

### State Management

```typescript
// React state for UI
const [selectedModel, setSelectedModel] = useState<Model | null>(null);
const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [sidebarOpen, setSidebarOpen] = useState(false);
```

### Audio Handling

```typescript
// HTML5 Audio API
const audioRef = useRef<HTMLAudioElement | null>(null);

// Play/Pause
audioRef.current?.play();
audioRef.current?.pause();

// Time tracking
audioRef.current?.addEventListener('timeupdate', updateTime);
```

## 📊 Benefits

### For Users
- ✅ **All-in-one** experience
- ✅ **Easy navigation** with sidebar
- ✅ **Audio + AR** together
- ✅ **Seamless** switching
- ✅ **Mobile-friendly**

### For Admins
- ✅ **Reuses existing** content
- ✅ **No extra setup** needed
- ✅ **Automatic updates** from database
- ✅ **Easy to manage**

### For Developers
- ✅ **Clean code** structure
- ✅ **Reusable** components
- ✅ **Type-safe** TypeScript
- ✅ **Well-documented**

## 🎉 Summary

The AR Experience page provides:
- ✅ **Sidebar** for easy navigation
- ✅ **AR viewing** for 3D models
- ✅ **Audio playback** for guides
- ✅ **Responsive** design
- ✅ **All-in-one** interface

**Perfect for museums, galleries, education, e-commerce, and more!** 🚀

---

## Quick Links

- **Try it**: `/ar-experience`
- **Admin**: `/admin/models` and `/admin/voices`
- **Component**: `components/ar-viewer-with-audio.tsx`
- **Page**: `app/ar-experience/page.tsx`
