"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Pin,
  PinOff,
  Trash2,
  Search,
  BookOpen,
  Clock,
  MapPin,
  Bell,
  Pencil,
  Download,
} from "lucide-react"

type AgendaData = {
  date: string
  time: string | null
  endTime: string | null
  allDay: boolean
  reminder: string
  location: string
  status: "pending" | "done" | "cancelled"
  notes: string
}

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

function parseAgenda(content: string): AgendaData | null {
  try { return JSON.parse(content) } catch { return null }
}

function formatAgendaDate(dateStr: string) {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T12:00:00")
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
}

function getDayName(dateStr: string) {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T12:00:00")
  const dias = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]
  return dias[d.getDay()]
}

function getDayNumber(dateStr: string) {
  if (!dateStr) return ""
  return new Date(dateStr + "T12:00:00").getDate()
}

function getMonthName(dateStr: string) {
  if (!dateStr) return ""
  const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
  return meses[new Date(dateStr + "T12:00:00").getMonth()]
}

function getStatusColor(status: string) {
  switch (status) {
    case "done": return "text-green-600 bg-green-50 border-green-200"
    case "cancelled": return "text-red-600 bg-red-50 border-red-200"
    default: return "text-yellow-600 bg-yellow-50 border-yellow-200"
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "done": return "Concluído"
    case "cancelled": return "Cancelado"
    default: return "Pendente"
  }
}

function AgendaPageContent() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    loadNotes()
  }, [pathname])

  async function loadNotes(retries = 5) {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 300))
        return loadNotes(retries - 1)
      }
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

  function handleDownload() {
    const now = new Date().toLocaleDateString("pt-BR")
    const sep = "═".repeat(56)
    const lines: string[] = []

    lines.push(sep)
    lines.push("  AGENDA — WBC PAD")
    lines.push(`  Exportado em: ${now}`)
    lines.push(sep)
    lines.push("")

    for (const note of filtered) {
      const agenda = parseAgenda(note.content)
      if (!agenda) continue

      const dateObj = new Date(agenda.date + "T12:00:00")
      const dateStr = dateObj.toLocaleDateString("pt-BR")
      const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
      const diaSemana = dias[dateObj.getDay()]

      const statusMap: Record<string, string> = { pending: "Pendente", done: "Concluído", cancelled: "Cancelado" }

      lines.push(`  ─── ${note.title || "Sem título"} ───`)
      lines.push("")
      lines.push(`     Data: ${dateStr} (${diaSemana})`)
      if (agenda.allDay) {
        lines.push("     Horário: Dia inteiro")
      } else if (agenda.time) {
        lines.push(`     Horário: ${agenda.time}${agenda.endTime ? ` — ${agenda.endTime}` : ""}`)
      }
      if (agenda.location) lines.push(`     Local: ${agenda.location}`)
      lines.push(`     Status: ${statusMap[agenda.status] || agenda.status}`)
      if (agenda.reminder) lines.push(`     Lembrete: ${agenda.reminder} min antes`)
      if (agenda.notes) lines.push(`     Observações: ${agenda.notes}`)
      lines.push("")
    }

    lines.push(sep)
    lines.push("  Fim do relatório")
    lines.push(sep)

    const txt = lines.join("\n")
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `agenda-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filtered = notes
    .filter((n) => n.type === "agenda")
    .filter((n) => {
      const q = search.toLowerCase()
      const agenda = parseAgenda(n.content)
      const locationMatch = agenda?.location?.toLowerCase().includes(q)
      return n.title.toLowerCase().includes(q) || locationMatch
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
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#f59e0b]/10 to-[#d97706]/10">
            <BookOpen className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
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
                className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300">
                <Download className="w-4 h-4" /> Download TXT
              </Button>
              <Link href="/dashboard/agenda/new">
                <Button>
                  <Plus className="w-4 h-4 mr-1" /> Criar Compromisso
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
            <BookOpen className="w-12 h-12 text-gray-200" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nada aqui ainda</h3>
          <p className="text-gray-500 mb-6">Crie seu primeiro compromisso</p>
          <Link href="/dashboard/agenda/new">
            <Button><Plus className="w-4 h-4 mr-1" /> Criar Compromisso</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((note) => {
            const agenda = parseAgenda(note.content)
            if (!agenda) return null
            
            const isPast = agenda.date && new Date(agenda.date + "T23:59:59") < new Date()
            const isToday = agenda.date === new Date().toISOString().slice(0, 10)
            return (
              <Link key={note.id} href={`/dashboard/agenda/${note.id}/edit`} className="block group">
                <div className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 h-full hover:shadow-xl ${
                  isToday ? "border-[var(--theme-primary)]/40" :
                  agenda.status === "done" ? "border-green-200/60" :
                  agenda.status === "cancelled" ? "border-red-200/60" :
                  "border-gray-200/80"
                }`}>
                  {/* Top gradient stripe */}
                  <div className={`h-1.5 w-full ${
                    isToday ? "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)]" :
                    agenda.status === "done" ? "bg-green-400" :
                    agenda.status === "cancelled" ? "bg-red-400" :
                    "bg-gradient-to-r from-[#f59e0b] to-[#d97706]"
                  }`} />

                  {/* Date badge */}
                  <div className="absolute top-4 right-4 flex flex-col items-center">
                    <div className={`w-14 h-16 rounded-xl flex flex-col items-center justify-center shadow-sm ${
                      isToday ? "bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white" : "bg-gray-50 border border-gray-200"
                    }`}>
                      <span className={`text-[10px] font-bold uppercase leading-tight ${isToday ? "text-white/80" : "text-gray-500"}`}>
                        {getDayName(agenda.date)}
                      </span>
                      <span className={`text-xl font-extrabold leading-tight ${isToday ? "text-white" : "text-gray-900"}`}>
                        {getDayNumber(agenda.date)}
                      </span>
                      <span className={`text-[9px] font-bold uppercase leading-tight ${isToday ? "text-white/80" : "text-gray-500"}`}>
                        {getMonthName(agenda.date)}
                      </span>
                    </div>
                    {note.pinned && (
                      <div className="mt-1 w-5 h-5 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] rounded-full flex items-center justify-center shadow-sm">
                        <Pin className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 pt-5 pr-4 lg:pr-20">
                    <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-1">{note.title || "Sem título"}</h3>

                    {/* Time row */}
                    {!agenda.allDay && agenda.time ? (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {agenda.time}
                          {agenda.endTime ? ` — ${agenda.endTime}` : ""}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-400">Dia inteiro</span>
                      </div>
                    )}

                    {/* Location */}
                    {agenda.location && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <span className="text-sm text-gray-600 truncate">{agenda.location}</span>
                      </div>
                    )}

                    {/* Date text */}
                    <div className="text-xs text-gray-400 mb-3">
                      {formatAgendaDate(agenda.date)}
                      {isPast && agenda.status === "pending" && (
                        <span className="ml-2 text-red-400 font-medium">⚠ Atrasado</span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${getStatusColor(agenda.status)}`}>
                        {getStatusLabel(agenda.status)}
                      </span>
                      {agenda.reminder && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                          <Bell className="w-3 h-3" /> {agenda.reminder}min
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-4 left-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.preventDefault(); router.push(`/dashboard/agenda/${note.id}/edit`) }} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white border border-gray-200">
                      <Pencil className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); togglePin(note) }} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white border border-gray-200">
                      {note.pinned ? <PinOff className="w-3.5 h-3.5 text-[var(--theme-primary)]" /> : <Pin className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                    <button onClick={(e) => { e.preventDefault(); handleDelete(note.id) }} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white border border-gray-200">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AgendaPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]" /></div>}>
      <AgendaPageContent />
    </Suspense>
  )
}
