"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard3D } from "@/components/credit-card-3d"
import { BankAccountCard } from "@/components/bank-account-card"
import { DocumentCard } from "@/components/document-card"
import { PASSWORD_CATEGORIES } from "@/types"
import { getVaultKey } from "@/lib/vault"
import { encrypt, decrypt } from "@/lib/vault-crypto"
import { ArrowLeft, Save, Trash2, Eye, EyeOff, Copy } from "lucide-react"

const BANKS = [
  { key: "nubank", label: "Nubank", color: "bg-purple-600" },
  { key: "inter", label: "Inter", color: "bg-orange-500" },
  { key: "will bank", label: "Will Bank", color: "bg-yellow-400" },
  { key: "itau", label: "Itaú", color: "bg-orange-600" },
  { key: "bradesco", label: "Bradesco", color: "bg-blue-800" },
  { key: "santander", label: "Santander", color: "bg-red-600" },
  { key: "bb", label: "Banco do Brasil", color: "bg-blue-900" },
  { key: "caixa", label: "Caixa", color: "bg-blue-700" },
  { key: "c6 bank", label: "C6 Bank", color: "bg-black" },
  { key: "neon", label: "Neon", color: "bg-[#00E676]" },
  { key: "pagbank", label: "PagBank", color: "bg-[#00A651]" },
  { key: "picpay", label: "PicPay", color: "bg-[#21C25E]" },
  { key: "mercado pago", label: "Mercado Pago", color: "bg-[#009EE3]" },
  { key: "original", label: "Original", color: "bg-[#00A857]" },
  { key: "xp", label: "XP Investimentos", color: "bg-gray-900" },
]

export default function EditPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as string
  const id = params.id as string
  const [title, setTitle] = useState("")
  const [fields, setFields] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showCardNumber, setShowCardNumber] = useState(false)
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set())
  const supabase = createClient()

  const catConfig = PASSWORD_CATEGORIES.find((c) => c.key === category)
  const isCardCategory = category === "credit-card" || category === "bank-account" || category === "document"

  useEffect(() => {
    loadEntry()
  }, [id])

  async function loadEntry() {
    const { data } = await supabase
      .from("passwords")
      .select("*")
      .eq("id", id)
      .single()

    if (data) {
      const key = getVaultKey()
      let loadedFields = data.fields
      if (key && data.fields?._encrypted) {
        try {
          const decryptedStr = await decrypt(data.fields._encrypted, key)
          loadedFields = JSON.parse(decryptedStr)
        } catch {}
      }
      setTitle(data.title)
      setFields(loadedFields)
      setNotes(data.notes || "")
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)

    const key = getVaultKey()
    let fieldsToSave = fields
    if (key) {
      const encrypted = await encrypt(JSON.stringify(fields), key)
      fieldsToSave = { _encrypted: encrypted } as Record<string, string>
    }

    await supabase
      .from("passwords")
      .update({ title: title.trim(), fields: fieldsToSave, notes, updated_at: new Date().toISOString() })
      .eq("id", id)

    router.push(`/dashboard/passwords/${category}`)
    router.refresh()
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm("Excluir este cartão?")) return
    await supabase.from("passwords").delete().eq("id", id)
    router.push(`/dashboard/passwords/${category}`)
    router.refresh()
  }

  function updateField(name: string, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]" />
      </div>
    )
  }

  if (!catConfig) {
    return <div className="text-center py-12 text-gray-500">Categoria inválida</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/passwords/${category}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Editar {catConfig.label}</h1>
      </div>

      {/* 3D Card Preview */}
      {isCardCategory && (
        <div className="space-y-4">
          {category === "credit-card" ? (
            <CreditCard3D
              title={title}
              fields={fields}
              visible={showCardNumber}
              onToggleVisibility={() => setShowCardNumber(!showCardNumber)}
              onCopy={(text) => navigator.clipboard.writeText(text)}
              variant="both"
            />
          ) : category === "document" ? (
            <DocumentCard
              title={title}
              fields={fields}
              visible={showCardNumber}
              onToggleVisibility={() => setShowCardNumber(!showCardNumber)}
              onCopy={(text) => navigator.clipboard.writeText(text)}
              variant="both"
            />
          ) : (
            <BankAccountCard
              title={title}
              fields={fields}
              visible={showCardNumber}
              onToggleVisibility={() => setShowCardNumber(!showCardNumber)}
              onCopy={(text) => navigator.clipboard.writeText(text)}
              variant="full"
            />
          )}

          {category === "document" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">
                Cor do Documento
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "azul-claro", label: "Azul Claro", color: "bg-[#5dade2]" },
                  { key: "azul-escuro", label: "Azul Escuro", color: "bg-[#2e86c1]" },
                  { key: "verde-claro", label: "Verde Claro", color: "bg-[#58d68d]" },
                  { key: "verde-escuro", label: "Verde Escuro", color: "bg-[#27ae60]" },
                  { key: "roxo-claro", label: "Lilás", color: "bg-[#af7ac5]" },
                  { key: "roxo-escuro", label: "Roxo", color: "bg-[#7d3c98]" },
                  { key: "laranja", label: "Laranja", color: "bg-[#eb984e]" },
                  { key: "rosa", label: "Rosa", color: "bg-[#ec7063]" },
                  { key: "cinza", label: "Cinza", color: "bg-[#85929e]" },
                  { key: "marinho", label: "Marinho", color: "bg-[#2c3e50]" },
                ].map((doc) => (
                <button
                  key={doc.key}
                  type="button"
                  onClick={() => updateField("doc_color", doc.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                    fields.doc_color === doc.key
                      ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${doc.color} shadow-sm`} />
                  {doc.label}
                </button>
                ))}
              </div>
            </div>
          )}

          {category !== "document" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">
                Banco
              </label>
              <div className="flex flex-wrap gap-2">
                {BANKS.map((bank) => (
                <button
                  key={bank.key}
                  type="button"
                  onClick={() => updateField("bank", bank.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                    fields.bank?.toLowerCase() === bank.key
                      ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${bank.color} shadow-sm`} />
                  {bank.label}
                </button>
              ))}
            </div>
          </div>
          )}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <Input
              id="title"
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoComplete="off"
            />

            {catConfig.fields.map((field) => {
              const fieldKey = `edit-${field.name}`
              const isPassword = field.type === "password"
              const isVisible = visibleFields.has(field.name)
              if (isPassword) {
                return (
                  <div key={field.name} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    <div className="relative">
                      <input
                        id={fieldKey}
                        type={isVisible ? "text" : "password"}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-20 text-sm transition-colors focus:outline-none focus:border-[var(--theme-secondary)] focus:ring-2 focus:ring-[var(--theme-secondary)]/20"
                        value={fields[field.name] || ""}
                        onChange={(e) => updateField(field.name, e.target.value)}
                        autoComplete="new-password"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
                        <button
                          type="button"
                          onClick={() => {
                            setVisibleFields(prev => {
                              const next = new Set(prev)
                              if (next.has(field.name)) next.delete(field.name)
                              else next.add(field.name)
                              return next
                            })
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title={isVisible ? "Ocultar" : "Mostrar"}
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(fields[field.name] || "")}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copiar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }
              return (
                <Input
                  key={field.name}
                  id={fieldKey}
                  label={field.label}
                  type={field.type}
                  value={fields[field.name] || ""}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  autoComplete="off"
                />
              )
            })}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Observações</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--theme-secondary)] focus:ring-2 focus:ring-[var(--theme-secondary)]/20 min-h-[80px] resize-y"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={saving}>
                <Save className="w-4 h-4 mr-2" /> Salvar
              </Button>
              <Link href={`/dashboard/passwords/${category}`}>
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <div className="flex-1" />
              <Button type="button" variant="danger" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
