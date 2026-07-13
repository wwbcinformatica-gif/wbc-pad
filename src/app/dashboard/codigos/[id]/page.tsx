"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { ArrowLeft, Edit, Terminal, Maximize2, X, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import MarkdownRenderer from "@/components/markdown-renderer"
import CodeViewActions from "@/components/code-view-actions"
import { useCodeTheme } from "@/contexts/code-theme-context"

const FONT = "'Cascadia Code', 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace"

interface Props {
  params: Promise<{ id: string }>
}

function extractCodeFromContent(content: string) {
  const match = content.match(/```(\w*)\n([\s\S]*?)```/)
  if (match) return { language: match[1] || "text", code: match[2].trim() }
  return { language: "text", code: content }
}

export default function CodigoViewPage({ params }: Props) {
  const { id } = use(params)
  const { theme } = useCodeTheme()
  const isDark = theme === "dark"
  const [note, setNote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false)
    }
    if (fullscreen) {
      document.addEventListener("keydown", handler)
      return () => document.removeEventListener("keydown", handler)
    }
  }, [fullscreen])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("type", "caderno")
      .single()

    if (!data || !(data.tags || []).includes("codigo")) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setNote(data)
    setLoading(false)
  }

  async function handleCopy() {
    const { code } = extractCodeFromContent(note?.content || "")
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    )
  }

  if (notFound || !note) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Código não encontrado</p>
        <Link href="/dashboard/codigos" className="text-indigo-500 hover:underline mt-2 block">Voltar</Link>
      </div>
    )
  }

  const { code, language } = extractCodeFromContent(note.content || "")

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/codigos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <CodeViewActions />
            <button
              onClick={() => setFullscreen(true)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? "text-gray-400 hover:text-blue-400 hover:bg-[#2a2d2e]" : "text-gray-500 hover:text-blue-600 hover:bg-gray-200"
              }`}
              title="Visualização completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <Link href={`/dashboard/codigos/${id}/edit`}>
              <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white">
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className={`rounded-xl border overflow-hidden ${isDark ? "bg-[#000] border-[#2a2a2a]" : "bg-white border-gray-200"}`}>
          <div className={`flex items-center gap-3 px-6 py-4 border-b ${isDark ? "border-[#2a2a2a]" : "border-gray-100"}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? "bg-[#1a1a1a]" : "bg-indigo-100"}`}>
              <Terminal className={`w-5 h-5 ${isDark ? "text-[#569cd6]" : "text-indigo-600"}`} />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? "text-[#d4d4d4]" : "text-gray-900"}`}>{note.title || "Sem título"}</h1>
            </div>
          </div>

          <div className="px-6 py-5">
            <MarkdownRenderer content={note.content || ""} />
          </div>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#1e1e1e]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-[#569cd6]" />
              <span className="text-sm text-[#d4d4d4] font-medium">{note.title || "Sem título"}</span>
              <span className="text-xs text-[#858585] px-2 py-0.5 bg-[#3c3c3c] rounded">{language}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#3c3c3c] text-[#d4d4d4] hover:bg-[#4a4a4a] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copiado!" : "Copiar código"}
              </button>
              <button
                onClick={() => setFullscreen(false)}
                className="p-1.5 rounded-md text-[#858585] hover:text-[#d4d4d4] hover:bg-[#3c3c3c] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <pre className="p-4 text-sm text-[#d4d4d4] m-0 select-text" style={{ fontFamily: FONT, lineHeight: "22px", tabSize: 2 }}>
              <code>{code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
