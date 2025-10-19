"use client"

import React from "react"
import { useTheme } from "next-themes"
import { useLocale } from "@/lib/locale"
import { Button } from "@/components/ui/button"

export default function ThemeCustomizer() {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale } = useLocale()

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border rounded-full p-1">
        <button
          aria-label="Light theme"
          onClick={() => setTheme("light")}
          className={`px-3 py-1 rounded-full ${theme === "light" ? "bg-primary text-primary-foreground" : ""}`}
        >
          Light
        </button>
        <button
          aria-label="Dark theme"
          onClick={() => setTheme("dark")}
          className={`px-3 py-1 rounded-full ${theme === "dark" ? "bg-primary text-primary-foreground" : ""}`}
        >
          Dark
        </button>
        <button
          aria-label="Black & White"
          onClick={() => setTheme("bw")}
          className={`px-3 py-1 rounded-full ${theme === "bw" ? "bg-primary text-primary-foreground" : ""}`}
        >
          BW
        </button>
      </div>

      <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm border border-border rounded-full p-1">
        <button onClick={() => setLocale("en")} className={`px-2 py-1 rounded-full ${locale === "en" ? "bg-primary text-primary-foreground" : ""}`}>EN</button>
        <button onClick={() => setLocale("de")} className={`px-2 py-1 rounded-full ${locale === "de" ? "bg-primary text-primary-foreground" : ""}`}>DE</button>
      </div>
    </div>
  )
}
