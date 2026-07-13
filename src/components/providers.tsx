"use client"

import type { ReactNode } from "react"
import { SoundProvider } from "@/contexts/sound-context"
import { FontSizeProvider } from "@/contexts/font-size-context"
import { ThemeInit } from "@/components/theme-init"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SoundProvider>
      <FontSizeProvider>
        <ThemeInit />
        {children}
      </FontSizeProvider>
    </SoundProvider>
  )
}
