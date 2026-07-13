import { CodeThemeProvider } from "@/contexts/code-theme-context"

export default function CodigosLayout({ children }: { children: React.ReactNode }) {
  return (
    <CodeThemeProvider>
      <div className="h-full overflow-hidden flex flex-col">
        {children}
      </div>
    </CodeThemeProvider>
  )
}
