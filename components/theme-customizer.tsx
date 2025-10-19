"use client"

import React from "react"
import { useTheme } from "next-themes"
import { useLocale } from "@/lib/locale"
import { Button } from "@/components/ui/button"

export default function ThemeCustomizer() {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale } = useLocale()
  const [mounted, setMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Close popover on outside click or Escape
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  // Use a compact settings popover with native selects for accessibility and small footprint
  return (
    <div ref={ref} className="fixed top-4 left-4 z-50">
      <div className="relative">
        <button
          aria-expanded={open}
          aria-label="Settings"
          onClick={() => setOpen((s) => !s)}
          className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-border bg-background text-sm hover:bg-accent/5 focus:outline-none"
        >
          ⚙
        </button>

        {open && (
          <div className="absolute left-0 mt-2 w-44 bg-card text-card-foreground rounded-lg shadow-lg border border-border p-3 space-y-2">
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">Theme</label>
              <select
                aria-label="Select theme"
                className="w-full px-2 py-1 rounded border border-border bg-background text-sm"
                value={mounted ? theme : ""}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="bw">BW</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">Language</label>
              <select
                aria-label="Select language"
                className="w-full px-2 py-1 rounded border border-border bg-background text-sm"
                value={locale}
                onChange={(e) => setLocale(e.target.value as any)}
              >
                <option value="en">EN</option>
                <option value="de">DE</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground px-2 py-1">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
