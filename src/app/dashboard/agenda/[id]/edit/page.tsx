"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Link } from "lucide-react"
import NextLink from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Clock, Bell, MapPin, Pin, PinOff } from "lucide-react"

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

export default function EditAgendaPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [title, setTitle] = useState("")
  const [pinned, setPinned] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const supabase = createClient()

  // Agenda fields
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

    if (data && data.content) {
      setTitle(data.title)
      setPinned(data.pinned)
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
      } catch {}
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !agendaDate) return
    setSaving(true)
    setError("")

    const content = JSON.stringify({
      date: agendaDate,
      time: agendaAllDay ? null : agendaTime,
      endTime: agendaAllDay ? null : agendaEndTime,
      allDay: agendaAllDay,
      reminder: agendaReminder,
      location: agendaLocation,
      status: agendaStatus,
      notes: agendaNotes,
    })

    const { error: err } = await supabase.from("notes").update({
      title: title.trim(),
      content: content,
      type: "agenda",
      pinned,
      checklist: [],
      updated_at: new Date().toISOString(),
    }).eq("id", id)

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push("/dashboard/agenda")
    router.refresh()
  }

  async function handleTogglePin() {
    setPinned(!pinned)
    await supabase.from("notes").update({ pinned: !pinned }).eq("id", id)
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
      <div className="flex items-center gap-3 mb-4">
        <NextLink href="/dashboard/agenda">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </NextLink>
        <h1 className="text-xl font-bold text-gray-900">Editar Compromisso</h1>
        <button onClick={handleTogglePin} className="ml-auto p-1.5 hover:bg-gray-100 rounded-lg">
          {pinned ? <Pin className="w-4 h-4 text-[var(--theme-primary)]" /> : <PinOff className="w-4 h-4 text-gray-400" />}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
          {/* Title */}
          <div className="px-6 pt-4 pb-2">
            <input
              className="w-full text-xl font-bold border-none outline-none bg-transparent placeholder-gray-300"
              placeholder="Título do compromisso..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* === AGENDA FIELDS === */}
          <div className="px-6 py-3">
            <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mb-3" />

            <div className="grid grid-cols-2 gap-2">
              {/* Data */}
              <div className="bg-gray-50 rounded-lg p-2">
                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 block">Data</label>
                <input
                  type="date"
                  value={agendaDate}
                  onChange={(e) => setAgendaDate(e.target.value)}
                  className="w-full border-none outline-none text-sm font-semibold text-gray-900 bg-transparent p-0"
                  required
                />
              </div>

              {/* Dia inteiro */}
              <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-between">
                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Dia inteiro</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agendaAllDay}
                    onChange={(e) => setAgendaAllDay(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[var(--theme-primary)] peer-checked:to-[var(--theme-secondary)] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>

              {/* Hora início */}
              {!agendaAllDay && (
                <div className="bg-gray-50 rounded-lg p-2">
                  <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 block flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> Início
                  </label>
                  <input
                    type="time"
                    value={agendaTime}
                    onChange={(e) => setAgendaTime(e.target.value)}
                    className="w-full border-none outline-none text-sm font-semibold text-gray-900 bg-transparent p-0"
                  />
                </div>
              )}

              {/* Hora fim */}
              {!agendaAllDay && (
                <div className="bg-gray-50 rounded-lg p-2">
                  <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 block flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> Fim
                  </label>
                  <input
                    type="time"
                    value={agendaEndTime}
                    onChange={(e) => setAgendaEndTime(e.target.value)}
                    className="w-full border-none outline-none text-sm font-semibold text-gray-900 bg-transparent p-0"
                  />
                </div>
              )}

              {/* Local */}
              <div className="bg-gray-50 rounded-lg p-2">
                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 block flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" /> Local
                </label>
                <input
                  type="text"
                  value={agendaLocation}
                  onChange={(e) => setAgendaLocation(e.target.value)}
                  placeholder="Onde será..."
                  className="w-full border-none outline-none text-sm text-gray-700 bg-transparent p-0 placeholder-gray-300"
                />
              </div>

              {/* Lembrete */}
              <div className="bg-gray-50 rounded-lg p-2">
                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 block flex items-center gap-1">
                  <Bell className="w-2.5 h-2.5" /> Lembrete
                </label>
                <select
                  value={agendaReminder}
                  onChange={(e) => setAgendaReminder(e.target.value)}
                  className="w-full border-none outline-none text-sm font-semibold text-gray-900 bg-transparent p-0 cursor-pointer"
                >
                  <option value="5">5 min antes</option>
                  <option value="15">15 min antes</option>
                  <option value="30">30 min antes</option>
                  <option value="60">1 hora antes</option>
                  <option value="120">2 horas antes</option>
                  <option value="1440">1 dia antes</option>
                </select>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 block">Status</label>
                <div className="flex gap-1.5">
                  {["pending", "done", "cancelled"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAgendaStatus(s as any)}
                      className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all border ${
                        agendaStatus === s
                          ? s === "pending"
                            ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                            : s === "done"
                            ? "bg-green-50 border-green-300 text-green-700"
                            : "bg-red-50 border-red-300 text-red-700"
                          : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {s === "pending" ? "Pendente" : s === "done" ? "Concluído" : "Cancelado"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 block">Notas</label>
                <textarea
                  value={agendaNotes}
                  onChange={(e) => setAgendaNotes(e.target.value)}
                  placeholder="Notas..."
                  className="w-full h-[40px] border-none outline-none text-sm text-gray-700 bg-transparent p-0 resize-none placeholder-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Footer with save button */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex gap-2 justify-end">
            <NextLink href="/dashboard/agenda">
              <Button variant="ghost">Cancelar</Button>
            </NextLink>
            <Button
              type="submit"
              disabled={saving || !title.trim() || !agendaDate}
              className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)]"
            >
              {saving ? "Salvando..." : "Salvar Compromisso"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
