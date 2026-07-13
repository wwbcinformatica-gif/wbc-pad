"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Terminal } from "lucide-react"
import Link from "next/link"
import CodeEditor from "@/components/code-editor"

export default function NewCodigoPage() {
  const [title, setTitle] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

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
      user_id: user.id,
      title: title.trim(),
      content,
      type: "caderno",
      pinned: false,
      checklist: [],
    }
    if (allTags.length > 0) record.tags = allTags

    let result = await supabase.from("notes").insert(record)
    let err = result.error

    if (err && err.code === "42703") {
      delete record.tags
      result = await supabase.from("notes").insert(record)
      err = result.error
    }

    if (err) { setError(err.message); setSaving(false); return }
    router.push("/dashboard/codigos")
    router.refresh()
  }

  return (
    <div className="flex flex-col">
      <div className="shrink-0 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/codigos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Novo Código</h1>
        </div>
      </div>

      <div className="flex-1">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-3 flex-col sm:flex-row">
      <div className="min-h-0 flex-1 overflow-y-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                placeholder="Nome do código..."
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
              placeholder="Breve descrição do código..."
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
            {saving ? "Salvando..." : <><Plus className="w-4 h-4 mr-1" /> Salvar Código</>}
          </Button>
        </form>
      </div>
    </div>
  )
}
