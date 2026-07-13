"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface VaultState {
  key: CryptoKey | null
  unlock: (key: CryptoKey) => void
  lock: () => void
  isUnlocked: () => boolean
  getKey: () => CryptoKey | null
}

const VaultContext = createContext<VaultState>({
  key: null,
  unlock: () => {},
  lock: () => {},
  isUnlocked: () => false,
  getKey: () => null,
})

export function VaultProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState<CryptoKey | null>(null)

  const unlock = useCallback((k: CryptoKey) => setKey(k), [])
  const lock = useCallback(() => setKey(null), [])
  const isUnlocked = useCallback(() => key !== null, [key])
  const getKey = useCallback(() => key, [key])

  return (
    <VaultContext.Provider value={{ key, unlock, lock, isUnlocked, getKey }}>
      {children}
    </VaultContext.Provider>
  )
}

export function useVault() {
  return useContext(VaultContext)
}
