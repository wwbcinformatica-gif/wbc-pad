"use client"

import { useCallback } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { json } from "@codemirror/lang-json"
import { markdown } from "@codemirror/lang-markdown"
import { sql } from "@codemirror/lang-sql"
import { python } from "@codemirror/lang-python"
import { xml } from "@codemirror/lang-xml"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import { useCodeTheme } from "@/contexts/code-theme-context"
import { useState } from "react"

const LANGUAGES = [
  { value: "javascript", label: "JavaScript", ext: javascript({ jsx: true, typescript: false }) },
  { value: "typescript", label: "TypeScript", ext: javascript({ jsx: true, typescript: true }) },
  { value: "jsx", label: "JSX", ext: javascript({ jsx: true }) },
  { value: "tsx", label: "TSX", ext: javascript({ jsx: true, typescript: true }) },
  { value: "python", label: "Python", ext: python() },
  { value: "html", label: "HTML", ext: html() },
  { value: "css", label: "CSS", ext: css() },
  { value: "sql", label: "SQL", ext: sql() },
  { value: "java", label: "Java", ext: java() },
  { value: "go", label: "Go", ext: javascript() },
  { value: "rust", label: "Rust", ext: javascript() },
  { value: "c", label: "C", ext: cpp() },
  { value: "cpp", label: "C++", ext: cpp() },
  { value: "csharp", label: "C#", ext: java() },
  { value: "php", label: "PHP", ext: javascript() },
  { value: "ruby", label: "Ruby", ext: javascript() },
  { value: "bash", label: "Bash", ext: javascript() },
  { value: "json", label: "JSON", ext: json() },
  { value: "yaml", label: "YAML", ext: markdown() },
  { value: "docker", label: "Dockerfile", ext: markdown() },
  { value: "markdown", label: "Markdown", ext: markdown() },
  { value: "xml", label: "XML", ext: xml() },
  { value: "text", label: "Texto puro", ext: [] },
]

const lightTheme = EditorView.theme({
  "&": { backgroundColor: "#ffffff", color: "#383a42" },
  ".cm-gutters": {
    backgroundColor: "#f3f3f3",
    color: "#6e7681",
    borderRight: "1px solid #e0e0e0",
  },
  ".cm-activeLineGutter": { backgroundColor: "#e8e8e8" },
  ".cm-activeLine": { backgroundColor: "#f5f5f5" },
  ".cm-cursor": { borderLeftColor: "#526fff" },
  ".cm-selectionBackground, ::selection": { backgroundColor: "#d7dff5 !important" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionLayer .cm-selectionBackground": { background: "#d7dff5 !important" },
  ".cm-matchingBracket": { backgroundColor: "#dedede", outline: "1px solid #a0a0a0" },
}, { dark: false })

const FONT = "'Cascadia Code', 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace"

interface CodeEditorProps {
  code: string
  onChange: (val: string) => void
  language: string
  onLanguageChange: (val: string) => void
  minHeight?: string
}

export default function CodeEditor({ code, onChange, language, onLanguageChange, minHeight = "320px" }: CodeEditorProps) {
  const { theme, toggle } = useCodeTheme()
  const [cm, setCm] = useState<any>(null)

  const isDark = theme === "dark"
  const lang = LANGUAGES.find((l) => l.value === language) || LANGUAGES[0]

  const handleChange = useCallback((val: string) => {
    onChange(val)
  }, [onChange])

  const handleCreate = useCallback((editor: any) => {
    setCm(editor)
  }, [])

  return (
    <div className={`rounded-xl overflow-hidden border shadow-sm ${isDark ? "border-[#3c3c3c]" : "border-gray-200"}`}>
      {/* Header bar */}
      <div className={`flex items-center px-4 py-1.5 select-none ${
        isDark ? "bg-[#252526] border-b border-[#3c3c3c]" : "bg-gray-100 border-b border-gray-200"
      }`}>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className={`text-xs px-2 py-1 rounded border-0 focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)] cursor-pointer ${
            isDark ? "bg-[#3c3c3c] text-[#d4d4d4]" : "bg-white text-gray-700 border border-gray-200"
          }`}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="tsx">TSX</option>
          <option value="jsx">JSX</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
          <option value="cpp">C++</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="sql">SQL</option>
          <option value="bash">Bash</option>
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
          <option value="markdown">Markdown</option>
          <option value="xml">XML</option>
          <option value="text">Texto puro</option>
        </select>
      </div>

      {/* CodeMirror Editor */}
      <CodeMirror
        value={code}
        onChange={handleChange}
        onCreateEditor={handleCreate}
        extensions={[
          lang.ext,
          EditorView.lineWrapping,
          EditorView.theme({
            "&": {
              fontFamily: FONT,
              fontSize: "13px",
              lineHeight: "22px",
              minHeight,
            },
            ".cm-scroller": { fontFamily: FONT, overflowX: "hidden" },
            ".cm-content": { fontFamily: FONT, padding: "12px 0" },
            ".cm-line": { padding: "0 16px" },
            ".cm-gutters": { fontFamily: FONT, fontSize: "12px" },
            ".cm-activeLine": isDark ? { backgroundColor: "#0a0a0a" } : {},
            ...(isDark ? {
              "&": { backgroundColor: "#000" },
              ".cm-gutters": { backgroundColor: "#000", color: "#555" },
              ".cm-activeLineGutter": { backgroundColor: "#0a0a0a" },
            } : {}),
          }),
        ]}
        theme={isDark ? oneDark : lightTheme}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: false,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          indentOnInput: true,
          tabSize: 2,
        }}
        height={minHeight === "100%" ? undefined : `${minHeight}`}
        className={`text-left ${minHeight === "100%" ? "h-full" : ""}`}
      />
    </div>
  )
}
