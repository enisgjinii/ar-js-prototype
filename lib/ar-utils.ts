/**
 * AR Utilities for Native AR experiences
 */

export interface ARModel {
    glbUrl: string;  // For Android
    usdzUrl?: string; // For iOS (optional, will auto-convert if not provided)
    title: string;
    description?: string;
}

/**
 * Detect user's platform
 */
export function detectPlatform(): 'ios' | 'android' | 'other' {
    if (typeof window === 'undefined') return 'other';

    const userAgent = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(userAgent)) {
        return 'ios';
    }

    if (/android/.test(userAgent)) {
        return 'android';
    }

    return 'other';
}

/**
 * Check if device supports AR
 */
export function isARSupported(): boolean {
    const platform = detectPlatform();
    return platform === 'ios' || platform === 'android';
}

/**
 * Launch native AR viewer for the current platform
 */
export function launchNativeAR(model: ARModel): void {
    const platform = detectPlatform();

    if (platform === 'android') {
        launchAndroidAR(model);
    } else if (platform === 'ios') {
        launchIOSAR(model);
    } else {
        throw new Error('AR is not supported on this device');
    }
}

/**
 * Launch Android AR (Google Scene Viewer)
 */
export function launchAndroidAR(model: ARModel): void {
    try {
        // Convert to absolute URL
        const absoluteUrl = new URL(model.glbUrl, window.location.origin).href;

        // Build Scene Viewer intent URL
        const params = new URLSearchParams({
            file: absoluteUrl,
            mode: 'ar_preferred',
            title: model.title,
        });

        // Add optional parameters
        if (model.description) {
            params.append('link', window.location.href);
        }

        // Create intent URL
        const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?${params.toString()}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end;`;

        console.log('🤖 Launching Android AR:', intentUrl);
        window.location.href = intentUrl;
    } catch (error) {
        console.error('Failed to launch Android AR:', error);
        throw new Error('Failed to launch AR. Make sure Google Play Services for AR is installed.');
    }
}

/**
 * Launch iOS AR (Quick Look)
 */
export function launchIOSAR(model: ARModel): void {
    try {
        // Use provided USDZ URL or try to find USDZ version
        let usdzUrl = model.usdzUrl;

        if (!usdzUrl) {
            // Try to replace .glb with .usdz
            usdzUrl = model.glbUrl.replace(/\.glb$/i, '.usdz');

            // If still no USDZ, show error
            if (!usdzUrl.endsWith('.usdz')) {
                throw new Error('USDZ file not available. Please convert your model or wait for automatic conversion.');
            }
        }

        console.log('🍎 Launching iOS AR Quick Look:', usdzUrl);

        // Create temporary anchor with rel="ar"
        const anchor = document.createElement('a');
        anchor.rel = 'ar';
        anchor.href = usdzUrl;

        // iOS requires an img element inside the anchor
        const img = document.createElement('img');
        anchor.appendChild(img);

        // Append, click, and remove
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    } catch (error) {
        console.error('Failed to launch iOS AR:', error);
        throw new Error('Failed to launch AR Quick Look. USDZ file not available.');
    }
}

/**
 * Generate model-viewer HTML for fallback WebAR
 * (for desktop or unsupported devices)
 */
export function generateModelViewerHTML(model: ARModel): string {
    return `
    <model-viewer
      src="${model.glbUrl}"
      alt="${model.title}"
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      auto-rotate
      style="width: 100%; height: 100%;"
    >
      <button slot="ar-button" style="
        background-color: white;
        border: none;
        border-radius: 4px;
        padding: 12px 24px;
        font-size: 16px;
        cursor: pointer;
      ">
        View in AR
      </button>
    </model-viewer>
  `;
}

/**
 * Check if browser supports WebXR (fallback option)
 */
export async function checkWebXRSupport(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    if ('xr' in navigator) {
        try {
            const supported = await (navigator as any).xr.isSessionSupported('immersive-ar');
            return supported;
        } catch {
            return false;
        }
    }

    return false;
}

/**
 * Get AR capabilities for current device
 */
export async function getARCapabilities() {
    const platform = detectPlatform();
    const webxrSupported = await checkWebXRSupport();

    return {
        platform,
        nativeARSupported: platform === 'ios' || platform === 'android',
        webxrSupported,
        recommendedMethod: platform === 'ios' ? 'quick-look' :
            platform === 'android' ? 'scene-viewer' :
                webxrSupported ? 'webxr' : 'none'
    };
}
