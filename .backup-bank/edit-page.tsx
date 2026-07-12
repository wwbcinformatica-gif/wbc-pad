"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard3D } from "@/components/credit-card-3d"
import { PASSWORD_CATEGORIES } from "@/types"
import { ArrowLeft, Save, Trash2 } from "lucide-react"

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
  const supabase = createClient()

  const catConfig = PASSWORD_CATEGORIES.find((c) => c.key === category)
  const isCreditCard = category === "credit-card"

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
      setTitle(data.title)
      setFields(data.fields)
      setNotes(data.notes || "")
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)

    await supabase
      .from("passwords")
      .update({ title: title.trim(), fields, notes, updated_at: new Date().toISOString() })
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13D0D0]" />
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

      {/* 3D Card Preview for Credit Cards */}
      {isCreditCard && (
        <div className="space-y-4">
          <CreditCard3D
            title={title}
            fields={fields}
            visible={showCardNumber}
            onToggleVisibility={() => setShowCardNumber(!showCardNumber)}
            onCopy={(text) => navigator.clipboard.writeText(text)}
            variant="both"
          />

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
                      ? "border-[#13D0D0] bg-[#13D0D0]/10 text-[#13D0D0] shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${bank.color} shadow-sm`} />
                  {bank.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="title"
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {catConfig.fields.map((field) => (
              <Input
                key={field.name}
                id={field.name}
                label={field.label}
                type={field.type}
                value={fields[field.name] || ""}
                onChange={(e) => updateField(field.name, e.target.value)}
              />
            ))}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Observações</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#2FC281] focus:ring-2 focus:ring-[#2FC281]/20 min-h-[80px] resize-y"
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
