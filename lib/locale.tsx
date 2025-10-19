"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

type Locale = "en" | "de"

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
} | null>(null)

// Lazy load JSON translations
async function loadLocaleData(locale: Locale) {
  if (locale === "de") {
    return (await import("../locales/de.json")).default
  }
  return (await import("../locales/en.json")).default
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>((typeof window !== "undefined" && (localStorage.getItem("locale") as Locale)) || "en")
  const [messages, setMessages] = useState<Record<string, any> | null>(null)

  useEffect(() => {
    let mounted = true
    loadLocaleData(locale).then((data) => {
      if (mounted) setMessages(data)
    })
    return () => { mounted = false }
  }, [locale])

  useEffect(() => {
    try {
      localStorage.setItem("locale", locale)
    } catch (e) {
      // ignore
    }
  }, [locale])

  const setLocale = (l: Locale) => setLocaleState(l)

  const t = useMemo(() => {
    return (key: string) => {
      if (!messages) return key
      const parts = key.split(".")
      let cur: any = messages
      for (const p of parts) {
        cur = cur?.[p]
        if (cur == null) return key
      }
      return typeof cur === "string" ? cur : key
    }
  }, [messages])

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider")
  return ctx
}

export function useT() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useT must be used within LocaleProvider")
  return ctx.t
}
