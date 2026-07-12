"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { loadCustomItems, saveCustomItems, EMOJI_CATEGORIES } from "@/data/custom-shopping-items"
import type { ShoppingItem } from "@/data/shopping-items"

interface CustomItemsModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function CustomItemsModal({ open, onClose, onSaved }: CustomItemsModalProps) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newName, setNewName] = useState("")
  const [newIcon, setNewIcon] = useState("")
  const [newCategory, setNewCategory] = useState("Outros")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadCustomItems().then(data => {
        setItems(data)
        setLoading(false)
      })
    }
  }, [open])

  function addItem() {
    if (!newName.trim() || !newIcon) return
    setItems([...items, { name: newName.trim(), icon: newIcon, category: newCategory }])
    setNewName("")
    setNewIcon("")
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    const ok = await saveCustomItems(items)
    setSaving(false)
    if (ok) {
      onSaved()
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Meus Itens Personalizados</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add new item */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase">Adicionar novo item</p>

            {/* Emoji picker */}
            <div className="space-y-2">
              {EMOJI_CATEGORIES.map(cat => (
                <div key={cat.label}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{cat.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {cat.emojis.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewIcon(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                          newIcon === emoji
                            ? "bg-[var(--theme-primary)]/10 ring-2 ring-[var(--theme-primary)]"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nome do item..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                onKeyDown={e => e.key === "Enter" && addItem()}
              />
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
              >
                {EMOJI_CATEGORIES.map(cat => (
                  <option key={cat.label} value={cat.label}>{cat.label}</option>
                ))}
              </select>
              <Button onClick={addItem} disabled={!newName.trim() || !newIcon} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Existing custom items */}
          {items.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase">Seus itens ({items.length})</p>
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-2 px-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50">
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1 text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-[10px] text-gray-400">{item.category}</span>
                  <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {items.length === 0 && !loading && (
            <p className="text-center text-sm text-gray-400 py-4">
              Nenhum item personalizado ainda. Crie seus próprios itens!
            </p>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  )
}
