"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard3D } from "@/components/credit-card-3d"
import { PASSWORD_CATEGORIES } from "@/types"
import { ArrowLeft, Save } from "lucide-react"

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

export default function NewPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as string
  const [title, setTitle] = useState("")
  const [fields, setFields] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [showCardNumber, setShowCardNumber] = useState(false)
  const supabase = createClient()

  const catConfig = PASSWORD_CATEGORIES.find((c) => c.key === category)
  const isCreditCard = category === "credit-card"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("passwords").insert({
      user_id: user.id,
      category,
      title: title.trim(),
      fields,
      notes,
    })

    if (!error) {
      router.push(`/dashboard/passwords/${category}`)
      router.refresh()
    }
    setSaving(false)
  }

  function updateField(name: string, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }))
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
        <h1 className="text-xl font-bold text-gray-900">
          Novo {catConfig.label}
        </h1>
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

          {/* Bank selector */}
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
              placeholder={`Ex: ${catConfig.label} - Identificação`}
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
                placeholder={field.label}
                value={fields[field.name] || ""}
                onChange={(e) => updateField(field.name, e.target.value)}
              />
            ))}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#2FC281] focus:ring-2 focus:ring-[#2FC281]/20 min-h-[80px] resize-y"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anotações adicionais..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={saving}>
                <Save className="w-4 h-4 mr-2" /> Salvar
              </Button>
              <Link href={`/dashboard/passwords/${category}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
