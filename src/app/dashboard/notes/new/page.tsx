"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewNotePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
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
    if (!user) {
      setError("Usuário não autenticado")
      setSaving(false)
      return
    }

    const { error: err } = await supabase.from("notes").insert({
      user_id: user.id,
      title: title.trim(),
      content: content,
      type: "note",
      checklist: [],
    })

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push("/dashboard/notes")
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/notes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nova Nota</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Sticky Note Style Container */}
        <div className="relative rounded-bl-3xl rounded-tr-lg rounded-tl-lg rounded-br-lg shadow-lg overflow-hidden bg-yellow-100/80 border border-yellow-200/50 transition-all hover:shadow-xl">
          {/* Folded corner effect */}
          <div className="absolute bottom-0 left-0 w-8 h-8 bg-yellow-200/60 rounded-tr-lg" style={{ boxShadow: '2px -2px 4px rgba(0,0,0,0.05)' }} />

          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Title area */}
            <div className="mb-6">
              <input
                className="w-full text-2xl font-bold border-none outline-none bg-transparent text-gray-900 placeholder-gray-500/50 pb-2"
                placeholder="Título da nota..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {/* Line under title */}
              <div className="h-px bg-yellow-300/50" />
            </div>

            {/* Content area */}
            <div className="relative">
              <textarea
                className="w-full min-h-[400px] bg-transparent border-none outline-none resize-none text-base text-gray-800 placeholder-gray-500/50 leading-relaxed"
                placeholder="Escreva sua nota aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex items-center justify-between mt-6 gap-3">
          <Link href="/dashboard/notes">
            <Button type="button" variant="ghost">Cancelar</Button>
          </Link>
          <Button
            type="submit"
            disabled={saving || !title.trim()}
            className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)]"
          >
            {saving ? "Salvando..." : "Salvar Nota"}
          </Button>
        </div>
      </form>
    </div>
  )
}
