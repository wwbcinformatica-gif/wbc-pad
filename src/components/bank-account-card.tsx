"use client"

import { Copy, Eye, EyeOff, Building, QrCode } from "lucide-react"

const BANK_COLORS: Record<string, { from: string; to: string; text: string; accent: string }> = {
  nubank: { from: "#8A05BE", to: "#6A05DE", text: "#ffffff", accent: "#C896E6" },
  inter: { from: "#FF7A00", to: "#FF5500", text: "#ffffff", accent: "#FFD700" },
  "will bank": { from: "#FFCD00", to: "#E6B800", text: "#1a1a1a", accent: "#FFF5CC" },
  "willbank": { from: "#FFCD00", to: "#E6B800", text: "#1a1a1a", accent: "#FFF5CC" },
  "c6": { from: "#000000", to: "#1a1a1a", text: "#ffffff", accent: "#FFD700" },
  "c6 bank": { from: "#000000", to: "#1a1a1a", text: "#ffffff", accent: "#FFD700" },
  itaú: { from: "#FF6600", to: "#CC5200", text: "#ffffff", accent: "#FFD700" },
  itau: { from: "#FF6600", to: "#CC5200", text: "#ffffff", accent: "#FFD700" },
  bradesco: { from: "#003399", to: "#002266", text: "#ffffff", accent: "#FF6600" },
  santander: { from: "#EC0000", to: "#B30000", text: "#ffffff", accent: "#FFD700" },
  "banco do brasil": { from: "#003366", to: "#002244", text: "#ffffff", accent: "#FFD700" },
  "bb": { from: "#003366", to: "#002244", text: "#ffffff", accent: "#FFD700" },
  caixa: { from: "#004481", to: "#003366", text: "#ffffff", accent: "#FF8C00" },
  neon: { from: "#00E676", to: "#00C853", text: "#1a1a1a", accent: "#B9F6CA" },
  pagbank: { from: "#00A651", to: "#008C44", text: "#ffffff", accent: "#B9F6CA" },
  picpay: { from: "#21C25E", to: "#FFD700", text: "#1a1a1a", accent: "#FFF5CC" },
  "mercado pago": { from: "#009EE3", to: "#0078B3", text: "#ffffff", accent: "#B3E5FC" },
  original: { from: "#00A857", to: "#008C47", text: "#ffffff", accent: "#B9F6CA" },
  next: { from: "#003366", to: "#002244", text: "#ffffff", accent: "#FFD700" },
  sofisa: { from: "#1A5276", to: "#0E3463", text: "#ffffff", accent: "#85C1E9" },
  modal: { from: "#1C1C1C", to: "#0A0A0A", text: "#ffffff", accent: "#FFD700" },
  "xp investimentos": { from: "#1C1C1C", to: "#0A0A0A", text: "#ffffff", accent: "#B8860B" },
  xp: { from: "#1C1C1C", to: "#0A0A0A", text: "#ffffff", accent: "#B8860B" },
}

function getBankStyle(bankName: string) {
  const key = bankName?.toLowerCase().trim() || ""
  if (BANK_COLORS[key]) return BANK_COLORS[key]
  for (const [name, style] of Object.entries(BANK_COLORS)) {
    if (key.includes(name) || name.includes(key)) return style
  }
  return { from: "#1a1a2e", to: "#16213e", text: "#ffffff", accent: "#e2e8f0" }
}

interface BankAccountCardProps {
  title: string
  fields: Record<string, string>
  visible?: boolean
  onToggleVisibility?: () => void
  onCopy?: (text: string) => void
  variant?: "mini" | "full"
}

export function BankAccountCard({ title, fields, visible, onToggleVisibility, onCopy, variant = "full" }: BankAccountCardProps) {
  const bankName = fields.bank || ""
  const style = getBankStyle(bankName)
  const agency = fields.agency || ""
  const account = fields.account || ""
  const pix = fields.pix || ""

  const password = fields.password || ""

  const miniCard = (
    <div
      className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300 btn-3d hover:-translate-y-2 cursor-pointer"
      style={{
        background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
        boxShadow: `0 8px 24px -6px ${style.from}55, 0 4px 12px -6px ${style.from}33`,
        height: visible && password ? "13rem" : "11rem",
      }}
    >
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white" />
      </div>

      <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-3">
        <Building className="w-5 h-5" style={{ color: style.text }} />
      </div>

      <p className="font-bold text-lg drop-shadow-sm" style={{ color: style.text }}>
        {bankName || "Banco"}
      </p>

      <div className="absolute bottom-5 left-5 right-5 space-y-1">
        {agency && account && (
          <p className="text-sm font-mono drop-shadow-sm" style={{ color: `${style.text}cc` }}>
            {agency} / {account}
          </p>
        )}
        {pix && (
          <p className="text-xs truncate drop-shadow-sm" style={{ color: `${style.text}99` }}>
            PIX: {pix}
          </p>
        )}
        {password && (
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: visible ? "2rem" : "0", opacity: visible ? 1 : 0 }}
          >
            <p className="text-[8px] uppercase tracking-widest mb-0.5" style={{ color: `${style.text}80` }}>Senha</p>
            <p className="text-sm font-mono drop-shadow-sm" style={{ color: `${style.text}cc` }}>
              {password}
            </p>
          </div>
        )}
      </div>

      {/* Eye + Copy buttons */}
      <div className="absolute bottom-5 right-5 z-10 flex items-center gap-1.5">
        {password && onToggleVisibility && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleVisibility() }}
            className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            title={visible ? "Ocultar senha" : "Mostrar senha"}
          >
            {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
        {password && onCopy && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(password) }}
            className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            title="Copiar senha"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )

  const fullCard = (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
        color: style.text,
        boxShadow: `0 16px 40px -8px ${style.from}66, 0 8px 16px -6px ${style.from}33`,
      }}
    >
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-lg font-bold drop-shadow-sm">{bankName || "Banco"}</p>
            <p className="text-xs opacity-60">{title}</p>
          </div>
        </div>
      </div>

      {/* Account info grid */}
      <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1">Agência</p>
          <p className="text-base font-bold font-mono drop-shadow-sm">{agency || "---"}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1">Conta</p>
          <p className="text-base font-bold font-mono drop-shadow-sm">{account || "---"}</p>
        </div>
      </div>

      {/* PIX */}
      {pix && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-5 relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1 flex items-center gap-1">
              <QrCode className="w-3 h-3" /> Chave PIX
            </p>
            <p className="text-sm font-semibold drop-shadow-sm">{pix}</p>
          </div>
          {onCopy && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(pix) }}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Password row */}
      <div className="flex items-center justify-between relative z-10 pt-3 border-t border-white/10">
        <span className="text-sm opacity-80">Senha da conta</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{visible ? (fields.password || "---") : "••••••••"}</span>
          {onToggleVisibility && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleVisibility() }}
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            >
              {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}
          {onCopy && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(fields.password || "") }}
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (variant === "mini") return miniCard
  return fullCard
}
