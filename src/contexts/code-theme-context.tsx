"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type CodeTheme = "light" | "dark"

const CodeThemeContext = createContext<{
  theme: CodeTheme
  toggle: () => void
  setTheme: (t: CodeTheme) => void
}>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
})

export function CodeThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<CodeTheme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("codigo-theme") as CodeTheme | null
    if (saved === "light" || saved === "dark") setThemeState(saved)
  }, [])

  function toggle() {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark"
      localStorage.setItem("codigo-theme", next)
      return next
    })
  }

  function setTheme(t: CodeTheme) {
    setThemeState(t)
    localStorage.setItem("codigo-theme", t)
  }

  if (!mounted) {
    return (
      <CodeThemeContext.Provider value={{ theme: "dark", toggle, setTheme }}>
        {children}
      </CodeThemeContext.Provider>
    )
  }

  return (
    <CodeThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </CodeThemeContext.Provider>
  )
}

export function useCodeTheme() {
  return useContext(CodeThemeContext)
}
