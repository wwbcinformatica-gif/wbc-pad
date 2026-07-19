let vaultKey: CryptoKey | null = null

export function isVaultUnlocked(): boolean {
  return vaultKey !== null
}

export function getVaultKey(): CryptoKey | null {
  return vaultKey
}

export function unlockVault(key: CryptoKey): void {
  vaultKey = key
}

export function lockVault(): void {
  vaultKey = null
}
