"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  Menu,
  X,
  Shield,
  BookOpen,
  Archive,
  StickyNote,
  ShoppingCart,
  Calendar,
  Lock,
  Settings,
  Volume2,
  VolumeX,
  Terminal,
} from "lucide-react"
import { useSound } from "@/contexts/sound-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("user")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeHref, setActiveHref] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  // const supabase = createClient() - Remove this, create client inside useEffect

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : ""
    setActiveHref(pathname + search)
    router.refresh()
  }, [pathname])

  useEffect(() => {
    setSidebarOpen(false)

    const getUser = async () => {
      try {
        const supabase = createClient()

        if (!supabase || !supabase.auth) return

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) return

        setUserEmail(user.email || "")

        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, name")
            .eq("id", user.id)
            .single()

          if (profile) {
            setUserRole(profile.role)
            setUserName(profile.name)
          }
        } catch (_) {}
      } catch (_) {}
    }

    getUser()
  }, [])

  const { enabled: soundEnabled, setEnabled: setSoundEnabled, navSound, setNavSound, play } = useSound()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const navSections = [
    {
      label: "PRINCIPAL",
      items: [
        { href: "/dashboard", label: "Minhas Senhas", icon: Lock },
        { href: "/dashboard/caderno", label: "Caderno", icon: BookOpen },
        { href: "/dashboard/codigos", label: "Códigos", icon: Terminal },
        { href: "/dashboard/checklist", label: "Lista de Compras", icon: ShoppingCart },
        { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
      ],
    },
    {
      label: "CONFIGURAÇÕES",
      items: [
        { href: "/dashboard/backup", label: "Backup", icon: Archive },
        { href: "/dashboard/settings", label: "Configurações", icon: Settings },
        ...(userRole === "admin"
          ? [{ href: "/dashboard/admin", label: "Administrador", icon: Shield }]
          : []),
      ],
    },
  ]

  return (
    <div className="h-screen flex flex-col bg-[#f5f7fa] overflow-hidden">
      <header className="shrink-0 z-50 glass-strong border-b border-white/20">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 hover:bg-white/80 rounded-xl transition-all icon-3d"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] flex items-center justify-center shadow-lg shadow-[var(--theme-primary)]/20">
                <span className="text-white font-bold text-base drop-shadow-sm">W</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">WBC NotePad</span>
                <span className="text-[10px] text-gray-400 block leading-none">Caderno Digital</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-[var(--theme-primary)]/20 icon-3d">
                {(userName || userEmail)[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-gray-700 font-medium">{userName || userEmail}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-500">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        <aside
          className={`${sidebarOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"} lg:translate-x-0 lg:pointer-events-auto fixed lg:sticky lg:top-16 inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200/80 pt-16 lg:pt-0 transition-transform duration-300 ease-in-out shrink-0 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto`}
        >
          <div className="p-5 space-y-6 mt-4">
            {navSections.map((section) => (
              <div key={section.label}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-3">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = item.href === activeHref
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => { if (navSound) play(); setActiveHref(item.href); setSidebarOpen(false) }}
                        className={`nav-item-3d flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "active bg-gradient-to-r from-[var(--theme-primary)]/15 to-[var(--theme-secondary)]/15 text-[var(--theme-primary)] glass-strong"
                            : "text-gray-600 hover:bg-white/80 hover:text-gray-900 glass"
                        }`}
                      >
                        <div
                          className={`icon-3d w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            isActive
                              ? "active bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white"
                              : "bg-white/80 text-gray-500"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}

            
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
