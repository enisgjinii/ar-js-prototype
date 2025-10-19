import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Script from "next/script"
import { ThemeProvider } from "@/components/theme-provider"
import { LocaleProvider } from "@/lib/locale"
import ThemeCustomizer from "@/components/theme-customizer"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AR Cultural Guide",
  description: "Immersive AR experience with audio guides and geolocation-based 3D content",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
  <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js" strategy="beforeInteractive" />
        <Script
          src="https://raw.githack.com/AR-js-org/AR.js/master/three.js/build/ar-threex-location-only.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://raw.githack.com/AR-js-org/AR.js/master/three.js/build/ar.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`font-sans antialiased ${geist.className}`}>
        <LocaleProvider>
          <ThemeProvider attribute="class" defaultTheme="bw" disableTransitionOnChange>
            <ThemeCustomizer />
            {children}
          </ThemeProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}