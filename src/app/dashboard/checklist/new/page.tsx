"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { filterShoppingItems, type ShoppingItem } from "@/data/shopping-items"

const QUICK_EMOJIS = ["🍚", "🫘", "🍝", "🍞", "🧀", "🥚", "🥛", "🧈", "🍗", "🥩", "🥓", "🐟", "🦐", "🍌", "🍎", "🍊", "🍋", "🍅", "🥕", "🥔", "🧅", "🧄", "🥒", "🥬", "🥦", "☕", "🍵", "🧴", "🧼", "📦", "🛒"]

function ProductInput({ value, icon, onChangeName, onChangeIcon, placeholder }: {
  value: string; icon: string; onChangeName: (v: string) => void; onChangeIcon: (v: string) => void; placeholder?: string
}) {
  const [suggestions, setSuggestions] = useState<ShoppingItem[]>([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [showEmoji, setShowEmoji] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setShowEmoji(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleChange(text: string) {
    onChangeName(text)
    const results = filterShoppingItems(text)
    setSuggestions(results)
    setOpen(results.length > 0)
    setHighlighted(-1)
  }

  function selectItem(item: ShoppingItem) {
    onChangeName(item.name)
    onChangeIcon(item.icon)
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlighted((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlighted((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault()
      selectItem(suggestions[highlighted])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex-1 flex items-center gap-1">
      {/* Icon button */}
      <button
        type="button"
        onClick={() => { setShowEmoji(!showEmoji); setOpen(false) }}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 text-base"
        title="Escolher ícone"
      >
        {icon || "🏷️"}
      </button>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="absolute z-50 left-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-2 w-64 max-w-[90vw]">
          <p className="text-[9px] font-bold text-gray-400 uppercase mb-1.5 px-1">Ícones</p>
          <div className="flex flex-wrap gap-0.5">
            {QUICK_EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onChangeIcon(emoji); setShowEmoji(false) }}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-all ${
                  icon === emoji ? "bg-[var(--theme-primary)]/10 ring-1 ring-[var(--theme-primary)]" : "hover:bg-gray-100"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text input */}
      <input
        className="w-full bg-transparent border-none outline-none text-base text-gray-700"
        placeholder={placeholder || "Item da lista..."}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => { const r = filterShoppingItems(value); if (r.length > 0) { setSuggestions(r); setOpen(true) } }}
        onKeyDown={handleKeyDown}
      />

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-8 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-56 overflow-y-auto">
          {suggestions.map((item, i) => (
            <button
              key={item.name}
              type="button"
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                i === highlighted ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]" : "hover:bg-gray-50 text-gray-700"
              }`}
              onMouseDown={() => selectItem(item)}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
              <span className="ml-auto text-xs text-gray-400">{item.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function NewChecklistPage() {
  const [title, setTitle] = useState("")
  const [checklist, setChecklist] = useState<{ text: string; icon: string; done: boolean }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("Usuário não autenticado")
      setSaving(false)
      return
    }

    const { error: err } = await supabase.from("notes").insert({
      user_id: user.id,
      title: title.trim(),
      content: "",
      type: "checklist",
      checklist: checklist,
    })

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push("/dashboard/checklist")
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/checklist">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nova Lista de Compras</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
          <div className="px-6 pt-6">
            <input
              className="w-full text-xl font-bold border-none outline-none bg-transparent placeholder-gray-300"
              placeholder="Título da lista..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="px-6 pb-6 pt-4 space-y-2">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-center gap-2 py-1">
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

          {error && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

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
