"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Terminal } from "lucide-react"
import Link from "next/link"
import CodeEditor from "@/components/code-editor"

function extractCodeParts(content: string) {
  const descMatch = content.match(/^([\s\S]*?)(?=```)/)
  const codeMatch = content.match(/```(\w*)\n([\s\S]*?)```/)
  return {
    description: descMatch?.[1]?.trim() || "",
    language: codeMatch?.[1] || "javascript",
    code: codeMatch?.[2]?.trim() || content,
  }
}

export default function EditCodigoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [title, setTitle] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error: err } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("type", "caderno")
      .single()

    if (err || !data || !(data.tags || []).includes("codigo")) { setError(err?.message || "Não encontrado"); setLoading(false); return }

    setTitle(data.title || "")
    const parts = extractCodeParts(data.content || "")
    setDescription(parts.description)
    setLanguage(parts.language)
    setCode(parts.code)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("Não autenticado"); setSaving(false); return }

    const allTags = [...new Set(["codigo", language].filter(Boolean))]

    const content = description
      ? `${description}\n\n\`\`\`${language}\n${code}\n\`\`\``
      : `\`\`\`${language}\n${code}\n\`\`\``

    const record: Record<string, any> = {
      title: title.trim(),
      content,
      tags: allTags,
    }

    const { error: updateErr } = await supabase.from("notes").update(record).eq("id", id).eq("user_id", user.id)
    if (updateErr) { setError(updateErr.message); setSaving(false); return }

    router.push(`/dashboard/codigos/${id}`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 pb-3">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/codigos/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Editar Código</h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="shrink-0 flex gap-2 mb-3">
            <input
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
            />
            <input
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição (opcional)"
            />
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor
              code={code}
              onChange={setCode}
              language={language}
              onLanguageChange={setLanguage}
            />
          </div>

          <div className="shrink-0 flex items-center gap-3 pt-3">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="ml-auto">
              <Button type="submit" disabled={saving || !title.trim()} className="bg-indigo-500 hover:bg-indigo-600 text-white">
                {saving ? "Salvando..." : <><Save className="w-4 h-4 mr-1" /> Salvar</>}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
