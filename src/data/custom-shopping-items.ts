import { createClient } from "@/lib/supabase"
import { SHOPPING_ITEMS, type ShoppingItem } from "./shopping-items"

const CUSTOM_ITEMS_KEY = "custom_shopping_items"

export async function loadCustomItems(): Promise<ShoppingItem[]> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from("notes")
      .select("content")
      .eq("user_id", user.id)
      .eq("type", "note")
      .eq("title", "🛒 Itens Personalizados")
      .single()

    if (data?.content) {
      return JSON.parse(data.content)
    }
  } catch {}
  return []
}

export async function saveCustomItems(items: ShoppingItem[]): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: existing } = await supabase
      .from("notes")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "note")
      .eq("title", "🛒 Itens Personalizados")
      .single()

    const payload = {
      user_id: user.id,
      title: "🛒 Itens Personalizados",
      type: "note",
      content: JSON.stringify(items),
      pinned: false,
      color: "#ffffff",
      checklist: [],
    }

    if (existing) {
      const { error } = await supabase
        .from("notes")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
      return !error
    }

    const { error } = await supabase.from("notes").insert(payload)
    return !error
  } catch {
    return false
  }
}

export async function getAllShoppingItems(): Promise<ShoppingItem[]> {
  const customItems = await loadCustomItems()
  return [...customItems, ...SHOPPING_ITEMS]
}

export async function filterAllShoppingItems(query: string): Promise<ShoppingItem[]> {
  const allItems = await getAllShoppingItems()
  if (!query.trim()) return []
  const lower = query.toLowerCase().trim()
  return allItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lower) ||
      item.category.toLowerCase().includes(lower)
  ).slice(0, 10)
}

const EMOJI_CATEGORIES = [
  { label: "Alimentos", emojis: ["🍚", "🫘", "🍝", "🍞", "🧀", "🥚", "🥛", "🧈", "🍯", "🥜", "🍿", "🍫", "🍪", "🍬", "🍭", "🧁", "🍰", "🎂", "🍮", "🥣", "🫕", "🥪", "🌮", "🌯", "🥙"] },
  { label: "Frutas", emojis: ["🍌", "🍎", "🍊", "🍋", "🍍", "🍈", "🍉", "🍇", "🍓", "🥝", "🥭", "🥥", "🍑", "🍐", "🫐", "🍒", "🫒", "🌰", "🥜"] },
  { label: "Legumes", emojis: ["🍅", "🥕", "🥔", "🧅", "🧄", "🥒", "🥬", "🥦", "🍆", "🫑", "🌽", "🎃", "🌿", "☘️", "🌱", "🫘"] },
  { label: "Carnes", emojis: ["🍗", "🥩", "🥓", "🌭", "🐟", "🦐", "🦑", "🦞", "🦀", "🍖", "🦴"] },
  { label: "Laticínios", emojis: ["🥛", "🧀", "🧈", "🍶", "🥣", "🍦", "🍨", "🍧"] },
  { label: "Bebidas", emojis: ["💧", "🧃", "☕", "🍵", "🍺", "🍷", "🥤", "🧋", "🍾", "🫖", "☕️"] },
  { label: "Temperos", emojis: ["🧂", "🌶️", "🫒", "🍶", "🧄", "🧅", "🌿", "🍃", "🫙"] },
  { label: "Limpeza", emojis: ["🧴", "🧼", "🪥", "🧽", "🧹", "🧻", "🗑️", "🫧", "🪣", "🧼"] },
  { label: "Higiene", emojis: ["🧴", "🪥", "🧼", "☁️", "🩹", "🩺", "💊", "💉", "🧷", "🪒"] },
  { label: "Ferramentas", emojis: ["🔧", "🔨", "🪛", "🪚", "⛏️", "🪓", "🪜", "🧰", "🪤", "🔗", "🔩", "⚙️", "🪛"] },
  { label: "Material Escolar", emojis: ["📚", "✏️", "🖊️", "📐", "📏", "🗂️", "📎", "✂️", "🖍️", "📝", "📒", "🎒", "🎓", "📖", "🧮"] },
  { label: "Escritório", emojis: ["💼", "📂", "📁", "📋", "📌", "📍", "🔍", "📎", "🖇️", "🖨️", "📠", "💻", "🖥️", "⌨️", "🖱️"] },
  { label: "Pet", emojis: ["🐾", "🦴", "🐕", "🐈", "🐦", "🐠", "🐹", "🐰", "🦜", "🐢"] },
  { label: "Vestuário", emojis: ["👕", "👖", "👗", "👙", "👘", "👔", "🧣", "🧤", "🧥", "🧦", "👟", "🥿", "👠", "👡", "👢"] },
  { label: "Casa", emojis: ["🏠", "🛋️", "🪑", "🛏️", "🪞", "🪟", "🚪", "🧯", "🪤", "💡", "🔌", "🔋", "🕯️", "🪔"] },
  { label: "Eletrônicos", emojis: ["📱", "💻", "🖥️", "🎧", "⌚", "📷", "🎬", "📺", "📻", "🔋", "🔌", "💾", "💿"] },
  { label: "Esportes", emojis: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🎱", "🏓", "🏸", "🥊", "🥋", "🏋️", "🚴", "🏊"] },
  { label: "Transporte", emojis: ["🚗", "🚌", "🚎", "🚓", "🚑", "🚒", "🚚", "🚛", "✈️", "🚂", "🛳️", "🏍️", "🚲"] },
  { label: "Símbolos", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💕", "⭐", "🌟", "✨", "🔥", "💧", "❄️", "☀️", "🌙", "💫"] },
  { label: "Informática", emojis: ["💻", "🖥️", "⌨️", "🖱️", "💾", "💿", "🖨️", "📠", "🔌", "🔋", "🖥️", "🪛", "🔧", "🪚", "🧰", "⚙️", "🛠️", "📡", "🖲️", "💽", "📀", "🕹️"] },
  { label: "Acessórios", emojis: ["🎧", "⌚", "📱", "📷", "🎮", "🎧", "🔊", "🎤", "🎸", "🎹", "🎛️", "🎚️", "🎙️", "📻", "🔦", "🕶️", "👓", "🥽", "🧢", "🎒", "💼"] },
  { label: "Redes", emojis: ["📡", "📶", "🔗", "🌐", "🖧", "📲", "📳", "📴", "🛜", "📻", "📡", "🔀", "🔁", "🔂", "🔃", "🔄"] },
  { label: "Segurança", emojis: ["🔒", "🔓", "🔐", "🔑", "🗝️", "🛡️", "🔏", "🔎", "🔍", "🔒", "🔐", "🛡️", "🚨", "🆔", "🔏"] },
]

export { EMOJI_CATEGORIES }
