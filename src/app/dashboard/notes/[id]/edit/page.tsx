"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Plus, Trash2, Pin, PinOff, Clock, Bell, MapPin } from "lucide-react"

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

export default function EditNotePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<"note" | "checklist" | "agenda">("note")
  const [checklist, setChecklist] = useState<{ text: string; done: boolean }[]>([])
  const [pinned, setPinned] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const supabase = createClient()

  // Agenda
  const [agendaDate, setAgendaDate] = useState("")
  const [agendaTime, setAgendaTime] = useState("")
  const [agendaEndTime, setAgendaEndTime] = useState("")
  const [agendaAllDay, setAgendaAllDay] = useState(false)
  const [agendaReminder, setAgendaReminder] = useState("15")
  const [agendaLocation, setAgendaLocation] = useState("")
  const [agendaStatus, setAgendaStatus] = useState<"pending" | "done" | "cancelled">("pending")
  const [agendaNotes, setAgendaNotes] = useState("")

  useEffect(() => {
    loadNote()
  }, [id])

  async function loadNote() {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data) {
      setTitle(data.title)
      setPinned(data.pinned)
      setType(data.type)
      if (data.checklist) setChecklist(data.checklist)

      if (data.type === "agenda" && data.content) {
        try {
          const a: AgendaData = JSON.parse(data.content)
          setAgendaDate(a.date || "")
          setAgendaTime(a.time || "")
          setAgendaEndTime(a.endTime || "")
          setAgendaAllDay(a.allDay || false)
          setAgendaReminder(a.reminder || "15")
          setAgendaLocation(a.location || "")
          setAgendaStatus(a.status || "pending")
          setAgendaNotes(a.notes || "")
        } catch {
          setContent(data.content || "")
        }
      } else {
        setContent(data.content || "")
      }
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError("")

    let finalContent = content
    if (type === "agenda") {
      finalContent = JSON.stringify({
        date: agendaDate,
        time: agendaAllDay ? null : agendaTime,
        endTime: agendaAllDay ? null : agendaEndTime,
        allDay: agendaAllDay,
        reminder: agendaReminder,
        location: agendaLocation,
        status: agendaStatus,
        notes: agendaNotes,
      })
    }

    const { error: err } = await supabase.from("notes").update({
      title: title.trim(),
      content: finalContent,
      type,
      pinned,
      checklist: type === "checklist" ? checklist : [],
      updated_at: new Date().toISOString(),
    }).eq("id", id)

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push("/dashboard/notes")
    router.refresh()
  }

  async function handleTogglePin() {
    setPinned(!pinned)
    await supabase.from("notes").update({ pinned: !pinned }).eq("id", id)
  }

  function addItem() {
    setChecklist([...checklist, { text: "", done: false }])
  }

  function updateItem(index: number, text: string) {
    const items = [...checklist]
    items[index].text = text
    setChecklist(items)
  }

  function toggleItem(index: number) {
    const items = [...checklist]
    items[index].done = !items[index].done
    setChecklist(items)
  }

  function removeItem(index: number) {
    setChecklist(checklist.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/notes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {type === "note" ? "Editar Nota" : type === "checklist" ? "Editar Lista" : "Editar Compromisso"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
          {/* Topbar */}
          <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
            {(["note", "checklist", "agenda"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  type === t
                    ? "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white shadow-sm"
                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {t === "note" ? "📝 Nota" : t === "checklist" ? "✅ Lista" : "📅 Agenda"}
              </button>
            ))}
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleTogglePin}
              className={`p-1.5 rounded-lg transition-all ${
                pinned ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]" : "text-gray-400 hover:bg-gray-100"
              }`}
            >
              <Pin className={`w-4 h-4 ${pinned ? "fill-[var(--theme-primary)]" : ""}`} />
            </button>
          </div>

          {/* Title */}
          <div className="px-6 pt-6">
            <input
              className="w-full text-xl font-bold border-none outline-none bg-transparent placeholder-gray-300"
              placeholder={type === "agenda" ? "Título do compromisso..." : "Título..."}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* === NOTE: White paper === */}
          {type === "note" && (
            <div className="paper-white px-6 pb-6 pt-4">
              <textarea
                className="w-full min-h-[400px] bg-transparent border-none outline-none resize-y text-base text-gray-700 placeholder-gray-300 leading-relaxed"
                placeholder="Escreva sua nota aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          )}

          {/* === CHECKLIST === */}
          {type === "checklist" && (
            <div className="px-6 pb-6 pt-4 space-y-2">
              {checklist.map((item, index) => (
                <div key={index} className="flex items-center gap-3 py-1">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleItem(index)}
                    className="w-5 h-5 rounded border-gray-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] flex-shrink-0"
                  />
                  <input
                    className={`flex-1 bg-transparent border-none outline-none text-base ${
                      item.done ? "line-through text-gray-400" : "text-gray-700"
                    }`}
                    placeholder="Item da lista..."
                    value={item.text}
                    onChange={(e) => updateItem(index, e.target.value)}
                  />
                  <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 text-sm text-[var(--theme-primary)] hover:text-[var(--theme-secondary)] transition-colors mt-2"
              >
                + Adicionar item
              </button>
            </div>
          )}

          {/* === AGENDA: Notebook lines + planner === */}
          {type === "agenda" && (
            <div className="notebook-page px-10 pb-8 pt-4">
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pt-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Data</label>
                  <input
                    type="date"
                    value={agendaDate}
                    onChange={(e) => setAgendaDate(e.target.value)}
                    className="w-full bg-white/80 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/10"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agendaAllDay}
                      onChange={(e) => setAgendaAllDay(e.target.checked)}
                      className="rounded border-gray-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]"
                    />
                    Dia inteiro
                  </label>
                </div>
              </div>

              {!agendaAllDay && (
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Início
                    </label>
                    <input
                      type="time"
                      value={agendaTime}
                      onChange={(e) => setAgendaTime(e.target.value)}
                      className="w-full bg-white/80 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Fim
                    </label>
                    <input
                      type="time"
                      value={agendaEndTime}
                      onChange={(e) => setAgendaEndTime(e.target.value)}
                      className="w-full bg-white/80 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/10"
                    />
                  </div>
                </div>
              )}

              <div className="relative z-10 mb-4">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Local
                </label>
                <input
                  type="text"
                  value={agendaLocation}
                  onChange={(e) => setAgendaLocation(e.target.value)}
                  placeholder="Onde será o compromisso..."
                  className="w-full bg-white/80 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/10"
                />
              </div>

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block flex items-center gap-1">
                    <Bell className="w-3 h-3" /> Lembrete
                  </label>
                  <select
                    value={agendaReminder}
                    onChange={(e) => setAgendaReminder(e.target.value)}
                    className="w-full bg-white/80 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/10"
                  >
                    <option value="5">5 min antes</option>
                    <option value="15">15 min antes</option>
                    <option value="30">30 min antes</option>
                    <option value="60">1 hora antes</option>
                    <option value="120">2 horas antes</option>
                    <option value="1440">1 dia antes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
                  <select
                    value={agendaStatus}
                    onChange={(e) => setAgendaStatus(e.target.value as any)}
                    className="w-full bg-white/80 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/10"
                  >
                    <option value="pending">Pendente</option>
                    <option value="done">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="relative z-10">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Observações</label>
                <textarea
                  className="w-full min-h-[120px] bg-transparent border-none outline-none resize-y text-base text-gray-700 placeholder-gray-300"
                  style={{ lineHeight: "2rem" }}
                  placeholder="Anotações sobre o compromisso..."
                  value={agendaNotes}
                  onChange={(e) => setAgendaNotes(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg mt-4">{error}</p>
        )}

        <div className="flex items-center justify-between mt-6">
          <Link href="/dashboard/notes">
            <Button type="button" variant="ghost">Cancelar</Button>
          </Link>
          <Button type="submit" loading={saving}>
            <Save className="w-4 h-4 mr-2" /> Salvar
          </Button>
        </div>
      </form>
    </div>
  )
}
