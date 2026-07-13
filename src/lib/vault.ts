let vaultKey: CryptoKey | null = null
let initPromise: Promise<void> | null = null

async function initFromStorage() {
  const stored = typeof window !== "undefined" ? sessionStorage.getItem("vault_key") : null
  if (!stored) return
  try {
    const raw = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0))
    vaultKey = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])
  } catch {
    sessionStorage.removeItem("vault_key")
  }
}

export async function ensureInitialized(): Promise<void> {
  if (!initPromise) initPromise = initFromStorage()
  return initPromise
}

export function isVaultUnlocked(): boolean {
  return vaultKey !== null
}

export function getVaultKey(): CryptoKey | null {
  return vaultKey
}

export async function unlockVault(key: CryptoKey): Promise<void> {
  vaultKey = key
  try {
    const raw = await crypto.subtle.exportKey("raw", key)
    const base64 = btoa(String.fromCharCode(...new Uint8Array(raw)))
    sessionStorage.setItem("vault_key", base64)
  } catch {
    // fallback: keep in memory only
  }
}

export function lockVault(): void {
  vaultKey = null
  sessionStorage.removeItem("vault_key")
}

// Auto-init when imported
ensureInitialized()
