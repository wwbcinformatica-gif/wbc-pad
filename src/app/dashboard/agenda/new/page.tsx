"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import Calendar from "@/components/calendar"
import { ArrowLeft, Clock, Bell, MapPin } from "lucide-react"

export default function NewAgendaPage() {
  const [title, setTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !agendaDate) return
    setSaving(true)
    setError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("Usuário não autenticado")
      setSaving(false)
      return
    }

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

    const { error: err } = await supabase.from("notes").insert({
      user_id: user.id,
      title: title.trim(),
      content: content,
      type: "agenda",
      checklist: [],
    })

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push("/dashboard/agenda")
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/agenda">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Novo Compromisso</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
          {/* Title */}
          <div className="px-6 pt-6">
            <input
              className="w-full text-xl font-bold border-none outline-none bg-transparent placeholder-gray-300"
              placeholder="Título do compromisso..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* === AGENDA FIELDS === */}
          <div className="bg-gradient-to-br from-amber-50/30 to-white p-6">
            {/* Top gradient indicator */}
            <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mb-6" />

            <div className="grid md:grid-cols-2 gap-5">
              {/* Data */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Data</label>
                <Calendar selected={agendaDate || undefined} onSelect={(d) => setAgendaDate(d)} />
                {agendaDate && <div className="mt-2 text-sm text-gray-600">Selecionado: {agendaDate}</div>}
              </div>

              {/* All day */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dia inteiro</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agendaAllDay}
                    onChange={(e) => setAgendaAllDay(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[var(--theme-primary)] peer-checked:to-[var(--theme-secondary)] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>

              {/* Hora início */}
              {!agendaAllDay && (
                <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Início
                  </label>
                  <input
                    type="time"
                    value={agendaTime}
                    onChange={(e) => setAgendaTime(e.target.value)}
                    className="w-full border-none outline-none text-base font-semibold text-gray-900 bg-transparent p-0"
                  />
                </div>
              )}

              {/* Hora fim */}
              {!agendaAllDay && (
                <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Fim
                  </label>
                  <input
                    type="time"
                    value={agendaEndTime}
                    onChange={(e) => setAgendaEndTime(e.target.value)}
                    className="w-full border-none outline-none text-base font-semibold text-gray-900 bg-transparent p-0"
                  />
                </div>
              )}

              {/* Local */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Local
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
              <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-1">
                  <Bell className="w-3 h-3" /> Lembrete
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
              <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Status</label>
                <div className="flex gap-2">
                  {["pending", "done", "cancelled"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAgendaStatus(s as any)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all border ${
                        agendaStatus === s
                          ? s === "pending"
                            ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                            : s === "done"
                            ? "bg-green-50 border-green-300 text-green-700"
                            : "bg-red-50 border-red-300 text-red-700"
                          : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {s === "pending" ? "⏳ Pendente" : s === "done" ? "✅ Concluído" : "❌ Cancelado"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Notas (opcional)</label>
                <textarea
                  value={agendaNotes}
                  onChange={(e) => setAgendaNotes(e.target.value)}
                  placeholder="Adicione notas adicionais..."
                  className="w-full min-h-[100px] border-none outline-none text-sm text-gray-700 bg-transparent p-0 resize-y placeholder-gray-300"
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
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-2 justify-end">
            <Link href="/dashboard/agenda">
              <Button variant="ghost">Cancelar</Button>
            </Link>
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
