# How to Enable WebXR on Android

## Why You're Seeing Google AR Scene Viewer

If you're on Android and clicking "View in AR" opens Google AR Scene Viewer (leaves the browser), it means **WebXR is not enabled** in your Chrome browser.

---

## Requirements for WebXR (Stays in Browser)

### 1. Chrome Version
- **Minimum:** Chrome 79+
- **Recommended:** Chrome 90+ (latest)
- Check your version: `chrome://version`

### 2. Android Version
- **Minimum:** Android 7.0+
- **Recommended:** Android 10+

### 3. ARCore Support
- Your device must support Google ARCore
- Check: https://developers.google.com/ar/devices

---

## How to Enable WebXR in Chrome

### Step 1: Update Chrome
1. Open **Google Play Store**
2. Search for **Chrome**
3. Tap **Update** (if available)
4. Restart Chrome

### Step 2: Enable WebXR Flags (if needed)

1. Open Chrome and go to: `chrome://flags`

2. Search for and enable these flags:
   - **WebXR Incubations** → Enabled
   - **WebXR AR Module** → Enabled
   - **WebXR Hit Test** → Enabled

3. Tap **Relaunch** at the bottom

### Step 3: Grant Permissions

1. Go to Chrome Settings
2. **Site Settings** → **Camera**
3. Make sure camera access is allowed

### Step 4: Test WebXR Support

Visit: `https://immersive-web.github.io/webxr-samples/`

If you see AR demos working, WebXR is enabled!

---

## Check Your Device

### Open Chrome Console

1. Visit your AR page
2. Open Chrome DevTools (if possible)
3. Check console for these messages:
   - ✅ `WebXR supported - will stay in browser!`
   - ⚠️ `WebXR not supported - will use Scene Viewer`

### Quick Test

Run this in Chrome console:
```javascript
navigator.xr?.isSessionSupported('immersive-ar').then(supported => {
  console.log('WebXR AR supported:', supported);
});
```

---

## Common Issues

### Issue 1: "WebXR not supported"
**Cause:** Chrome version too old or flags not enabled
**Solution:** Update Chrome and enable flags above

### Issue 2: "ARCore not installed"
**Cause:** Google Play Services for AR not installed
**Solution:** Install from Play Store: https://play.google.com/store/apps/details?id=com.google.ar.core

### Issue 3: "Camera permission denied"
**Cause:** Camera access not granted
**Solution:** Settings → Apps → Chrome → Permissions → Camera → Allow

### Issue 4: Device not ARCore compatible
**Cause:** Your device doesn't support ARCore
**Solution:** Use Scene Viewer (native AR) or upgrade device

---

## WebXR vs Scene Viewer Comparison

| Feature | WebXR (In Browser) | Scene Viewer (Native) |
|---------|-------------------|----------------------|
| Stays in browser | ✅ Yes | ❌ No (opens app) |
| Your UI visible | ✅ Yes | ❌ No |
| Chrome version | 79+ | Any |
| Setup required | Flags + permissions | None |
| AR quality | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## Supported Devices (WebXR)

### Confirmed Working
- Google Pixel 3+
- Samsung Galaxy S9+
- OnePlus 6+
- Xiaomi Mi 8+
- Most flagship phones from 2018+

### Check Your Device
Visit: https://developers.google.com/ar/devices

---

## Alternative: Use HTTPS

WebXR requires HTTPS (secure connection). If testing locally:

### Option 1: Use ngrok
```bash
ngrok http 3000
```

### Option 2: Use localhost
Chrome allows WebXR on `localhost` without HTTPS

### Option 3: Deploy to HTTPS
Deploy your app to Vercel, Netlify, etc.

---

## Testing Checklist

- [ ] Chrome version 90+
- [ ] Android 10+
- [ ] ARCore installed
- [ ] WebXR flags enabled
- [ ] Camera permission granted
- [ ] Using HTTPS (or localhost)
- [ ] Device supports ARCore

---

## Still Not Working?

### Fallback Options

1. **Accept Scene Viewer:** It works well, just leaves browser
2. **Use 8th Wall:** Paid solution ($99/mo) that always works
3. **Desktop Testing:** Use Chrome DevTools device emulation

### Report Issue

If WebXR should work but doesn't:
1. Check Chrome version: `chrome://version`
2. Check flags: `chrome://flags`
3. Check console errors
4. Test on: https://immersive-web.github.io/webxr-samples/

---

## Expected Behavior

### With WebXR (Chrome 90+, ARCore device)
1. Click "View in AR"
2. Camera opens **in the browser**
3. Your UI stays visible
4. Place model in your space
5. Close AR, still in browser ✅

### Without WebXR (Older Chrome or device)
1. Click "View in AR"
2. Opens Google AR Scene Viewer app
3. Your UI disappears
4. Place model in your space
5. Close app, return to browser ⚠️

---

## Recommendation

**For Development:**
- Use latest Chrome (100+)
- Enable all WebXR flags
- Test on ARCore device

**For Production:**
- Accept that some users will use Scene Viewer
- Show appropriate message based on support
- Both experiences work well

**For Best Experience:**
- Use 8th Wall ($99/mo) - works everywhere
- Or accept Scene Viewer fallback (free)

---

## Quick Fix

If you just want it to work now:

1. Update Chrome to latest version
2. Go to `chrome://flags`
3. Search "webxr"
4. Enable all WebXR flags
5. Relaunch Chrome
6. Try again

If still doesn't work → Your device may not support WebXR yet. Scene Viewer is your fallback.

---

**Last Updated:** November 2024
