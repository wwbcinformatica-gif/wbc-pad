"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { deriveKey, createVerificationHash, generateSalt, decrypt, encrypt } from "@/lib/vault-crypto"
import { unlockVault, isVaultUnlocked, ensureInitialized } from "@/lib/vault"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, Unlock, KeyRound, AlertCircle } from "lucide-react"

interface VaultUnlockProps {
  children: React.ReactNode
}

export default function VaultUnlock({ children }: VaultUnlockProps) {
  const [status, setStatus] = useState<"loading" | "setup" | "unlock" | "unlocked">("loading")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkVault()
  }, [])

  async function checkVault() {
    await ensureInitialized()
    if (isVaultUnlocked()) {
      setStatus("unlocked")
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const vault_hash = user.user_metadata?.vault_hash
    const vault_salt = user.user_metadata?.vault_salt

    if (vault_hash && vault_salt) {
      setStatus("unlock")
    } else {
      setStatus("setup")
    }
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password.length < 4) {
      setError("A chave deve ter no mínimo 4 caracteres")
      return
    }
    if (password !== confirmPassword) {
      setError("As chaves não conferem")
      return
    }
    setSaving(true)
    try {
      const salt = await generateSalt()
      const hash = await createVerificationHash(password, salt)
      const key = await deriveKey(password, salt)

      const { error: updateError } = await supabase.auth.updateUser({
        data: { vault_hash: hash, vault_salt: salt }
      })

      if (updateError) {
        setError("Erro ao salvar: " + updateError.message)
        return
      }

      await unlockVault(key)
      setStatus("unlocked")
    } catch {
      setError("Erro ao configurar o vault")
    }
    setSaving(false)
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const vault_hash = user.user_metadata?.vault_hash
      const vault_salt = user.user_metadata?.vault_salt

      if (!vault_hash || !vault_salt) {
        setError("Vault não configurado")
        return
      }

      const computedHash = await createVerificationHash(password, vault_salt)

      if (computedHash !== vault_hash) {
        setError("Chave inválida")
        return
      }

      const key = await deriveKey(password, vault_salt)
      await unlockVault(key)
      setStatus("unlocked")
    } catch {
      setError("Erro ao desbloquear o vault")
    }
    setSaving(false)
  }

  if (status === "unlocked") {
    return <>{children}</>
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--theme-primary)]/20 to-[var(--theme-secondary)]/20 flex items-center justify-center mx-auto mb-4">
              {status === "setup" ? (
                <KeyRound className="w-8 h-8 text-[var(--theme-primary)]" />
              ) : (
                <Lock className="w-8 h-8 text-[var(--theme-primary)]" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {status === "setup" ? "Configurar Vault" : "Vault Bloqueado"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {status === "setup"
                ? "Crie uma chave mestra para proteger seus dados"
                : "Digite sua chave mestra para acessar as senhas"}
            </p>
          </div>

          <form onSubmit={status === "setup" ? handleSetup : handleUnlock} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Chave Mestra</label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/20"
                placeholder="Digite sua chave mestra"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                autoComplete="new-password"
              />
            </div>

            {status === "setup" && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Confirmar Chave Mestra</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/20"
                  placeholder="Repita a chave mestra"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" loading={saving} className="w-full">
              {status === "setup" ? (
                <><KeyRound className="w-4 h-4 mr-2" /> Configurar Vault</>
              ) : (
                <><Unlock className="w-4 h-4 mr-2" /> Desbloquear</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
