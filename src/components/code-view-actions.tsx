"use client"

import { useCodeTheme } from "@/contexts/code-theme-context"
import { Sun, Moon } from "lucide-react"

export default function CodeViewActions() {
  const { theme, toggle } = useCodeTheme()
  const isDark = theme === "dark"

  return (
    <button
      onClick={toggle}
      className={`p-1.5 rounded-lg transition-colors ${
        isDark ? "text-gray-400 hover:text-yellow-400 hover:bg-[#2a2d2e]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
      }`}
      title={isDark ? "Tema claro" : "Tema escuro"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
