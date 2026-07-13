"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

type FontSizeId = "small" | "medium" | "large" | "xlarge"

export const FONT_SIZES: { id: FontSizeId; label: string; code: string; preview: string }[] = [
  { id: "small", label: "Pequena", code: "12px", preview: "Aa" },
  { id: "medium", label: "Média", code: "13px", preview: "Aa" },
  { id: "large", label: "Grande", code: "15px", preview: "Aa" },
  { id: "xlarge", label: "Extra Grande", code: "17px", preview: "Aa" },
]

interface FontSizeContextType {
  fontSize: FontSizeId
  setFontSize: (size: FontSizeId) => void
  getPixelSize: () => string
}

const FontSizeContext = createContext<FontSizeContextType>({
  fontSize: "medium",
  setFontSize: () => {},
  getPixelSize: () => "13px",
})

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSizeId>("medium")

  useEffect(() => {
    const saved = localStorage.getItem("wbc-font-size") as FontSizeId | null
    if (saved && FONT_SIZES.find((s) => s.id === saved)) {
      setFontSizeState(saved)
    }
  }, [])

  const setFontSize = useCallback((size: FontSizeId) => {
    setFontSizeState(size)
    localStorage.setItem("wbc-font-size", size)
  }, [])

  const getPixelSize = useCallback(() => {
    return FONT_SIZES.find((s) => s.id === fontSize)?.code || "13px"
  }, [fontSize])

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize, getPixelSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export function useFontSize() {
  return useContext(FontSizeContext)
}
