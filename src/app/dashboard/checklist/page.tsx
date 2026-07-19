"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Plus,
  CheckSquare,
  Pin,
  PinOff,
  Trash2,
  Search,
  Pencil,
  Download,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

type Note = {
  id: string
  title: string
  content: string
  type: "note" | "checklist" | "agenda"
  pinned: boolean
  color: string
  checklist: { text: string; icon?: string; done: boolean }[]
  created_at: string
  updated_at: string
}

function ChecklistPageContent() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    loadNotes()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadNotes()
    })
    return () => subscription.unsubscribe()
  }, [pathname])

  async function loadNotes() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from("notes").select("*").eq("user_id", user.id)
      .order("pinned", { ascending: false }).order("updated_at", { ascending: false })
    if (data) setNotes(data)
    setLoading(false)
  }

  async function togglePin(note: Note) {
    await supabase.from("notes").update({ pinned: !note.pinned }).eq("id", note.id)
    loadNotes()
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir?")) return
    await supabase.from("notes").delete().eq("id", id)
    loadNotes()
  }

  function startEditing(note: Note) {
    setEditingId(note.id)
    setEditingTitle(note.title || "")
  }

  async function saveTitle(noteId: string) {
    const newTitle = editingTitle.trim()
    if (newTitle) {
      await supabase.from("notes").update({ title: newTitle }).eq("id", noteId)
      setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, title: newTitle } : n)))
    }
    setEditingId(null)
    setEditingTitle("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, noteId: string) {
    if (e.key === "Enter") {
      e.preventDefault()
      saveTitle(noteId)
    } else if (e.key === "Escape") {
      setEditingId(null)
      setEditingTitle("")
    }
  }

  function handleDownload() {
    const now = new Date().toLocaleDateString("pt-BR")
    const sep = "═".repeat(56)
    const lines: string[] = []

    lines.push(sep)
    lines.push("  LISTA DE COMPRAS — WBC PAD")
    lines.push(`  Exportado em: ${now}`)
    lines.push(sep)
    lines.push("")

    for (const note of filtered) {
      const total = note.checklist?.length || 0
      const done = note.checklist?.filter((i) => i.done).length || 0

      lines.push(`┌${"─".repeat(54)}┐`)
      lines.push(`│ ${note.title || "Sem título"}${" ".repeat(Math.max(0, 52 - (note.title || "Sem título").length))}│`)
      lines.push(`└${"─".repeat(54)}┘`)
      lines.push("")

      if (total === 0) {
        lines.push("     (lista vazia)")
        lines.push("")
      } else {
        for (const item of note.checklist!) {
          lines.push(`     ${item.done ? "☑" : "☐"} ${item.text}`)
        }
        lines.push("")
        lines.push(`     Progresso: ${done}/${total} (${Math.round((done / total) * 100)}%)`)
        lines.push("")
      }
    }

    lines.push(sep)
    lines.push("  Fim do relatório")
    lines.push(sep)

    const txt = lines.join("\n")
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `lista-compras-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filtered = notes
    .filter((n) => n.type === "checklist")
    .filter((n) => {
      const q = search.toLowerCase()
      return n.title.toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q)
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[var(--theme-secondary)]/10 to-[#16a34a]/10">
            <CheckSquare className="w-6 h-6 text-[var(--theme-secondary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lista de Compras</h1>
            <p className="text-sm text-gray-500">{filtered.length} {filtered.length === 1 ? "item" : "itens"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/10 bg-white"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filtered.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleDownload}
                className="gap-2 border-[var(--theme-secondary)]/40 text-[var(--theme-secondary)] hover:bg-green-50 hover:border-[var(--theme-secondary)]">
                <Download className="w-4 h-4" /> Download TXT
              </Button>
              <Link href="/dashboard/checklist/new">
                <Button>
                  <Plus className="w-4 h-4 mr-1" /> Criar Lista
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6 border border-gray-100">
            <CheckSquare className="w-12 h-12 text-gray-200" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nada aqui ainda</h3>
          <p className="text-gray-500 mb-6">Crie sua primeira lista de compras</p>
          <Link href="/dashboard/checklist/new">
            <Button><Plus className="w-4 h-4 mr-1" /> Criar Lista</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((note) => {
            const done = note.checklist?.filter((i) => i.done).length || 0
            const total = note.checklist?.length || 0
            return (
              <Link key={note.id} href={`/dashboard/checklist/${note.id}/edit`} className="block group">
                <div className="relative bg-white rounded-2xl border border-gray-200/80 p-5 hover:shadow-xl hover:border-[var(--theme-secondary)]/30 transition-all duration-300 h-full">
                  {note.pinned && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] rounded-full flex items-center justify-center shadow-md">
                      <Pin className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--theme-secondary)]/20 to-[var(--theme-secondary)]/10 flex items-center justify-center text-xl">
                      {note.checklist?.find(i => i.icon)?.icon || <CheckSquare className="w-5 h-5 text-[var(--theme-secondary)]" />}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.preventDefault(); router.push(`/dashboard/checklist/${note.id}/edit`) }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Pencil className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); togglePin(note) }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        {note.pinned ? <PinOff className="w-3.5 h-3.5 text-[var(--theme-primary)]" /> : <Pin className="w-3.5 h-3.5 text-gray-400" />}
                      </button>
                      <button onClick={(e) => { e.preventDefault(); handleDelete(note.id) }} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                  {editingId === note.id ? (
                    <div className="mb-3 relative">
                      <div className="absolute -top-2 left-0 px-1.5 py-0.5 bg-[var(--theme-primary)] rounded text-[8px] text-white font-medium z-10">
                        Editando
                      </div>
                      <input
                        autoFocus
                        className="font-semibold text-gray-900 text-sm w-full border-2 border-[var(--theme-primary)] rounded-lg px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[var(--theme-primary)]/20 bg-[var(--theme-primary)]/5 shadow-inner"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => saveTitle(note.id)}
                        onKeyDown={(e) => handleKeyDown(e, note.id)}
                        onClick={(e) => e.preventDefault()}
                      />
                    </div>
                  ) : (
                    <h3
                      className="font-semibold text-gray-900 text-sm mb-3 line-clamp-1 cursor-pointer hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/5 hover:px-2 hover:-mx-2 hover:py-1 rounded-lg transition-all"
                      title="Duplo clique para editar"
                      onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); startEditing(note) }}
                    >
                      {note.title || "Sem título"}
                    </h3>
                  )}
                  {total > 0 && (
                    <>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                        <span>{done}/{total} concluídos</span>
                        <span className="font-semibold text-[var(--theme-secondary)]">{Math.round((done / total) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
                      </div>
                    </>
                  )}
                  {total > 0 && (
                    <ul className="mt-3 space-y-1">
                      {note.checklist.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex-shrink-0 w-4 text-center text-sm leading-none">
                            {item.icon || (item.done ? "✓" : "")}
                          </span>
                          <span className={item.done ? "line-through text-gray-400 truncate" : "truncate"}>{item.text || "..."}</span>
                        </li>
                      ))}
                      {total > 3 && <li className="text-xs text-gray-400">+{total - 3} itens</li>}
                    </ul>
                  )}
                  <div className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-100">{formatDate(note.updated_at)}</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ChecklistPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]" /></div>}>
      <ChecklistPageContent />
    </Suspense>
  )
}
