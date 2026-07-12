"use client"

import { Eye, EyeOff, Copy } from "lucide-react"

function formatDateBR(date: string) {
  if (!date) return "--"
  if (date.includes("/")) return date
  if (date.length === 10 && date.includes("-")) {
    const [y, m, d] = date.split("-")
    return `${d}/${m}/${y}`
  }
  return date
}

const DOC_COLORS: Record<string, { from: string; to: string }> = {
  "azul-claro": { from: "#85c1e9", to: "#5dade2" },
  "azul-escuro": { from: "#5dade2", to: "#2e86c1" },
  "verde-claro": { from: "#82e0aa", to: "#58d68d" },
  "verde-escuro": { from: "#58d68d", to: "#27ae60" },
  "roxo-claro": { from: "#c39bd3", to: "#af7ac5" },
  "roxo-escuro": { from: "#af7ac5", to: "#8e44ad" },
  "laranja": { from: "#f0b27a", to: "#eb984e" },
  "rosa": { from: "#f1948a", to: "#ec7063" },
  "cinza": { from: "#aab7b8", to: "#85929e" },
  "marinho": { from: "#5d6d7e", to: "#2c3e50" },
}

function getDocColors(colorKey: string) {
  return DOC_COLORS[colorKey] || DOC_COLORS["azul-escuro"]
}

interface DocumentCardProps {
  title: string
  fields: Record<string, string>
  visible?: boolean
  onToggleVisibility?: () => void
  onCopy?: (text: string) => void
  variant?: "front" | "back" | "both"
}

export function DocumentCard({ title, fields, visible, onToggleVisibility, onCopy, variant = "both" }: DocumentCardProps) {
  const docType = (fields.type || "").toUpperCase()
  const number = fields.number || ""
  const issuer = fields.issuer || ""
  const expiry = fields.expiry || ""
  const cpf = fields.cpf || ""
  const birthDate = fields.birth_date || ""
  const categories = fields.categories || ""
  const observations = fields.observations || ""
  const name = title
  const issueDate = fields.issue_date || ""
  const firstLicense = fields.first_license || ""
  const regNumber = fields.reg_number || ""
  const docColor = fields.doc_color || "azul-escuro"
  const colors = getDocColors(docColor)

  if (docType === "CNH") {
    return <CNHCard name={name} number={number} cpf={cpf} birthDate={birthDate} expiry={expiry} categories={categories} observations={observations} issueDate={issueDate} firstLicense={firstLicense} regNumber={regNumber} colors={colors} visible={visible} onToggleVisibility={onToggleVisibility} onCopy={onCopy} variant={variant} />
  }

  if (docType === "RG") {
    return <RGCard name={name} number={number} cpf={cpf} birthDate={birthDate} issuer={issuer} expiry={expiry} issueDate={issueDate} colors={colors} visible={visible} onToggleVisibility={onToggleVisibility} onCopy={onCopy} variant={variant} />
  }

  // CPF or default
  return <CPFCard name={name} number={number} cpf={cpf} issuer={issuer} expiry={expiry} issueDate={issueDate} colors={colors} visible={visible} onToggleVisibility={onToggleVisibility} onCopy={onCopy} variant={variant} />
}

function CNHCard({ name, number, cpf, birthDate, expiry, categories, observations, issueDate, firstLicense, regNumber, colors, visible, onToggleVisibility, onCopy, variant }: {
  name: string; number: string; cpf: string; birthDate: string; expiry: string; categories: string; observations: string; issueDate: string; firstLicense: string; regNumber: string; colors: { from: string; to: string }
  visible?: boolean; onToggleVisibility?: () => void; onCopy?: (text: string) => void; variant?: string
}) {
  const front = (
    <div
      className="rounded-2xl w-full relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        color: "#ffffff",
        boxShadow: `0 16px 40px -8px ${colors.from}66, 0 8px 16px -6px ${colors.from}33`,
        aspectRatio: "85.6/54",
      }}
    >
      {/* Header stripe */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4" style={{ backgroundColor: colors.to, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/90">Carteira Nacional de Habilitação</span>
      </div>

      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white" />
      </div>

      <div className="relative z-10 flex h-full pt-10 pb-4 px-4">
        {/* Photo area */}
        <div className="w-20 h-24 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center mr-4 flex-shrink-0">
          <span className="text-[8px] text-white/40 text-center leading-tight">Foto</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Nome</p>
              <p className="text-xs font-semibold truncate drop-shadow-sm">{name}</p>
            </div>
            {categories && (
              <div className="text-right flex-shrink-0">
                <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Cat</p>
                <p className="text-[10px] font-mono font-bold drop-shadow-sm">{categories}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1">
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">CPF</p>
              <p className="text-[9px] font-mono drop-shadow-sm break-words">{cpf || number}</p>
            </div>
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Reg</p>
              <p className="text-[9px] font-mono drop-shadow-sm">{regNumber || "--"}</p>
            </div>
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Nascimento</p>
              <p className="text-[9px] font-mono drop-shadow-sm break-words">{formatDateBR(birthDate)}</p>
            </div>
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">1ª Habilitação</p>
              <p className="text-[9px] font-mono drop-shadow-sm">{formatDateBR(firstLicense)}</p>
            </div>
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Validade</p>
              <p className="text-[9px] font-mono drop-shadow-sm break-words">{formatDateBR(expiry)}</p>
            </div>
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Emissão</p>
              <p className="text-[9px] font-mono drop-shadow-sm break-words">{formatDateBR(issueDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
        <span className="text-[7px] opacity-40">WBC NotePad • Carteira Nacional de Habilitação</span>
      </div>

      {/* Actions - bottom right */}
      <div className="absolute bottom-2 right-4 z-10 flex items-end gap-2">
        {onToggleVisibility && (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">{visible ? "ocultar" : "mostrar"}</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleVisibility() }}
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            >
              {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
        {onCopy && (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">cpf</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(cpf || number) }}
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {onCopy && (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">cnh</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(regNumber || number) }}
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const back = (
    <div
      className="rounded-2xl w-full relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        color: "#ffffff",
        boxShadow: `0 16px 40px -8px ${colors.from}66, 0 8px 16px -6px ${colors.from}33`,
        aspectRatio: "85.6/54",
      }}
    >
      {/* Magnetic stripe */}
      <div className="absolute top-4 left-0 right-0 h-8 bg-black/50" />

      {/* Signature area */}
      <div className="absolute top-14 left-4 right-4 flex items-center gap-2">
        <div className="flex-1 bg-white/90 rounded-sm h-8 flex items-center px-3">
          <div className="w-full flex flex-col gap-1.5 px-1">
            <div className="w-full h-[1px] bg-gray-300" />
            <div className="w-full h-[1px] bg-gray-300" />
          </div>
        </div>
      </div>

      {/* Observations */}
      {observations && (
        <div className="absolute top-24 left-4 right-4">
          <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Observações</p>
          <p className="text-[9px] text-white/70 leading-relaxed">{observations}</p>
        </div>
      )}

      {/* Barcode placeholder */}
      <div className="absolute bottom-8 left-4 right-4 flex gap-[1px] items-end h-6">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70"
            style={{ width: Math.random() > 0.5 ? "2px" : "1px", height: `${12 + Math.random() * 12}px` }}
          />
        ))}
      </div>

      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
        <span className="text-[7px] opacity-40">WBC NotePad • Carteira Nacional de Habilitação</span>
      </div>

      {/* Actions - bottom right */}
      <div className="absolute bottom-2 right-4 z-10 flex items-end gap-2">
        {onCopy && (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">cnh</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(number) }}
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  if (variant === "front") return front
  if (variant === "back") return back
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
      <div className="flex-1 min-w-0">{front}</div>
      <div className="flex-1 min-w-0">{back}</div>
    </div>
  )
}

function RGCard({ name, number, cpf, birthDate, issuer, expiry, issueDate, colors, visible, onToggleVisibility, onCopy, variant }: {
  name: string; number: string; cpf: string; birthDate: string; issuer: string; expiry: string; issueDate: string; colors: { from: string; to: string }
  visible?: boolean; onToggleVisibility?: () => void; onCopy?: (text: string) => void; variant?: string
}) {
  const front = (
    <div
      className="rounded-2xl w-full relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        color: "#ffffff",
        boxShadow: `0 16px 40px -8px ${colors.from}66, 0 8px 16px -6px ${colors.from}33`,
        aspectRatio: "85.6/54",
      }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-7 flex items-center justify-center" style={{ backgroundColor: colors.to, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
        <span className="text-[8px] font-bold uppercase tracking-widest text-white/90">Registro Geral</span>
      </div>

      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white" />
      </div>

      <div className="relative z-10 flex h-full pt-9 pb-4 px-4">
        {/* Photo */}
        <div className="w-16 h-20 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center mr-3 flex-shrink-0">
          <span className="text-[7px] text-white/40 text-center leading-tight">Foto</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div>
            <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Nome</p>
            <p className="text-xs font-semibold truncate drop-shadow-sm">{name}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1">
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">RG</p>
              <p className="text-[9px] font-mono drop-shadow-sm break-words">{number || "--"}</p>
            </div>
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">CPF</p>
              <p className="text-[9px] font-mono drop-shadow-sm break-words">{cpf || "--"}</p>
            </div>
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Nascimento</p>
              <p className="text-[9px] font-mono drop-shadow-sm">{formatDateBR(birthDate)}</p>
            </div>
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Órgão Emissor</p>
              <p className="text-[9px] font-mono drop-shadow-sm">{issuer || "--"}</p>
            </div>
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Emissão</p>
              <p className="text-[9px] font-mono drop-shadow-sm">{formatDateBR(issueDate)}</p>
            </div>
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Validade</p>
              <p className="text-[9px] font-mono drop-shadow-sm">{formatDateBR(expiry)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
        <span className="text-[7px] opacity-40">WBC NotePad • Registro Geral</span>
      </div>

      {/* Actions - bottom right */}
      <div className="absolute bottom-2 right-4 z-10 flex items-end gap-2">
        {onToggleVisibility && (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">{visible ? "ocultar" : "mostrar"}</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleVisibility() }}
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            >
              {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
        {onCopy && (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">rg</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(number) }}
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {onCopy && (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">cpf</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(cpf) }}
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const back = (
    <div
      className="rounded-2xl w-full relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        color: "#ffffff",
        boxShadow: `0 16px 40px -8px ${colors.from}66, 0 8px 16px -6px ${colors.from}33`,
        aspectRatio: "85.6/54",
      }}
    >
      <div className="absolute top-4 left-0 right-0 h-8 bg-black/50" />

      <div className="absolute top-14 left-4 right-4 flex items-center gap-2">
        <div className="flex-1 bg-white/90 rounded-sm h-8 flex items-center px-3">
          <div className="w-full flex flex-col gap-1.5 px-1">
            <div className="w-full h-[1px] bg-gray-300" />
            <div className="w-full h-[1px] bg-gray-300" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-4 right-4 flex gap-[1px] items-end h-6">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70"
            style={{ width: Math.random() > 0.5 ? "2px" : "1px", height: `${12 + Math.random() * 12}px` }}
          />
        ))}
      </div>

      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
        <span className="text-[7px] opacity-40">WBC NotePad • Registro Geral</span>
      </div>

      {/* Actions - bottom right */}
      <div className="absolute bottom-2 right-4 z-10 flex items-end gap-2">
        {onCopy && (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">cpf</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(cpf) }}
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  if (variant === "front") return front
  if (variant === "back") return back
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
      <div className="flex-1 min-w-0">{front}</div>
      <div className="flex-1 min-w-0">{back}</div>
    </div>
  )
}

function CPFCard({ name, number, cpf, issuer, expiry, issueDate, colors, visible, onToggleVisibility, onCopy, variant }: {
  name: string; number: string; cpf: string; issuer: string; expiry: string; issueDate: string; colors: { from: string; to: string }
  visible?: boolean; onToggleVisibility?: () => void; onCopy?: (text: string) => void; variant?: string
}) {
  const card = (
    <div
      className="rounded-2xl w-full relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        color: "#ffffff",
        boxShadow: `0 16px 40px -8px ${colors.from}66, 0 8px 16px -6px ${colors.from}33`,
        aspectRatio: "85.6/54",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-7 flex items-center justify-center" style={{ backgroundColor: colors.to, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
        <span className="text-[8px] font-bold uppercase tracking-widest text-white/90">Cadastro de Pessoa Física</span>
      </div>

      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white" />
      </div>

      <div className="relative z-10 h-full pt-9 pb-4 px-4 flex flex-col justify-between">
        <div>
          <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Nome</p>
          <p className="text-xs font-semibold truncate drop-shadow-sm">{name}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1">
          <div>
            <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">CPF</p>
            <p className="text-[11px] font-mono font-bold tracking-wider drop-shadow-sm break-words">{cpf || number || "--"}</p>
          </div>
          {issuer && (
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Órgão Emissor</p>
              <p className="text-[9px] font-mono drop-shadow-sm">{issuer}</p>
            </div>
          )}
          {issueDate && (
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Emissão</p>
              <p className="text-[9px] font-mono drop-shadow-sm">{formatDateBR(issueDate)}</p>
            </div>
          )}
          {expiry && (
            <div>
              <p className="text-[7px] uppercase tracking-widest text-white/50 mb-0.5">Validade</p>
              <p className="text-[9px] font-mono drop-shadow-sm">{formatDateBR(expiry)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
        <span className="text-[7px] opacity-40">WBC NotePad • CPF</span>
      </div>

      {/* Actions - bottom right */}
      <div className="absolute bottom-2 right-4 z-10 flex items-end gap-2">
        {onToggleVisibility && (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">{visible ? "ocultar" : "mostrar"}</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleVisibility() }}
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            >
              {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
        {onCopy && (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">cpf</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopy(cpf || number) }}
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  if (variant === "front" || variant === "back") return card
  return <div className="max-w-md mx-auto">{card}</div>
}
