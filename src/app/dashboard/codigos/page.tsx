"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Plus, Search, Code, Trash2, Pin, PinOff, Pencil, Download, Terminal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import MarkdownRenderer from "@/components/markdown-renderer"
import { useCodeTheme } from "@/contexts/code-theme-context"

type Codigo = {
  id: string
  title: string
  content: string
  type: "codigo"
  pinned: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

const LANG_ICONS: Record<string, string> = {
  javascript: "JS", typescript: "TS", python: "Py", html: "HTML",
  css: "CSS", sql: "SQL", java: "Java", go: "Go", rust: "RS",
  csharp: "C#", php: "PHP", ruby: "Rb", bash: "bash", json: "{}",
  yaml: "YM", markdown: "MD", xml: "XML", docker: "Dkr",
}

function getLangLabel(code: Codigo) {
  const firstLine = code.content.split("\n")[0]
  const match = firstLine?.match(/^```(\w+)/)
  return (match?.[1] || (code.tags?.[0]) || "code").toLowerCase()
}

export default function CodigosPage() {
  const [items, setItems] = useState<Codigo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useCodeTheme()
  const isDark = theme === "dark"

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "caderno")
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false })
    if (data) setItems(data.filter((item: any) => (item.tags || []).includes("codigo")) as Codigo[])
    setLoading(false)
  }

  async function togglePin(item: Codigo) {
    await supabase.from("notes").update({ pinned: !item.pinned }).eq("id", item.id)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este código?")) return
    await supabase.from("notes").delete().eq("id", id)
    load()
  }

  function handleDownload(item: Codigo) {
    const txt = item.content.replace(/^```\w*\n?/gm, "").replace(/```$/gm, "").trim()
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${item.title || "codigo"}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filtered = items.filter((n) => {
    const q = search.toLowerCase()
    return (
      n.title.toLowerCase().includes(q) ||
      (n.content || "").toLowerCase().includes(q) ||
      (n.tags || []).some((t) => t.toLowerCase().includes(q))
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-indigo-100 border border-indigo-200">
            <Terminal className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Códigos</h1>
            <p className="text-sm text-gray-500">{filtered.length} {filtered.length === 1 ? "código" : "códigos"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white"
              placeholder="Buscar códigos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/dashboard/codigos/new">
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Novo Código
            </Button>
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${
            isDark ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-indigo-50 border-indigo-100"
          }`}>
            <Code className={`w-12 h-12 ${isDark ? "text-[#3a3a3a]" : "text-indigo-200"}`} />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${isDark ? "text-[#d4d4d4]" : "text-gray-900"}`}>Nenhum código ainda</h3>
          <p className={`mb-6 ${isDark ? "text-[#6a6a6a]" : "text-gray-500"}`}>Salve seus snippets de código com syntax highlight</p>
          <Link href="/dashboard/codigos/new">
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Novo Código
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const lang = getLangLabel(item)
            const icon = LANG_ICONS[lang] || lang.slice(0, 2).toUpperCase()
            return (
              <div key={item.id} className="group relative">
                <div
                  className={`relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 rounded-xl border ${
                    isDark
                      ? "bg-[#000] border-[#2a2a2a] hover:border-indigo-700 text-[#d4d4d4]"
                      : "bg-white border-gray-200 hover:border-indigo-300 text-gray-800"
                  }`}
                  style={{ minHeight: "200px" }}
                  onClick={() => router.push(`/dashboard/codigos/${item.id}`)}
                >
                  {item.pinned && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow z-10">
                      <Pin className="w-3 h-3 text-white" />
                    </div>
                  )}

                  <div className="p-4 pb-3">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-7 h-7 rounded-md text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                        isDark ? "bg-[#1a1a1a] text-[#569cd6]" : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {icon}
                      </span>
                      <h3 className={`font-semibold text-sm line-clamp-1 pr-6 font-mono ${isDark ? "text-[#d4d4d4]" : "text-gray-800"}`}>
                        {item.title || "Sem título"}
                      </h3>
                    </div>

                    <div className={`text-xs line-clamp-4 font-mono leading-5 whitespace-pre-wrap break-words overflow-x-hidden ${isDark ? "text-[#969696]" : "text-gray-500"}`}>
                      {item.content.replace(/^```\w*\n?/gm, "").replace(/```$/gm, "").trim()}
                    </div>

                    {(item.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {(item.tags || []).slice(0, 3).map((tag) => (
                          <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isDark ? "bg-[#1a1a1a] text-[#969696]" : "bg-indigo-100 text-indigo-700"
                          }`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-4 pb-3 mt-auto">
                    <div className={`flex items-center justify-between pt-2 border-t ${isDark ? "border-[#2a2a2a]" : "border-gray-100"}`}>
                      <span className={`text-[10px] ${isDark ? "text-[#6a6a6a]" : "text-gray-400"}`}>{formatDate(item.updated_at)}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/codigos/${item.id}`) }} className={`p-1.5 rounded-lg ${isDark ? "hover:bg-[#1a1a1a]" : "hover:bg-indigo-100"}`} title="Visualizar">
                          <Code className={`w-3.5 h-3.5 ${isDark ? "text-[#569cd6]" : "text-indigo-600"}`} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDownload(item) }} className={`p-1.5 rounded-lg ${isDark ? "hover:bg-[#1a1a1a]" : "hover:bg-indigo-100"}`} title="Download">
                          <Download className={`w-3.5 h-3.5 ${isDark ? "text-[#969696]" : "text-indigo-600"}`} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); togglePin(item) }} className={`p-1.5 rounded-lg ${isDark ? "hover:bg-[#1a1a1a]" : "hover:bg-indigo-100"}`} title={item.pinned ? "Desafixar" : "Fixar"}>
                          {item.pinned
                            ? <PinOff className={`w-3.5 h-3.5 ${isDark ? "text-[#d4d4d4]" : "text-indigo-700"}`} />
                            : <Pin className={`w-3.5 h-3.5 ${isDark ? "text-[#569cd6]" : "text-indigo-500"}`} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }} className="p-1.5 hover:bg-red-100 rounded-lg" title="Excluir">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
