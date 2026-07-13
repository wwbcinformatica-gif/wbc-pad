"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { PASSWORD_CATEGORIES, type PasswordEntry } from "@/types"
import VaultUnlock from "@/components/vault-unlock"
import {
  Wifi,
  CreditCard,
  Globe,
  FileText,
  Building,
  Mail,
  Server,
  Key,
  Plus,
  AlertCircle,
  Download,
  Lock,
} from "lucide-react"

const iconMap: Record<string, typeof Wifi> = {
  wifi: Wifi,
  "credit-card": CreditCard,
  globe: Globe,
  "file-text": FileText,
  building: Building,
  mail: Mail,
  server: Server,
  key: Key,
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<PasswordEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    loadData()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadData()
    })
    return () => subscription.unsubscribe()
  }, [pathname])

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) {
      router.push("/login")
      return
    }

    const { data: profile } = await supabase
      .from("profiles").select("subscription_status").eq("id", user.id).single()
    if (profile) setSubscriptionStatus(profile.subscription_status)

    const { data: passwords } = await supabase
      .from("passwords").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    if (passwords) setEntries(passwords)
    setLoading(false)
  }

  function handleDownload() {
    const now = new Date().toLocaleDateString("pt-BR")
    const sep = "═".repeat(56)

    const lines: string[] = []
    lines.push(sep)
    lines.push("  MINHAS SENHAS — WBC PAD")
    lines.push(`  Exportado em: ${now}`)
    lines.push(sep)
    lines.push("")

    for (const cat of PASSWORD_CATEGORIES) {
      const catEntries = entries.filter((e) => e.category === cat.key)
      if (catEntries.length === 0) continue

      lines.push(`┌${"─".repeat(54)}┐`)
      lines.push(`│ ${cat.label}${" ".repeat(Math.max(0, 52 - cat.label.length - catEntries.length.toString().length))}(${catEntries.length}) │`)
      lines.push(`└${"─".repeat(54)}┘`)
      lines.push("")

      for (const entry of catEntries) {
        lines.push(`  ─── ${entry.title} ───`)
        lines.push("")
        for (const field of cat.fields) {
          const val = entry.fields[field.name] || ""
          if (val) {
            lines.push(`     ${field.label}: ${val}`)
          }
        }
        if (entry.notes) {
          lines.push(`     Observações: ${entry.notes}`)
        }
        lines.push("")
      }
    }

    lines.push(sep)
    lines.push("  Fim do relatório")
    lines.push(sep)

    const txt = lines.join("\n")
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `minhas-senhas-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const isExpired = subscriptionStatus === "expired" || subscriptionStatus === "canceled"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {isExpired && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50/80 border border-yellow-200/60 rounded-2xl p-4 flex items-center gap-3 btn-3d">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700 flex-1">
            Sua assinatura está {subscriptionStatus === "expired" ? "expirada" : "cancelada"}. Renove para continuar.
          </p>
          <Link href="/dashboard/subscription"><Button size="sm">Renovar</Button></Link>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Senhas</h1>
          <p className="text-sm text-gray-500 mt-1">{entries.length} senha{entries.length !== 1 ? "s" : ""}</p>
        </div>
        {entries.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleDownload}
            className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300">
            <Download className="w-4 h-4" /> Download TXT
          </Button>
        )}
      </div>

      <VaultUnlock>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PASSWORD_CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.icon] || Key
            const count = entries.filter((e) => e.category === cat.key).length
            return (
              <Link key={cat.key} href={`/dashboard/passwords/${cat.key}`}>
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 cursor-pointer h-full transition-all duration-300 btn-3d hover:border-[var(--theme-primary)]/40 hover:shadow-[0_16px_30px_-8px_rgba(19,208,208,0.15),0_8px_12px_-6px_rgba(0,0,0,0.08)]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-secondary)]/10 flex items-center justify-center icon-3d">
                      <Icon className="w-5 h-5 text-[var(--theme-primary)]" />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">{count}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{cat.label}</h3>
                </div>
              </Link>
            )
          })}
        </div>
      </VaultUnlock>
    </div>
  )
}
