"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import type { Components } from "react-markdown"
import { useCodeTheme } from "@/contexts/code-theme-context"

const FONT = "'Cascadia Code', 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace"

export default function MarkdownRenderer({ content, className = "" }: { content: string; className?: string }) {
  const { theme } = useCodeTheme()
  const isDark = theme === "dark"

  const components: Partial<Components> = {
    code({ className: cl, children, ...props }) {
      const match = /language-(\w+)/.exec(cl || "")
      const language = match ? match[1] : ""
      const code = String(children).replace(/\n$/, "")

      if (match) {
        const lines = code.split("\n")
        const gutterWidth = String(lines.length).length + 1
        const lineNumberStyle = {
          display: "inline-block",
          width: `${gutterWidth}ch`,
          textAlign: "right" as const,
          paddingRight: "1ch",
          marginRight: "1ch",
          color: isDark ? "#6e7681" : "#a0a0a0",
          borderRight: `1px solid ${isDark ? "#3c3c3c" : "#e0e0e0"}`,
          userSelect: "none" as const,
          fontSize: "inherit",
        }

        return (
          <div
            className={`relative group my-5 rounded-xl overflow-hidden border shadow-sm ${
              isDark ? "border-[#3c3c3c]" : "border-gray-200"
            }`}
          >
            <SyntaxHighlighter
              style={isDark ? oneDark : oneLight}
              language={language || "text"}
              PreTag="div"
              showLineNumbers
              wrapLongLines
              lineNumberStyle={lineNumberStyle}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: "0.8125rem",
                fontFamily: FONT,
                lineHeight: "22px",
              }}
              codeTagProps={{ style: { fontFamily: FONT } }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        )
      }

      return (
        <code
          className={`px-1.5 py-0.5 rounded text-sm font-mono ${
            isDark ? "bg-[#2d2d2d] text-[#d4d4d4]" : "bg-gray-100 text-gray-800"
          }`}
          style={{ fontFamily: FONT, fontSize: "0.8125rem" }}
          {...props}
        >
          {children}
        </code>
      )
    },

    pre({ children }) {
      return <>{children}</>
    },

    h1({ children, ...props }) {
      return <h1 className={`text-2xl font-bold mt-8 mb-4 pb-2 border-b ${isDark ? "text-[#d4d4d4] border-[#3c3c3c]" : "text-gray-900 border-gray-200"}`} {...props}>{children}</h1>
    },

    h2({ children, ...props }) {
      return <h2 className={`text-xl font-bold mt-6 mb-3 ${isDark ? "text-[#d4d4d4]" : "text-gray-900"}`} {...props}>{children}</h2>
    },

    h3({ children, ...props }) {
      return <h3 className={`text-lg font-semibold mt-5 mb-2 ${isDark ? "text-[#d4d4d4]" : "text-gray-900"}`} {...props}>{children}</h3>
    },

    p({ children, ...props }) {
      return <p className={`my-3 leading-7 ${isDark ? "text-[#d4d4d4]" : "text-gray-800"}`} {...props}>{children}</p>
    },

    a({ children, href, ...props }) {
      return <a href={href} className={`underline underline-offset-2 ${isDark ? "text-[#4fc1ff] hover:text-[#6fcbff]" : "text-blue-600 hover:text-blue-800"}`} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
    },

    ul({ children, ...props }) {
      return <ul className={`my-3 pl-6 space-y-1.5 ${isDark ? "text-[#d4d4d4]" : "text-gray-800"}`} style={{ listStyleType: "disc" }} {...props}>{children}</ul>
    },

    ol({ children, ...props }) {
      return <ol className={`my-3 pl-6 space-y-1.5 ${isDark ? "text-[#d4d4d4]" : "text-gray-800"}`} style={{ listStyleType: "decimal" }} {...props}>{children}</ol>
    },

    blockquote({ children, ...props }) {
      return (
        <blockquote
          className={`my-4 pl-4 py-2 border-l-4 rounded-r ${
            isDark ? "border-[#4fc1ff] bg-[#1e1e1e] text-[#969696]" : "border-blue-400 bg-gray-50 text-gray-600"
          }`}
          {...props}
        >
          {children}
        </blockquote>
      )
    },

    table({ children, ...props }) {
      return (
        <div className="overflow-x-auto my-4">
          <table className={`w-full text-sm border-collapse ${isDark ? "text-[#d4d4d4]" : "text-gray-800"}`} {...props}>{children}</table>
        </div>
      )
    },

    th({ children, ...props }) {
      return <th className={`px-3 py-2 border text-left font-semibold ${isDark ? "border-[#3c3c3c] bg-[#252526]" : "border-gray-200 bg-gray-50"}`} {...props}>{children}</th>
    },

    td({ children, ...props }) {
      return <td className={`px-3 py-2 border ${isDark ? "border-[#3c3c3c]" : "border-gray-200"}`} {...props}>{children}</td>
    },

    hr({ ...props }) {
      return <hr className={`my-6 ${isDark ? "border-[#3c3c3c]" : "border-gray-200"}`} {...props} />
    },
  }

  return (
    <div className={`max-w-none break-words overflow-x-hidden ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
