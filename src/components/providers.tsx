"use client"

import type { ReactNode } from "react"
import { SoundProvider } from "@/contexts/sound-context"
import { ThemeInit } from "@/components/theme-init"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SoundProvider>
      <ThemeInit />
      {children}
    </SoundProvider>
  )
}
