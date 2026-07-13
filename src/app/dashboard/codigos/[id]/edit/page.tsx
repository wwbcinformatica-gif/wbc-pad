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
    <div className="flex flex-col overflow-hidden" style={{ height: '100%' }}>
      <div className="shrink-0 pb-4">
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

      <div className="min-h-0 flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional, aceita markdown)</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 resize-none"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Linguagem</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="tsx">TSX</option>
              <option value="jsx">JSX</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash</option>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="markdown">Markdown</option>
              <option value="xml">XML</option>
              <option value="text">Texto puro</option>
            </select>
          </div>

          <div>
            <CodeEditor
              code={code}
              onChange={setCode}
              language={language}
              onLanguageChange={setLanguage}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={saving || !title.trim()} className="bg-indigo-500 hover:bg-indigo-600 text-white">
            {saving ? "Salvando..." : <><Save className="w-4 h-4 mr-1" /> Salvar</>}
          </Button>
        </form>
      </div>
    </div>
  )
}
