"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { deriveKey, createVerificationHash, generateSalt, decrypt, encrypt } from "@/lib/vault-crypto"
import { unlockVault, isVaultUnlocked } from "@/lib/vault"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, Unlock, KeyRound, AlertCircle, Trash2, RotateCcw } from "lucide-react"

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

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [accountPassword, setAccountPassword] = useState("")

  async function handleResetVault(e: React.FormEvent) {
    e.preventDefault()
    if (!accountPassword) return
    setSaving(true)
    setError("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: accountPassword,
      })

      if (signInError) {
        setError("Senha da conta incorreta")
        setSaving(false)
        return
      }

      const { error: deleteError } = await supabase
        .from("passwords")
        .update({ fields: {} })
        .eq("user_id", user.id)
        .not("fields", "is", null)

      if (deleteError) {
        setError("Erro ao limpar dados: " + deleteError.message)
        setSaving(false)
        return
      }

      const { error: metaError } = await supabase.auth.updateUser({
        data: { vault_hash: null, vault_salt: null }
      })

      if (metaError) {
        setError("Erro ao resetar vault: " + metaError.message)
        setSaving(false)
        return
      }

      setPassword("")
      setConfirmPassword("")
      setAccountPassword("")
      setShowResetConfirm(false)
      setStatus("setup")
    } catch {
      setError("Erro ao resetar o vault")
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

            {showResetConfirm ? (
              <div className="space-y-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 font-medium">
                  Confirme com sua <strong>senha da conta</strong> (email) para resetar o vault.
                  Todos os dados criptografados serão perdidos.
                </p>
                <input
                  type="password"
                  className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white"
                  placeholder="Digite sua senha da conta"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowResetConfirm(false); setAccountPassword(""); setError("") }}
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    loading={saving}
                    disabled={!accountPassword}
                    onClick={handleResetVault}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Resetar Vault
                  </Button>
                </div>
              </div>
            ) : (
              <Button type="submit" loading={saving} className="w-full">
                {status === "setup" ? (
                  <><KeyRound className="w-4 h-4 mr-2" /> Configurar Vault</>
                ) : (
                  <><Unlock className="w-4 h-4 mr-2" /> Desbloquear</>
                )}
              </Button>
            )}

            {status === "unlock" && !showResetConfirm && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Esqueci a chave mestra — resetar vault
                </button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
