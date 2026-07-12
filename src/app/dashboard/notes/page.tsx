"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Plus,
  StickyNote,
  Pin,
  PinOff,
  Trash2,
  Search,
  BookOpen,
  Pencil,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

type Note = {
  id: string
  title: string
  content: string
  type: "note" | "checklist" | "agenda"
  pinned: boolean
  color: string
  checklist: { text: string; done: boolean }[]
  created_at: string
  updated_at: string
}

function NotesPageContent() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
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

  const filtered = notes
    .filter((n) => n.type === "note")
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

  const pageTitle = "Caderno"

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[var(--theme-primary)]/10 to-[#0891b2]/10">
            <StickyNote className="w-6 h-6 text-[var(--theme-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notas</h1>
            <p className="text-sm text-gray-500">{filtered.length} {filtered.length === 1 ? "item" : "itens"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/10 bg-white"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filtered.length > 0 && (
            <Link href="/dashboard/notes/new">
              <Button>
                <Plus className="w-4 h-4 mr-1" /> Criar Nota
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6 border border-gray-100">
            <StickyNote className="w-12 h-12 text-gray-200" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nada aqui ainda</h3>
          <p className="text-gray-500 mb-6">Crie sua primeira nota</p>
          <Link href="/dashboard/notes/new">
            <Button><Plus className="w-4 h-4 mr-1" /> Criar Nota</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((note) => (
            <Link key={note.id} href={`/dashboard/notes/${note.id}/edit`} className="block group">
              <div className="relative bg-white rounded-2xl border border-gray-200/80 p-5 hover:shadow-xl hover:border-[var(--theme-primary)]/30 transition-all duration-300 h-full">
                {note.pinned && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] rounded-full flex items-center justify-center shadow-md">
                    <Pin className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--theme-primary)]/20 to-[var(--theme-primary)]/10 flex items-center justify-center">
                    <StickyNote className="w-5 h-5 text-[var(--theme-primary)]" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.preventDefault(); router.push(`/dashboard/notes/${note.id}/edit`) }} className="p-1.5 hover:bg-gray-100 rounded-lg">
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
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-1">{note.title || "Sem título"}</h3>
                <p className="text-sm text-gray-500 line-clamp-4 leading-relaxed">{note.content || "Clique para editar..."}</p>
                <div className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-100">{formatDate(note.updated_at)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]" /></div>}>
      <NotesPageContent />
    </Suspense>
  )
}
