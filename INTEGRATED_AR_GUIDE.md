# Integrated AR in Audio Guide

## Overview

AR viewing is now **integrated directly into your Audio Guide page**! Users can switch between Audio and AR without leaving the page or losing their audio playback.

## ✨ What Changed

### Before:
- Audio Guide page
- Clicking AR → Navigates to new page
- Audio stops playing
- Separate experience

### After:
- Audio Guide page with AR toggle
- Clicking "AR View" → Shows AR in same page
- Audio keeps playing
- Unified experience

## 🎯 Features

### 1. **Toggle Between Views**
- **Audio Guide** button - Shows audio content
- **AR View** button - Shows 3D models
- Seamless switching
- No page navigation

### 2. **Persistent Sidebar**
- Theme switcher (light/dark)
- Language switcher (EN/DE)
- Audio controls (play, pause, reset)
- Always visible on left side
- Works in both Audio and AR views

### 3. **AR Integration**
- Browse available 3D models
- Select model to view
- Launch AR viewer
- Platform detection (Android/iOS)
- Automatic format selection (GLB/USDZ)

### 4. **Audio Continues Playing**
- Audio doesn't stop when switching to AR
- Control audio from sidebar
- Listen to audio guide while viewing AR
- Perfect for museum/gallery experiences

## 📱 User Experience

### Audio Guide Mode:
```
1. User opens homepage
2. Sees Audio Guide content
3. Clicks Play in sidebar
4. Audio starts playing
5. Can switch theme/language
```

### Switching to AR:
```
1. User clicks "AR View" button
2. Page shows AR content (no navigation!)
3. Audio keeps playing
4. User selects 3D model
5. Clicks "View in AR"
6. Native AR opens
7. Returns to page, audio still playing
```

## 🎨 Layout

```
┌────────────────────────────────────────┐
│  [Sidebar]                             │
│  • Theme                               │
│  • Language                            │
│  • Audio Controls                      │
│                                        │
│         [Audio Guide] [AR View]        │
│                                        │
│         ┌──────────────────┐          │
│         │                  │          │
│         │  Content Area    │          │
│         │  (Audio or AR)   │          │
│         │                  │          │
│         └──────────────────┘          │
│                                        │
│         [Bottom Navigation]            │
└────────────────────────────────────────┘
```

## 🔧 How It Works

### Component Structure

```typescript
// AudioGuideView component now has:
const [showARView, setShowARView] = useState(false);

// Toggle between views
<Button onClick={() => setShowARView(false)}>Audio Guide</Button>
<Button onClick={() => setShowARView(true)}>AR View</Button>

// Conditional rendering
{!showARView ? (
  // Audio Guide UI
) : (
  // AR View UI
)}
```

### Data Loading

```typescript
// Fetches models when AR view is opened
useEffect(() => {
  if (showARView && models.length === 0) {
    fetchModels(); // Calls /api/models
  }
}, [showARView]);
```

### API Endpoint

```typescript
// GET /api/models
// Returns all active 3D models
{
  models: [
    {
      id: "uuid",
      name: "Model Name",
      description: "Description",
      file_url: "https://.../model.glb",
      usdz_url: "https://.../model.usdz",
      file_type: "glb",
      is_active: true
    }
  ]
}
```

## 🎮 Controls

### Sidebar (Always Visible)
- **Theme Toggle**: Switch light/dark mode
- **Language Selector**: EN/DE with flags
- **Play Button**: Start audio
- **Pause Button**: Pause audio
- **Reset Button**: Stop and reset audio

### View Toggle (Top of Content)
- **Audio Guide**: Show audio content
- **AR View**: Show AR models

### AR View Controls
- **Model Selector**: Grid of available models
- **View in AR**: Launch native AR viewer
- **Platform Info**: Shows device compatibility

## 📊 Benefits

### For Users
- ✅ **No navigation** - Everything in one place
- ✅ **Audio continues** - Doesn't stop when switching
- ✅ **Easy switching** - One click between views
- ✅ **Familiar UI** - Same sidebar and controls
- ✅ **Mobile-friendly** - Works on all devices

### For Museums/Galleries
- ✅ **Unified experience** - Audio + AR together
- ✅ **Better engagement** - Users stay on page
- ✅ **Professional** - Polished interface
- ✅ **Accessible** - Easy to use

### For Developers
- ✅ **Clean code** - Single component
- ✅ **Reusable** - Same UI patterns
- ✅ **Maintainable** - Easy to update
- ✅ **Type-safe** - TypeScript

## 🚀 Usage

### For Admins

1. **Upload 3D Models**
   ```
   /admin/models/new
   → Upload GLB files
   → Models appear in AR View
   ```

2. **Enable Models**
   ```
   /admin/models
   → Toggle "Active" switch
   → Models become available
   ```

3. **Test**
   ```
   Homepage → Click "AR View"
   → See your models
   → Click "View in AR"
   ```

### For Users

1. **Open Homepage**
   ```
   Visit: /
   ```

2. **Use Audio Guide**
   ```
   • Click Play in sidebar
   • Listen to audio
   • Control from sidebar
   ```

3. **Switch to AR**
   ```
   • Click "AR View" button
   • Select a model
   • Click "View in AR"
   • Audio keeps playing!
   ```

4. **Switch Back**
   ```
   • Click "Audio Guide" button
   • Back to audio content
   • Audio still playing
   ```

## 🎯 Perfect For

### Museum Exhibits
```
Visitor views artifact in AR
→ Listens to curator's audio guide
→ Switches between artifacts
→ Audio provides context
```

### Product Showcases
```
Customer views product in AR
→ Hears product description
→ Compares with other products
→ Makes informed decision
```

### Educational Content
```
Student views 3D model in AR
→ Listens to lesson audio
→ Learns interactively
→ Complete learning experience
```

## 🔄 Migration

### What Changed

**File Updated:**
- `components/audio-guide-view.tsx` - Added AR view toggle

**File Created:**
- `app/api/models/route.ts` - API to fetch models

**No Breaking Changes:**
- Existing audio functionality unchanged
- Sidebar controls work the same
- Navigation still works
- Audio playback unchanged

## ✨ Summary

Your Audio Guide now has:
- ✅ **Integrated AR viewing** - No page navigation
- ✅ **Persistent audio** - Keeps playing
- ✅ **Same sidebar** - Theme, language, audio controls
- ✅ **Easy switching** - Toggle between views
- ✅ **Mobile-friendly** - Works everywhere

**Users can now enjoy audio guides AND AR viewing in one unified experience!** 🎉

---

## Quick Test

1. **Open homepage**: `/`
2. **Click Play**: Audio starts
3. **Click "AR View"**: See AR content (audio still playing!)
4. **Select model**: Choose from available models
5. **Click "View in AR"**: Launch native AR
6. **Return**: Audio still playing!
7. **Click "Audio Guide"**: Back to audio content

**Everything works seamlessly!** 🚀
