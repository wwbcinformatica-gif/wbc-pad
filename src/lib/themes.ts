export interface Theme {
  id: string
  label: string
  colors: {
    primary: string
    secondary: string
    bg: string
    card: string
    sidebar: string
    text: string
    accent: string
  }
  preview: string
}

export const THEMES: Theme[] = [
  {
    id: "teal-spring",
    label: "Teal Spring",
    colors: { primary: "#13D0D0", secondary: "#2FC281", bg: "#f5f7fa", card: "#ffffff", sidebar: "#ffffff", text: "#0d0d0f", accent: "#13D0D0" },
    preview: "from-[#13D0D0] to-[#2FC281]",
  },
  {
    id: "ocean-blue",
    label: "Ocean Blue",
    colors: { primary: "#3B82F6", secondary: "#1D4ED8", bg: "#f0f5ff", card: "#ffffff", sidebar: "#ffffff", text: "#0d0d0f", accent: "#3B82F6" },
    preview: "from-[#3B82F6] to-[#1D4ED8]",
  },
  {
    id: "sunset-orange",
    label: "Sunset Orange",
    colors: { primary: "#F97316", secondary: "#EA580C", bg: "#fff7ed", card: "#ffffff", sidebar: "#ffffff", text: "#0d0d0f", accent: "#F97316" },
    preview: "from-[#F97316] to-[#EA580C]",
  },
  {
    id: "royal-purple",
    label: "Royal Purple",
    colors: { primary: "#8B5CF6", secondary: "#6D28D9", bg: "#f5f3ff", card: "#ffffff", sidebar: "#ffffff", text: "#0d0d0f", accent: "#8B5CF6" },
    preview: "from-[#8B5CF6] to-[#6D28D9]",
  },
  {
    id: "matrix-green",
    label: "Matrix Green",
    colors: { primary: "#10B981", secondary: "#059669", bg: "#ecfdf5", card: "#ffffff", sidebar: "#ffffff", text: "#0d0d0f", accent: "#10B981" },
    preview: "from-[#10B981] to-[#059669]",
  },
  {
    id: "ruby-red",
    label: "Ruby Red",
    colors: { primary: "#EF4444", secondary: "#DC2626", bg: "#fef2f2", card: "#ffffff", sidebar: "#ffffff", text: "#0d0d0f", accent: "#EF4444" },
    preview: "from-[#EF4444] to-[#DC2626]",
  },
  {
    id: "midnight-dark",
    label: "Midnight Dark",
    colors: { primary: "#6366F1", secondary: "#4F46E5", bg: "#0f0f1a", card: "#1a1a2e", sidebar: "#1a1a2e", text: "#f1f1f6", accent: "#818CF8" },
    preview: "from-[#6366F1] to-[#4F46E5]",
  },
  {
    id: "rose-gold",
    label: "Rose Gold",
    colors: { primary: "#F43F5E", secondary: "#E11D48", bg: "#fff1f2", card: "#ffffff", sidebar: "#ffffff", text: "#0d0d0f", accent: "#FB7185" },
    preview: "from-[#F43F5E] to-[#E11D48]",
  },
  {
    id: "lavender-mist",
    label: "Lavender Mist",
    colors: { primary: "#A855F7", secondary: "#7C3AED", bg: "#faf5ff", card: "#ffffff", sidebar: "#ffffff", text: "#0d0d0f", accent: "#C084FC" },
    preview: "from-[#A855F7] to-[#7C3AED]",
  },
  {
    id: "coral-reef",
    label: "Coral Reef",
    colors: { primary: "#FB923C", secondary: "#F97316", bg: "#fffaf5", card: "#ffffff", sidebar: "#ffffff", text: "#0d0d0f", accent: "#FDBA74" },
    preview: "from-[#FB923C] to-[#F97316]",
  },
  {
    id: "forest-pine",
    label: "Forest Pine",
    colors: { primary: "#22C55E", secondary: "#16A34A", bg: "#f0fdf4", card: "#ffffff", sidebar: "#ffffff", text: "#0d0d0f", accent: "#4ADE80" },
    preview: "from-[#22C55E] to-[#16A34A]",
  },
  {
    id: "slate-steel",
    label: "Slate Steel",
    colors: { primary: "#64748B", secondary: "#475569", bg: "#f8fafc", card: "#ffffff", sidebar: "#ffffff", text: "#0d0d0f", accent: "#94A3B8" },
    preview: "from-[#64748B] to-[#475569]",
  },
]

export function applyTheme(themeId: string) {
  const theme = THEMES.find((t) => t.id === themeId)
  if (!theme) return
  const root = document.documentElement
  root.style.setProperty("--theme-primary", theme.colors.primary)
  root.style.setProperty("--theme-secondary", theme.colors.secondary)
  root.style.setProperty("--theme-bg", theme.colors.bg)
  root.style.setProperty("--theme-card", theme.colors.card)
  root.style.setProperty("--theme-sidebar", theme.colors.sidebar)
  root.style.setProperty("--theme-text", theme.colors.text)
  root.style.setProperty("--theme-accent", theme.colors.accent)
  localStorage.setItem("wbc-theme", themeId)
}

export function loadSavedTheme(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("wbc-theme")
}
