"use client"

import { useEffect } from "react"
import { applyTheme, loadSavedTheme } from "@/lib/themes"

export function ThemeInit() {
  useEffect(() => {
    const saved = loadSavedTheme()
    if (saved) applyTheme(saved)
  }, [])
  return null
}
