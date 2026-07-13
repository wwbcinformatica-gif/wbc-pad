let vaultKey: CryptoKey | null = null
let initDone = false

async function initFromStorage() {
  if (initDone) return
  initDone = true
  const stored = typeof window !== "undefined" ? localStorage.getItem("vault_key") : null
  if (!stored) return
  try {
    const raw = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0))
    vaultKey = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])
  } catch {
    localStorage.removeItem("vault_key")
  }
}

export async function ensureInitialized(): Promise<void> {
  return initFromStorage()
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
    const bytes = new Uint8Array(raw)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    localStorage.setItem("vault_key", btoa(binary))
  } catch {
    // fallback: keep in memory only
  }
}

export function lockVault(): void {
  vaultKey = null
  localStorage.removeItem("vault_key")
}

// Auto-init when imported
ensureInitialized()
