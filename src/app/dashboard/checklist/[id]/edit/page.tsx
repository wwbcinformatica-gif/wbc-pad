"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Plus, Trash2, Pin, PinOff, Upload } from "lucide-react"
import { EMOJI_CATEGORIES } from "@/data/custom-shopping-items"

function ProductInput({ value, icon, onChangeName, onChangeIcon, placeholder }: {
  value: string; icon: string; onChangeName: (v: string) => void; onChangeIcon: (v: string) => void; placeholder?: string
}) {
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [activeTab, setActiveTab] = useState("categorias")
  const wrapperRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowIconPicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      if (result) {
        onChangeIcon(result)
        setShowIconPicker(false)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  return (
    <div ref={wrapperRef} className="relative flex-1 flex items-center gap-1">
      {/* Icon button */}
      <button
        type="button"
        onClick={() => setShowIconPicker(!showIconPicker)}
        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/5 transition-all flex-shrink-0 text-sm"
        title="Clique para escolher ícone"
      >
        {icon || "🏷️"}
      </button>

      {/* Icon picker dropdown */}
      {showIconPicker && (
        <div className="absolute z-50 left-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 w-72 max-w-[90vw] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => setActiveTab("categorias")}
              className={`flex-1 py-2 text-[10px] font-medium transition-colors ${
                activeTab === "categorias" ? "text-[var(--theme-primary)] border-b-2 border-[var(--theme-primary)] bg-[var(--theme-primary)]/5" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Categorias
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-2 text-[10px] font-medium transition-colors ${
                activeTab === "upload" ? "text-[var(--theme-primary)] border-b-2 border-[var(--theme-primary)] bg-[var(--theme-primary)]/5" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Upload
            </button>
          </div>

          <div className="p-2 max-h-56 overflow-y-auto">
            {/* Categorias de emojis */}
            {activeTab === "categorias" && (
              <div className="space-y-2">
                {EMOJI_CATEGORIES.map(cat => (
                  <div key={cat.label}>
                    <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">{cat.label}</p>
                    <div className="flex flex-wrap gap-0.5">
                      {cat.emojis.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => { onChangeIcon(emoji); setShowIconPicker(false) }}
                          className={`w-7 h-7 rounded-md flex items-center justify-center text-sm transition-all ${
                            icon === emoji ? "bg-[var(--theme-primary)]/10 ring-1 ring-[var(--theme-primary)]" : "hover:bg-gray-100"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload de ícone personalizado */}
            {activeTab === "upload" && (
              <div className="text-center py-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/5 transition-all"
                >
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-600">Carregar ícone</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG ou SVG</p>
                </button>
                {icon && icon.startsWith("data:") && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <img src={icon} alt="Ícone atual" className="w-6 h-6 rounded-md object-cover" />
                    <button
                      type="button"
                      onClick={() => onChangeIcon("")}
                      className="text-[10px] text-red-500 hover:text-red-600"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Text input */}
      <input
        className="w-full bg-transparent border-none outline-none text-base text-gray-700"
        placeholder={placeholder || "Item da lista..."}
        value={value}
        onChange={(e) => onChangeName(e.target.value)}
      />
    </div>
  )
}

export default function EditChecklistPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [title, setTitle] = useState("")
  const [checklist, setChecklist] = useState<{ text: string; icon: string; done: boolean }[]>([])
  const [pinned, setPinned] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const supabase = createClient()

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
      if (data.checklist) setChecklist(data.checklist)
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError("")

    const { error: err } = await supabase.from("notes").update({
      title: title.trim(),
      content: "",
      type: "checklist",
      pinned,
      checklist: checklist,
      updated_at: new Date().toISOString(),
    }).eq("id", id)

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push("/dashboard/checklist")
    router.refresh()
  }

  async function handleTogglePin() {
    setPinned(!pinned)
    await supabase.from("notes").update({ pinned: !pinned }).eq("id", id)
  }

  function addItem() {
    setChecklist([...checklist, { text: "", icon: "", done: false }])
  }

  function updateItemText(index: number, text: string) {
    const items = [...checklist]
    items[index].text = text
    setChecklist(items)
  }

  function updateItemIcon(index: number, icon: string) {
    const items = [...checklist]
    items[index].icon = icon
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
        <Link href="/dashboard/checklist">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Editar Lista de Compras</h1>
        <button onClick={handleTogglePin} className="ml-auto p-1.5 hover:bg-gray-100 rounded-lg">
          {pinned ? <Pin className="w-4 h-4 text-[var(--theme-primary)]" /> : <PinOff className="w-4 h-4 text-gray-400" />}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
          {/* Title */}
          <div className="px-6 pt-6">
            <input
              className="w-full text-xl font-bold border-none outline-none bg-transparent placeholder-gray-300"
              placeholder="Título da lista..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* === CHECKLIST ITEMS === */}
          <div className="px-6 pb-6 pt-4 space-y-2">
            {checklist.map((item, index) => (
              <div key={index} className="group flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleItem(index)}
                  className="w-5 h-5 rounded border-gray-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] flex-shrink-0"
                />
                <ProductInput
                  value={item.text}
                  icon={item.icon}
                  onChangeName={(v) => updateItemText(index, v)}
                  onChangeIcon={(v) => updateItemIcon(index, v)}
                  placeholder="Item da lista..."
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                  title="Remover item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 text-sm text-[var(--theme-primary)] hover:text-[var(--theme-secondary)] transition-colors mt-2"
            >
              <Plus className="w-4 h-4" /> Adicionar item
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Footer with save button */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-2 justify-end">
            <Link href="/dashboard/checklist">
              <Button variant="ghost">Cancelar</Button>
            </Link>
            <Button
              type="submit"
              disabled={saving || !title.trim()}
              className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)]"
            >
              {saving ? "Salvando..." : "Salvar Lista"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
