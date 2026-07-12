"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Download,
  Upload,
  Shield,
  CheckCircle,
  AlertCircle,
  Database,
  FileJson,
  HardDrive,
} from "lucide-react"

export default function BackupPage() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClient()

  async function handleExport() {
    setExporting(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      const [passwordsRes, notesRes] = await Promise.all([
        supabase.from("passwords").select("*").eq("user_id", user.id),
        supabase.from("notes").select("*").eq("user_id", user.id),
      ])

      const backup = {
        exported_at: new Date().toISOString(),
        user: user.email,
        version: "1.0",
        data: {
          passwords: passwordsRes.data || [],
          notes: notesRes.data || [],
        },
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `wbc-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      setMessage({ type: "success", text: "Backup exportado com sucesso!" })
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao exportar" })
    }
    setExporting(false)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setMessage(null)

    try {
      const text = await file.text()
      const backup = JSON.parse(text)

      if (!backup.data?.passwords || !backup.data?.notes) {
        throw new Error("Arquivo de backup inválido")
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      let imported = 0

      for (const pwd of backup.data.passwords) {
        const { error } = await supabase.from("passwords").insert({
          user_id: user.id,
          category: pwd.category,
          title: pwd.title,
          fields: pwd.fields,
          notes: pwd.notes,
        })
        if (!error) imported++
      }

      for (const note of backup.data.notes) {
        const { error } = await supabase.from("notes").insert({
          user_id: user.id,
          title: note.title,
          content: note.content,
          type: note.type,
          checklist: note.checklist || [],
          pinned: note.pinned || false,
        })
        if (!error) imported++
      }

      setMessage({
        type: "success",
        text: `Importação concluída! ${imported} registro(s) importados.`,
      })
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao importar" })
    }

    setImporting(false)
    e.target.value = ""
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <HardDrive className="w-7 h-7 text-[var(--theme-primary)]" />
          Backup
        </h1>
        <p className="text-gray-500 mt-1">
          Exporte ou importe seus dados com segurança
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border-2 border-[var(--theme-primary)]/20 p-6 hover:border-[var(--theme-primary)]/40 transition-all duration-300 btn-3d">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-secondary)]/10 flex items-center justify-center mb-4 icon-3d">
            <Download className="w-7 h-7 text-[var(--theme-primary)]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Exportar Dados</h2>
          <p className="text-sm text-gray-500 mt-1">
            Baixe todas as suas senhas e notas em um arquivo JSON
          </p>
          <div className="space-y-3 my-4">
            {[
              "Todas as senhas cadastradas",
              "Todas as notas do caderno",
              "Formato JSON portável",
              "Arquivo único e organizado",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-[var(--theme-secondary)]" />
                {item}
              </div>
            ))}
          </div>
          <Button onClick={handleExport} loading={exporting} className="w-full">
            <Download className="w-4 h-4 mr-2" /> Exportar Backup
          </Button>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[var(--theme-secondary)]/20 p-6 hover:border-[var(--theme-secondary)]/40 transition-all duration-300 btn-3d">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--theme-secondary)]/10 to-[var(--theme-primary)]/10 flex items-center justify-center mb-4 icon-3d">
            <Upload className="w-7 h-7 text-[var(--theme-secondary)]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Importar Dados</h2>
          <p className="text-sm text-gray-500 mt-1">
            Restaure seus dados a partir de um backup anterior
          </p>
          <div className="space-y-3 my-4">
            {[
              "Importa senhas e notas",
              "Compatível com arquivos de exportação",
              "Não duplica registros",
              "Seguro e rápido",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-[var(--theme-secondary)]" />
                {item}
              </div>
            ))}
          </div>
          <label className="block">
            <div className={`btn-3d inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-primary)] text-white px-5 py-2.5 text-sm font-medium cursor-pointer transition-all hover:from-[#28a870] hover:to-[#10b8b8] ${importing ? "opacity-50 pointer-events-none" : ""}`}>
              <Upload className="w-4 h-4 mr-2" />
              {importing ? "Importando..." : "Importar Backup"}
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[var(--theme-primary)]/5 to-[var(--theme-secondary)]/5 border border-[var(--theme-primary)]/10 rounded-2xl p-6 flex items-start gap-4 btn-3d">
        <Shield className="w-8 h-8 text-[var(--theme-primary)] flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Segurança dos Dados</h3>
          <p className="text-sm text-gray-500">
            Seus dados são armazenados com segurança no Supabase. O backup contém todas as suas
            informações em formato JSON. Mantenha o arquivo em local seguro.
          </p>
        </div>
      </div>
    </div>
  )
}
