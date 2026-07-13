import { CodeThemeProvider } from "@/contexts/code-theme-context"

export default function CodigosLayout({ children }: { children: React.ReactNode }) {
  return <CodeThemeProvider>{children}</CodeThemeProvider>
}
