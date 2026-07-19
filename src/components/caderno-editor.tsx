"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft, Tag, X, CheckSquare, Strikethrough,
  Bold, Italic, Save, Pin, PinOff, Trash2, Download,
  RotateCcw, RotateCw
} from "lucide-react"

/* ─────────── Markdown ↔ HTML conversion ─────────── */

function markdownToHtml(md: string): string {
  const normalized = md.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  if (!normalized.trim()) return ""

  return normalized.split("\n").map((line) => {
    const trimmedLine = line.trim()
    const cbMatch = trimmedLine.match(/^(?:[-*]\s+)?\[([ xX])\]\s*(.*)$/)

    if (cbMatch) {
      const checked = cbMatch[1].toLowerCase() === "x"
      const text = cbMatch[2]
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/~~(.*?)~~/g, "<del>$1</del>")
        .replace(/_(.*?)_/g, "<em>$1</em>")
      return `<span class="ce-cb-line"><span class="ce-cb-inline" data-checked="${checked}">${checked ? "☑" : "☐"}</span><span>${text}</span></span>`
    }

    return line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(/_(.*?)_/g, "<em>$1</em>") || "<br>"
  }).join("<br>")
}

function serializeToMarkdown(html: string): string {
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<span[^>]*class="[^"]*ce-cb-inline[^"]*"[^>]*data-checked="true"[^>]*>.*?<\/span>/gi, "- [x] ")
    .replace(/<span[^>]*class="[^"]*ce-cb-inline[^"]*"[^>]*data-checked="false"[^>]*>.*?<\/span>/gi, "- [ ] ")
    .replace(/<span[^>]*class="[^"]*ce-cb-line[^"]*"[^>]*>/gi, "")
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/<em>(.*?)<\/em>/g, "_$1_")
    .replace(/<del>(.*?)<\/del>/g, "~~$1~~")
    .replace(/<\/?span[^>]*>/gi, "")
    .replace(/<\/?div[^>]*>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  return text
}

/* ─────────── Notebook paper wrapper ─────────── */
function NotebookPaper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-sm overflow-hidden w-full"
      style={{
        background: "linear-gradient(180deg, #fdf8e1 0%, #fef9e4 100%)",
        border: "1px solid #e8d98a",
        boxShadow: "3px 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      {children}
    </div>
  )
}

/* ─────────── Tags bar ─────────── */
function TagsBar({
  tags, setTags, inputRef
}: {
  tags: string[]; setTags: (t: string[]) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const [input, setInput] = useState("")

  function add() {
    const t = input.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setInput("")
  }

  return (
    <div className="px-8 py-3" style={{ borderTop: "1px solid #e8d98a" }}>
      <div className="flex items-center gap-2 flex-wrap">
        <Tag className="w-4 h-4 text-amber-600 flex-shrink-0" />
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-200 text-amber-800 font-medium">
            {tag}
            <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-red-600">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-amber-800 placeholder-amber-400"
          placeholder="Adicionar tag... (Enter)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
          onBlur={add}
        />
      </div>
    </div>
  )
}

/* ─────────── Main editor component ─────────── */
export interface CadernoEditorProps {
  title: string
  setTitle: (v: string) => void
  content: string
  setContent: (v: string) => void
  tags: string[]
  setTags: (v: string[]) => void
  pinned?: boolean
  onTogglePin?: () => void
  saving: boolean
  error: string
  onSubmit: (e: React.FormEvent, savedContent?: string) => void
  onDelete?: () => void
  backHref: string
  pageTitle: string
}

export default function CadernoEditor({
  title, setTitle, content, setContent, tags, setTags,
  pinned, onTogglePin, saving, error, onSubmit, onDelete,
  backHref, pageTitle,
}: CadernoEditorProps) {
  const contentAtSave = useRef("")
  const editorRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef(content)
  const initialized = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    contentRef.current = content
  })

  const syncToState = useCallback(() => {
    if (!editorRef.current) return
    const md = serializeToMarkdown(editorRef.current.innerHTML)
    if (md !== contentRef.current) {
      setContent(md)
    }
  }, [setContent])

  /* Init / re-init when content changes externally */
  useEffect(() => {
    if (!editorRef.current) return
    if (!initialized.current) {
      editorRef.current.innerHTML = markdownToHtml(content)
      initialized.current = true
      return
    }
    const currentMd = serializeToMarkdown(editorRef.current.innerHTML)
    if (currentMd !== content) {
      editorRef.current.innerHTML = markdownToHtml(content)
    }
  }, [content])

  /* Keyboard shortcuts */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") { e.preventDefault(); document.execCommand("bold") }
      else if (e.key === "i") { e.preventDefault(); document.execCommand("italic") }
      else if (e.key === "x" && e.shiftKey) { e.preventDefault(); document.execCommand("strikeThrough") }
      else if (e.key === "z" && !e.shiftKey) { e.preventDefault(); document.execCommand("undo") }
      else if (e.key === "y" || (e.key === "z" && e.shiftKey)) { e.preventDefault(); document.execCommand("redo") }
      setTimeout(syncToState, 0)
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      document.execCommand("insertLineBreak")
      setTimeout(syncToState, 0)
    }
  }, [syncToState])

  function execCmd(cmd: string, value?: string) {
    document.execCommand(cmd, false, value)
    setTimeout(syncToState, 0)
  }

  function insertCheckbox() {
    if (!editorRef.current) return
    editorRef.current.focus()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)

    const span = document.createElement("span")
    span.className = "ce-cb-inline"
    span.setAttribute("data-checked", "false")
    span.textContent = "☐ "

    range.deleteContents()
    range.insertNode(span)

    const after = document.createTextNode("\u00A0")
    span.after(after)
    range.setStartAfter(after)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
    setTimeout(syncToState, 0)
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
    setTimeout(syncToState, 0)
  }

  function handleInput() {
    setTimeout(syncToState, 0)
  }

  const handleCheckboxNative = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const cb = target.closest(".ce-cb-inline") as HTMLElement | null
    if (cb) {
      e.preventDefault()
      const checked = cb.getAttribute("data-checked") === "true"
      cb.setAttribute("data-checked", String(!checked))
      cb.textContent = checked ? "☐ " : "☑ "
      setTimeout(syncToState, 0)
    }
  }, [syncToState])

  function handleDownload() {
    const txt = `${title}\n\n${content}`
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title || "pagina"}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (!editorRef.current) return
    contentAtSave.current = serializeToMarkdown(editorRef.current.innerHTML)
    setContent(contentAtSave.current)
    onSubmit(e, contentAtSave.current)
  }

  function ToolBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
        title={title}
        className="p-1.5 rounded-md transition-colors text-[var(--theme-secondary)] hover:bg-[var(--theme-secondary)]/10 active:bg-[var(--theme-secondary)]/20"
      >
        {children}
      </button>
    )
  }

  return (
    <>
      {/* Fixed toolbar bar — always visible below the dashboard header */}
      <div className="fixed top-16 left-0 right-0 z-40 flex justify-center pt-1 pb-3 bg-gradient-to-b from-[var(--theme-bg)] via-[var(--theme-bg)] to-transparent pointer-events-none">
        <div className="flex items-center gap-0.5 px-3 py-2 rounded-lg border border-gray-200/70 bg-white shadow-lg pointer-events-auto overflow-x-auto">
          <ToolBtn title="Negrito" onClick={() => execCmd("bold")}><Bold className="w-[15px] h-[15px] text-violet-500 hover:text-violet-600" /></ToolBtn>
           <ToolBtn title="Itálico" onClick={() => execCmd("italic")}><Italic className="w-[15px] h-[15px] text-fuchsia-500 hover:text-fuchsia-600" /></ToolBtn>
           <ToolBtn title="Riscado" onClick={() => execCmd("strikeThrough")}><Strikethrough className="w-[15px] h-[15px] text-rose-500 hover:text-rose-600" /></ToolBtn>
           <div className="w-px h-4 bg-gray-200 mx-0.5" />
           <ToolBtn title="Checkbox" onClick={insertCheckbox}><CheckSquare className="w-[15px] h-[15px] text-emerald-500 hover:text-emerald-600" /></ToolBtn>
           <div className="w-px h-4 bg-gray-200 mx-0.5" />
           <ToolBtn title="Desfazer" onClick={() => execCmd("undo")}><RotateCcw className="w-[15px] h-[15px] text-amber-500 hover:text-amber-600" /></ToolBtn>
           <ToolBtn title="Refazer" onClick={() => execCmd("redo")}><RotateCw className="w-[15px] h-[15px] text-amber-500 hover:text-amber-600" /></ToolBtn>
           <div className="w-px h-5 bg-gray-300 mx-1.5" />
           <ToolBtn title="Download TXT" onClick={handleDownload}><Download className="w-[15px] h-[15px] text-cyan-500 hover:text-cyan-600" /></ToolBtn>
           <div className="w-px h-4 bg-gray-200 mx-0.5" />
           <button
             type="button"
             onClick={() => {
               tagInputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
               tagInputRef.current?.focus()
             }}
             title="Tag"
             className="p-1.5 rounded-md transition-colors text-amber-500 hover:text-amber-600 hover:bg-[var(--theme-secondary)]/10 active:bg-[var(--theme-secondary)]/20"
           >
             <Tag className="w-[15px] h-[15px]" />
           </button>
           {onTogglePin && (
             <ToolBtn title={pinned ? "Desafixar" : "Fixar"} onClick={onTogglePin}>
               {pinned ? <Pin className="w-[15px] h-[15px] fill-[var(--theme-secondary)] text-[var(--theme-secondary)]" /> : <PinOff className="w-[15px] h-[15px] text-slate-500 hover:text-slate-600" />}
             </ToolBtn>
           )}
           {onDelete && (
             <ToolBtn title="Excluir" onClick={onDelete}>
               <Trash2 className="w-[15px] h-[15px] text-red-500 hover:text-red-600" />
             </ToolBtn>
           )}
          <div className="w-px h-5 bg-gray-300 mx-1.5" />
          <ToolBtn title="Cancelar" onClick={() => router.push(backHref)}>
             <X className="w-[15px] h-[15px] text-gray-400 hover:text-gray-600" />
           </ToolBtn>
           <ToolBtn title="Salvar" onClick={() => formRef.current?.requestSubmit()}>
             <Save className="w-[15px] h-[15px] text-blue-500 hover:text-blue-600" />
           </ToolBtn>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-14">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href={backHref}>
              <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 text-slate-500 hover:text-slate-700" /></Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
        </div>

      <form ref={formRef} onSubmit={handleFormSubmit}>
        <NotebookPaper>
          {/* Lines background */}
          <div
            className="relative"
            style={{
              backgroundImage: "repeating-linear-gradient(transparent, transparent 35px, #d4c17f55 35px, #d4c17f55 36px)",
              backgroundSize: "100% 36px",
              backgroundPosition: "0 52px",
            }}
          >
            {/* Title */}
            <input
              className="w-full px-6 md:px-8 pt-6 pb-2 text-xl md:text-2xl font-bold border-none outline-none bg-transparent text-gray-800 placeholder-amber-300"
              style={{ fontFamily: "'Georgia', serif", lineHeight: "36px" }}
              placeholder="Título da página..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="mx-6 md:mx-8 h-px mb-1" style={{ background: "#d4c17f88" }} />

            {/* Rich editor */}
            <div
              ref={editorRef}
              tabIndex={0}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onClick={handleCheckboxNative}
              onMouseUp={() => {
                setTimeout(syncToState, 0)
              }}
              className="caderno-editor w-full px-6 md:px-8 py-4 min-h-[480px] bg-transparent outline-none resize-none text-base text-gray-700"
              style={{
                fontFamily: "'Georgia', serif",
                lineHeight: "36px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              data-placeholder="Escreva aqui..."
            />
          </div>

           <TagsBar tags={tags} setTags={setTags} inputRef={tagInputRef} />
        </NotebookPaper>

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}
      </form>
    </div>
  </>
  )
}
