"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Plus, Pin, PinOff, Trash2, Search, BookOpen, Pencil, Tag, Download } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { formatDate } from "@/lib/utils"

type Caderno = {
  id: string
  title: string
  content: string
  type: "caderno"
  pinned: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export default function CadernoPage() {
  const [items, setItems] = useState<Caderno[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load(retries = 3) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 500))
        return load(retries - 1)
      }
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "caderno")
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false })
    if (data) setItems(data.filter((item: Caderno) => !(item.tags || []).includes("codigo")) as Caderno[])
    setLoading(false)
  }

  async function togglePin(item: Caderno) {
    await supabase.from("notes").update({ pinned: !item.pinned }).eq("id", item.id)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta página do caderno?")) return
    await supabase.from("notes").delete().eq("id", id)
    load()
  }

  function handleDownload(item: Caderno) {
    const txt = `${item.title}\n\n${item.content}`
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${item.title || "pagina"}.txt`
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-amber-100 border border-amber-200">
            <BookOpen className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Caderno</h1>
            <p className="text-sm text-gray-500">{filtered.length} {filtered.length === 1 ? "página" : "páginas"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 bg-white"
              placeholder="Buscar no caderno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/dashboard/caderno/new">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Nova Página
            </Button>
          </Link>
        </div>
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6 border border-amber-100">
            <BookOpen className="w-12 h-12 text-amber-200" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Caderno vazio</h3>
          <p className="text-gray-500 mb-6">Crie sua primeira página do caderno</p>
          <Link href="/dashboard/caderno/new">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Nova Página
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 min-w-0">
          {filtered.map((item) => (
            <div key={item.id} className="group relative min-w-0">
              {/* Notebook card */}
              <div
                className="relative overflow-hidden w-full cursor-pointer hover:shadow-xl transition-all duration-300"
                style={{
                  background: "linear-gradient(180deg, #fdf8e1 0%, #fef9e4 100%)",
                  border: "1px solid #e8d98a",
                  borderRadius: "2px 8px 8px 2px",
                  borderLeft: "6px solid #f59e0b",
                  minHeight: "220px",
                  boxShadow: "2px 3px 10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.7)",
                }}
                onClick={() => router.push(`/dashboard/caderno/${item.id}/edit`)}
              >
                {/* Lined paper background */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #d4c17f55 27px, #d4c17f55 28px)",
                    backgroundSize: "100% 28px",
                    backgroundPosition: "0 36px",
                  }}
                />

                {/* Pin badge */}
                {item.pinned && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow z-10">
                    <Pin className="w-3 h-3 text-white" />
                  </div>
                )}

                <div className="relative z-10 p-4 pb-3">
                  {/* Title */}
                  <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-1 pr-6" style={{ fontFamily: "'Georgia', serif" }}>
                    {item.title || "Sem título"}
                  </h3>

                  {/* Content preview */}
                  <div className="text-sm text-gray-600 line-clamp-4 leading-7 [&_*]:leading-7 break-words overflow-x-hidden min-w-0 [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:break-all [&_img]:max-w-full [&_table]:block [&_table]:overflow-x-auto" style={{ fontFamily: "'Georgia', serif" }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.content || ""}
                    </ReactMarkdown>
                  </div>

                  {/* Tags */}
                  {(item.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(item.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-800 font-medium">
                          <Tag className="w-2.5 h-2.5" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="relative z-10 px-4 pb-3 mt-auto">
                  <div
                    className="flex items-center justify-between pt-2"
                    style={{ borderTop: "1px solid #d4c17f55" }}
                  >
                    <span className="text-[10px] text-amber-700/60">{formatDate(item.updated_at)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/caderno/${item.id}/edit`) }}
                        className="p-1.5 hover:bg-amber-200/50 rounded-lg"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5 text-amber-700" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(item) }}
                        className="p-1.5 hover:bg-amber-200/50 rounded-lg"
                        title="Download TXT"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-600" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePin(item) }}
                        className="p-1.5 hover:bg-amber-200/50 rounded-lg"
                        title={item.pinned ? "Desafixar" : "Fixar"}
                      >
                        {item.pinned
                          ? <PinOff className="w-3.5 h-3.5 text-amber-700" />
                          : <Pin className="w-3.5 h-3.5 text-amber-500" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                        className="p-1.5 hover:bg-red-100 rounded-lg"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
