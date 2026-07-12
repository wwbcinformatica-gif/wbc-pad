"use client"

import { useState } from "react"
import { Eye, EyeOff, Copy, Check } from "lucide-react"

const BANK_COLORS: Record<string, { from: string; to: string; text: string; chip: string }> = {
  nubank: { from: "#8A05BE", to: "#6A05DE", text: "#ffffff", chip: "#C896E6" },
  inter: { from: "#FF7A00", to: "#FF5500", text: "#ffffff", chip: "#FFD700" },
  "will bank": { from: "#FFCD00", to: "#E6B800", text: "#1a1a1a", chip: "#FFF5CC" },
  "willbank": { from: "#FFCD00", to: "#E6B800", text: "#1a1a1a", chip: "#FFF5CC" },
  "c6": { from: "#000000", to: "#1a1a1a", text: "#ffffff", chip: "#FFD700" },
  "c6 bank": { from: "#000000", to: "#1a1a1a", text: "#ffffff", chip: "#FFD700" },
  itaú: { from: "#FF6600", to: "#CC5200", text: "#ffffff", chip: "#FFD700" },
  itau: { from: "#FF6600", to: "#CC5200", text: "#ffffff", chip: "#FFD700" },
  bradesco: { from: "#003399", to: "#002266", text: "#ffffff", chip: "#FF6600" },
  santander: { from: "#EC0000", to: "#B30000", text: "#ffffff", chip: "#FFD700" },
  "banco do brasil": { from: "#003366", to: "#002244", text: "#ffffff", chip: "#FFD700" },
  "bb": { from: "#003366", to: "#002244", text: "#ffffff", chip: "#FFD700" },
  caixa: { from: "#004481", to: "#003366", text: "#ffffff", chip: "#FF8C00" },
  neon: { from: "#00E676", to: "#00C853", text: "#1a1a1a", chip: "#B9F6CA" },
  pagbank: { from: "#00A651", to: "#008C44", text: "#ffffff", chip: "#B9F6CA" },
  picpay: { from: "#21C25E", to: "#FFD700", text: "#1a1a1a", chip: "#FFF5CC" },
  "mercado pago": { from: "#009EE3", to: "#0078B3", text: "#ffffff", chip: "#B3E5FC" },
  "mercado pago ": { from: "#009EE3", to: "#0078B3", text: "#ffffff", chip: "#B3E5FC" },
  original: { from: "#00A857", to: "#008C47", text: "#ffffff", chip: "#B9F6CA" },
  next: { from: "#003366", to: "#002244", text: "#ffffff", chip: "#FFD700" },
  sofisa: { from: "#1A5276", to: "#0E3463", text: "#ffffff", chip: "#85C1E9" },
  modal: { from: "#1C1C1C", to: "#0A0A0A", text: "#ffffff", chip: "#FFD700" },
  "xp investimentos": { from: "#1C1C1C", to: "#0A0A0A", text: "#ffffff", chip: "#B8860B" },
  xp: { from: "#1C1C1C", to: "#0A0A0A", text: "#ffffff", chip: "#B8860B" },
}

function getBankStyle(bankName: string) {
  const key = bankName?.toLowerCase().trim() || ""
  // Check exact match first
  if (BANK_COLORS[key]) return BANK_COLORS[key]
  // Check partial match
  for (const [name, style] of Object.entries(BANK_COLORS)) {
    if (key.includes(name) || name.includes(key)) return style
  }
  // Default
  return { from: "#1a1a2e", to: "#16213e", text: "#ffffff", chip: "#e2e8f0" }
}

function formatCardNumber(num: string) {
  const digits = num.replace(/\D/g, "")
  if (digits.length <= 4) return digits
  const groups = digits.match(/.{1,4}/g)
  return groups?.join(" ") || digits
}

function maskCardNumber(num: string) {
  const digits = num.replace(/\D/g, "")
  if (digits.length <= 4) return digits
  const first4 = digits.slice(0, 4)
  return `${first4} •••• •••• ••••`
}

interface CreditCard3DProps {
  title: string
  fields: Record<string, string>
  visible?: boolean
  onToggleVisibility?: () => void
  onCopy?: (text: string) => void
  variant?: "front" | "back" | "both"
}

export function CreditCard3D({ title, fields, visible, onToggleVisibility, onCopy, variant = "both" }: CreditCard3DProps) {
  const bankName = fields.bank || ""
  const style = getBankStyle(bankName)
  const cardNumber = fields.card_number || ""
  const cardName = fields.card_name || title
  const expiry = fields.expiry || ""
  const cvv = fields.cvv || ""
  const flag = fields.flag || ""
  const formattedNumber = formatCardNumber(cardNumber)
  const maskedNumber = maskCardNumber(cardNumber)
  const displayNumber = visible ? formattedNumber : maskedNumber

  const cardFront = (
    <div
      className="rounded-2xl p-5 md:p-6 aspect-[85.6/54] w-full relative overflow-hidden select-none flex flex-col justify-between"
      style={{
        background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
        color: style.text,
        boxShadow: `0 16px 40px -8px ${style.from}66, 0 8px 16px -6px ${style.from}33`,
      }}
    >
      {/* Card pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white" />
        <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white" />
      </div>

      {/* Top section: Chip + Flag */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div
            className="w-11 h-8 rounded-md flex items-center justify-center"
            style={{ backgroundColor: style.chip, boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)" }}
          >
            <div className="w-7 h-5 rounded-sm border border-white/20" />
          </div>
          {flag && (
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
              {flag}
            </span>
          )}
        </div>
      </div>

      {/* Middle section: Card Number */}
      <div className="relative z-10 my-2">
        <p className="text-lg md:text-xl font-mono tracking-[0.15em] drop-shadow-sm break-words">
          {displayNumber}
        </p>
      </div>

      {/* Bottom section: Name + Validity */}
      <div className="relative z-10 flex items-end justify-between mb-1">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">Titular</p>
          <p className="text-sm font-semibold truncate drop-shadow-sm">{cardName || "Seu Nome"}</p>
        </div>
        <div className="text-right ml-4">
          <p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">Validade</p>
          <p className="text-sm font-semibold drop-shadow-sm">{expiry || "MM/AA"}</p>
        </div>
      </div>

      {/* Actions - bottom center */}
      <div className="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-2">
        {onToggleVisibility && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleVisibility() }}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            title={visible ? "Ocultar dados" : "Mostrar dados"}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        {onCopy && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(cardNumber) }}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            title="Copiar número"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )

  const cardBack = (
    <div
      className="rounded-2xl aspect-[85.6/54] w-full relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
        color: style.text,
        boxShadow: `0 16px 40px -8px ${style.from}66, 0 8px 16px -6px ${style.from}33`,
      }}
    >
      {/* Magnetic stripe */}
      <div className="absolute top-5 left-0 right-0 h-11 bg-black/50" />

      {/* Signature + CVV area */}
      <div className="absolute top-[4.2rem] left-4 right-4 flex items-center gap-2">
        {/* Signature lines (traços) */}
        <div className="flex-1 bg-white/90 rounded-sm h-9 flex items-center px-3">
          <div className="w-full flex flex-col gap-1.5 px-1">
            <div className="w-full h-[1px] bg-gray-300" />
            <div className="w-full h-[1px] bg-gray-300" />
          </div>
        </div>
        {/* CVV */}
        <div className="bg-white/90 rounded-sm px-2.5 py-1.5 text-center min-w-[52px]">
          <p className="text-[8px] text-gray-500 font-bold">CVV</p>
          <p className="text-sm font-bold font-mono tracking-wider text-gray-700">
            {visible ? cvv : "•••"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
        <span className="text-[8px] opacity-40">WBC NotePad • Cartão Virtual</span>
        {onCopy && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(cvv) }}
            className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            title="Copiar CVV"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )

  if (variant === "front") return cardFront
  if (variant === "back") return cardBack

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
      <div className="flex-1 min-w-0">{cardFront}</div>
      <div className="flex-1 min-w-0">{cardBack}</div>
    </div>
  )
}
