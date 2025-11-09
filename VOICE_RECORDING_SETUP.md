# Voice Recording & Transcription Setup

## Features Added ✨
- 🎙️ **Record audio** directly in browser
- 📁 **Upload audio files** (MP3, WAV, OGG, M4A, WebM)
- 📝 **Auto-transcribe** audio to text (FREE)
- ⏸️ **Pause/Resume** recording
- 🔊 **Preview** audio before uploading

## Quick Setup

### 1. Get Free API Key
1. Go to https://www.assemblyai.com/dashboard/signup
2. Sign up (no credit card required)
3. Copy your API key

### 2. Add to Environment
Add to your `.env.local` file:
```bash
ASSEMBLYAI_API_KEY=your-api-key-here
```

### 3. Restart Server
```bash
npm run dev
# or
pnpm dev
```

## Free Tier Limits
- ✅ 5 hours of transcription per month
- ✅ No credit card required
- ✅ High accuracy

## Usage
1. Go to http://localhost:3000/admin/voices/new
2. Choose "Record Audio" or "Upload File" tab
3. Record or select your audio
4. Click "Generate Transcript" (optional)
5. Fill in name and upload

That's it! 🎉
