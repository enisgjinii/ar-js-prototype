'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ModelARLauncherProps {
    modelUrl: string; // GLB/GLTF for Android
    usdzUrl?: string; // USDZ for iOS (optional, will auto-detect)
    modelTitle?: string;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Simple AR launcher button that can be embedded anywhere.
 * Automatically detects platform and launches appropriate AR viewer.
 * Android: Uses GLB file
 * iOS: Uses USDZ file (auto-detects or uses provided usdzUrl)
 */
export default function ModelARLauncherButton({
    modelUrl,
    usdzUrl,
    modelTitle = '3D Model',
    className = '',
    children
}: ModelARLauncherProps) {
    const handleARClick = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);

        if (isAndroid) {
            // Android: Use Google AR Scene Viewer with GLB
            const absoluteUrl = new URL(modelUrl, window.location.origin).href;
            const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(absoluteUrl)}&mode=ar_preferred&title=${encodeURIComponent(modelTitle)}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end;`;
            window.location.href = intentUrl;
        } else if (isIOS) {
            // iOS: Use AR Quick Look with USDZ
            const iosUrl = usdzUrl || modelUrl.replace(/\.glb$/i, '.usdz');

            if (!iosUrl.endsWith('.usdz')) {
                alert('USDZ file not available for iOS. Please convert your model or wait for automatic conversion.');
                return;
            }

            const anchor = document.createElement('a');
            anchor.rel = 'ar';
            anchor.href = iosUrl;
            const img = document.createElement('img');
            anchor.appendChild(img);
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
        } else {
            alert('AR is only available on iOS and Android devices');
        }
    };

    return (
        <Button onClick={handleARClick} className={className}>
            {children || '📱 View in AR'}
        </Button>
    );
}

/**
 * AR Link component for use in product pages, galleries, etc.
 * Can be styled as a link or button.
 */
export function ARLink({
    modelUrl,
    usdzUrl,
    modelTitle = '3D Model',
    className = '',
    children
}: ModelARLauncherProps) {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);

        if (isAndroid) {
            // Android: Use GLB
            const absoluteUrl = new URL(modelUrl, window.location.origin).href;
            const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(absoluteUrl)}&mode=ar_preferred&title=${encodeURIComponent(modelTitle)}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end;`;
            window.location.href = intentUrl;
        } else if (isIOS) {
            // iOS: Use USDZ
            const iosUrl = usdzUrl || modelUrl.replace(/\.glb$/i, '.usdz');

            if (!iosUrl.endsWith('.usdz')) {
                alert('USDZ file not available for iOS.');
                return;
            }

            const anchor = document.createElement('a');
            anchor.rel = 'ar';
            anchor.href = iosUrl;
            const img = document.createElement('img');
            anchor.appendChild(img);
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
        }
    };

    return (
        <a
            href="#"
            onClick={handleClick}
            className={className || 'text-blue-600 hover:text-blue-800 underline'}
        >
            {children || 'View in AR'}
        </a>
    );
}
