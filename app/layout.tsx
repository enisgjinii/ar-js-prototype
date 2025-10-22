import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Script from 'next/script';
import { ThemeProvider } from '@/components/theme-provider';
import { LocaleProvider } from '@/lib/locale';
import ThemeCustomizer from '@/components/theme-customizer';

const geist = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AR Cultural Guide',
  description:
    'Immersive AR experience with audio guides and geolocation-based 3D content',
  generator: 'v0.app',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Use A-Frame + AR.js (A-Frame build) for GPS-based AR */}
        <Script
          src="https://aframe.io/releases/1.4.0/aframe.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`font-sans antialiased ${geist.className}`}>
        <LocaleProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <ThemeCustomizer />
            <div className="min-h-screen w-full">
              {children}
            </div>
          </ThemeProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}