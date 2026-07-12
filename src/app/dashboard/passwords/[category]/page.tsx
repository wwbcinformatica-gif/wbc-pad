"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BankAccountCard } from "@/components/bank-account-card"
import { CreditCard3D } from "@/components/credit-card-3d"
import { DocumentCard } from "@/components/document-card"
import { PASSWORD_CATEGORIES, type PasswordEntry } from "@/types"
import {
  Plus,
  ArrowLeft,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Pencil,
  Wifi,
  CreditCard,
  Globe,
  FileText,
  Building,
  Mail,
  Server,
  Key,
} from "lucide-react"
import { formatDate, maskValue } from "@/lib/utils"

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

const BANK_COLORS: Record<string, string> = {
  nubank: "#8A05BE",
  inter: "#FF7A00",
  "will bank": "#FFCD00",
  c6: "#000000",
  itau: "#FF6600",
  bradesco: "#003399",
  santander: "#EC0000",
  bb: "#003366",
  caixa: "#004481",
  neon: "#00E676",
  pagbank: "#00A651",
  picpay: "#21C25E",
  "mercado pago": "#009EE3",
  original: "#00A857",
  xp: "#1C1C1C",
}

function getBankColor(bankName: string): string {
  const key = bankName?.toLowerCase().trim() || ""
  for (const [name, color] of Object.entries(BANK_COLORS)) {
    if (key.includes(name) || name.includes(key)) return color
  }
  return "#1a1a2e"
}

function formatCardNumber(num: string) {
  const digits = num.replace(/\D/g, "")
  const groups = digits.match(/.{1,4}/g)
  return groups?.join(" ") || digits
}

function maskCardNumber(num: string) {
  const digits = num.replace(/\D/g, "")
  if (digits.length <= 4) return digits
  const first4 = digits.slice(0, 4)
  return `${first4} •••• •••• ••••`
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as string
  const [entries, setEntries] = useState<PasswordEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const supabase = createClient()

  const catConfig = PASSWORD_CATEGORIES.find((c) => c.key === category)
  const Icon = iconMap[catConfig?.icon || "key"] || Key
  const isCardCategory = category === "credit-card" || category === "bank-account" || category === "document"

  useEffect(() => {
    loadEntries()
  }, [category])

  async function loadEntries() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("passwords")
      .select("*")
      .eq("user_id", user.id)
      .eq("category", category)
      .order("created_at", { ascending: false })

    if (data) setEntries(data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir?")) return
    await supabase.from("passwords").delete().eq("id", id)
    setEntries(entries.filter((e) => e.id !== id))
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  function togglePassword(id: string) {
    setVisiblePasswords((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!catConfig) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Categoria não encontrada</p>
        <Link href="/dashboard">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
           <Link href="/dashboard">
             <Button variant="ghost" size="sm">
               <ArrowLeft className="w-4 h-4" />
             </Button>
           </Link>
           <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-secondary)]/10 flex items-center justify-center">
             <Icon className="w-5 h-5 text-[var(--theme-primary)]" />
           </div>
           <div>
             <h1 className="text-xl font-bold text-gray-900">{catConfig.label}</h1>
             <p className="text-sm text-gray-500">{entries.length} registro(s)</p>
           </div>
         </div>
         {entries.length > 0 && (
           <Link href={`/dashboard/passwords/${category}/new`}>
             <Button>
               <Plus className="w-4 h-4 mr-2" /> Criar Novo
             </Button>
           </Link>
         )}
       </div>

       {entries.length === 0 ? (
         <Card>
           <CardContent className="p-12 text-center">
             <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
               <Icon className="w-8 h-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-medium text-gray-900 mb-2">
               Nenhum registro de {catConfig.label.toLowerCase()}
             </h3>
             <p className="text-sm text-gray-500 mb-6">
               Adicione seu primeiro registro
             </p>
             <Link href={`/dashboard/passwords/${category}/new`}>
               <Button>
                 <Plus className="w-4 h-4 mr-2" /> Criar {catConfig.label}
               </Button>
             </Link>
           </CardContent>
         </Card>
       ) : isCardCategory ? (

        /* === CREDIT CARDS & BANK ACCOUNTS: 3D card grid === */
        <div className="max-w-2xl mx-auto space-y-5">
          {entries.map((entry) => {
            if (category === "credit-card") {
              const isVisible = visiblePasswords.has(entry.id)
              return (
                <div key={entry.id} className="relative group">
                  <CreditCard3D
                    title={entry.title}
                    fields={entry.fields}
                    visible={isVisible}
                    onToggleVisibility={() => togglePassword(entry.id)}
                    onCopy={handleCopy}
                    variant="both"
                  />

                  {/* Edit/Delete - hover */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 bg-white/20 hover:bg-white/40 text-white border-none"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/dashboard/passwords/${category}/${entry.id}/edit`)
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="h-8 w-8 bg-red-500/80 hover:bg-red-600 text-white border-none"
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete(entry.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            }

            if (category === "document") {
              const isDocVisible = visiblePasswords.has(entry.id)
              return (
                <div key={entry.id} className="relative group">
                  <div className="max-w-2xl mx-auto">
                    <DocumentCard
                      title={entry.title}
                      fields={entry.fields}
                      visible={isDocVisible}
                      onToggleVisibility={() => togglePassword(entry.id)}
                      onCopy={(text) => handleCopy(text)}
                      variant="both"
                    />
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 bg-white/80 hover:bg-white text-gray-700"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/dashboard/passwords/${category}/${entry.id}/edit`)
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="h-8 w-8 bg-red-500/80 hover:bg-red-600 text-white border-none"
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete(entry.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            }

            // Bank account
            const isBankVisible = visiblePasswords.has(entry.id)
            return (
              <div key={entry.id} className="relative group">
                <BankAccountCard
                  title={entry.title}
                  fields={entry.fields}
                  variant="full"
                  visible={isBankVisible}
                  onToggleVisibility={() => togglePassword(entry.id)}
                  onCopy={(text) => handleCopy(text)}
                />
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 bg-white/80 hover:bg-white text-gray-700"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(`/dashboard/passwords/${category}/${entry.id}/edit`)
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="h-8 w-8 bg-red-500/80 hover:bg-red-600 text-white border-none"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(entry.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* === OTHER CATEGORIES: list view === */
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{entry.title}</h3>
                    <div className="space-y-1">
                      {catConfig.fields.map((field) => {
                        const value = entry.fields[field.name] || ""
                        if (!value) return null
                        const isPassword = field.type === "password"
                        const isVisible = visiblePasswords.has(`${entry.id}-${field.name}`)
                        return (
                          <div key={field.name} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 min-w-[80px]">{field.label}:</span>
                            <span className="text-gray-900 font-mono">
                              {isPassword && !isVisible ? maskValue(value) : value}
                            </span>
                            {isPassword && (
                              <button
                                onClick={() => togglePassword(`${entry.id}-${field.name}`)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            )}
                            <button
                              onClick={() => handleCopy(value)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Copiar"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Criado em {formatDate(entry.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Link href={`/dashboard/passwords/${category}/${entry.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
