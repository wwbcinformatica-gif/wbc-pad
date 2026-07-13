"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PASSWORD_CATEGORIES } from "@/types"
import {
  Wifi,
  CreditCard,
  Globe,
  FileText,
  Building,
  Mail,
  Server,
  Key,
  Shield,
  Cloud,
  Smartphone,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

const iconMap: Record<string, typeof Wifi> = {
  wifi: Wifi,
  "credit-card": CreditCard,
  globe: Globe,
  "file-text": FileText,
  building: Building,
  mail: Mail,
  server: Server,
  key: Key,
}

export default function LandingPage() {
  const [trialDays, setTrialDays] = useState(7)

  useEffect(() => {
    import("@/lib/app-config").then(({ getAppConfig }) =>
      getAppConfig().then((cfg) => setTrialDays(cfg.trial_days))
    )
    const supabase = createClient()
    supabase.auth.getUser().then((res: any) => {
      if (res.data?.user) window.location.href = "/dashboard"
    })
  }, [])
  return (
    <>
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="font-bold text-xl text-gray-900">
                WBC <span className="text-[var(--theme-primary)]">NotePad</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#recursos" className="text-sm text-gray-600 hover:text-[var(--theme-primary)] transition-colors">
                Recursos
              </a>
              <a href="#planos" className="text-sm text-gray-600 hover:text-[var(--theme-primary)] transition-colors">
                Planos
              </a>
              <Link href="/login" className="text-sm text-gray-600 hover:text-[var(--theme-primary)] transition-colors">
                Entrar
              </Link>
              <Link href="/register">
                <Button size="sm">Começar Grátis</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)]/5 via-transparent to-[var(--theme-secondary)]/5" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Caderno Digital de Senhas
              </div>
               <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                 Suas licenças em um só lugar,{" "}
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)]">
                   seguras e organizadas
                 </span>
               </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                O caderno de anotações que você já conhece, agora online. Acesse de qualquer lugar,
                compartilhe com quem precisar e nunca mais perca uma senha.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="text-base">
                    Começar Grátis
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <a href="#recursos">
                  <Button variant="outline" size="lg">
                    Ver Recursos
                  </Button>
                </a>
              </div>
              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-[var(--theme-secondary)]" />
                {trialDays} dias grátis • Sem cartão de crédito
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tudo que você precisa
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Organize todos os tipos de senha em um só lugar
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PASSWORD_CATEGORIES.map((cat) => {
                const Icon = iconMap[cat.icon] || Key
                return (
                  <Card key={cat.key} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-secondary)]/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-[var(--theme-primary)]" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{cat.label}</h3>
                      <p className="text-sm text-gray-500">
                        Armazene {cat.label.toLowerCase()}s com todos os campos necessários
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Por que escolher o WBC NotePad?
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--theme-primary)]/10 flex items-center justify-center mx-auto mb-4">
                  <Cloud className="w-8 h-8 text-[var(--theme-primary)]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">100% Online</h3>
                <p className="text-gray-500 text-sm">
                  Acesse de qualquer dispositivo, a qualquer hora. Seus dados sempre sincronizados.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--theme-secondary)]/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[var(--theme-secondary)]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Segurança</h3>
                <p className="text-gray-500 text-sm">
                  Dados criptografados com autenticação segura via Supabase. Suas senhas protegidas.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-secondary)]/10 flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-[var(--theme-primary)]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">PWA</h3>
                <p className="text-gray-500 text-sm">
                  Instale como aplicativo no celular. Funciona como um app nativo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="planos" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Planos
              </h2>
              <p className="text-lg text-gray-600">
                Comece com {trialDays} dias grátis, sem compromisso
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <Card className="border-2 border-[var(--theme-primary)] shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 px-3 py-1 rounded-full">
                      MAIS POPULAR
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">Premium</h3>
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-gray-900">R$ --</span>
                    <span className="text-gray-500">/mês</span>
                    <p className="text-sm text-gray-500 mt-1">Defina seu valor</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      `{trialDays} dias grátis`,
                      "Senhas ilimitadas",
                      "Todas as categorias",
                      "Acesso de qualquer lugar",
                      "Criptografia segura",
                      "Suporte prioritário",
                      "Instalação como App",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-[var(--theme-secondary)] flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="w-full text-base" size="lg">
                      Começar Teste Grátis
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            © 2026 WBC INFORMÁTICA. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </>
  )
}
