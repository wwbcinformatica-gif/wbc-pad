"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Monitor, Smartphone, ExternalLink, X, Globe } from "lucide-react"

declare global {
  interface Window {
    __deferredPrompt: any
    __installApp: () => Promise<boolean>
  }
}

export default function InstallApp() {
  const [canInstall, setCanInstall] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent)

  useEffect(() => {
    if (window.__deferredPrompt) setCanInstall(true)

    const handler = () => setCanInstall(true)
    document.addEventListener("install-ready", handler)

    const installedHandler = () => setInstalled(true)
    window.addEventListener("appinstalled", installedHandler)

    return () => {
      document.removeEventListener("install-ready", handler)
      window.removeEventListener("appinstalled", installedHandler)
    }
  }, [])

  async function handleInstall() {
    const accepted = await window.__installApp()
    if (accepted) {
      setInstalled(true)
      setCanInstall(false)
    }
  }

  if (installed) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
          <Download className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Instalar Aplicativo</h2>
          <p className="text-sm text-gray-500">
            {isMobile
              ? "Adicione à tela de início do seu celular"
              : "Adicione na área de trabalho do seu computador"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4 btn-3d">

        {/* PWA Install Button (when browser fires beforeinstallprompt) */}
        {canInstall && (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-[var(--theme-primary)]" />
              <div>
                <p className="font-medium text-gray-900">Instalar agora</p>
                <p className="text-sm text-gray-500">
                  {isMobile ? "Adiciona na tela de início" : "Cria um atalho na área de trabalho"}
                </p>
              </div>
            </div>
            <Button onClick={handleInstall} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Instalar
            </Button>
          </div>
        )}

        {/* Android instructions */}
        {isMobile && !isIOS && (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Android (Chrome)</p>
                  <p className="text-sm text-gray-500">Adicionar à tela de início</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setExpanded(expanded === "android" ? null : "android")}>
                {expanded === "android" ? <X className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
              </Button>
            </div>
            {expanded === "android" && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-1.5">
                <p>1. Toque no menu <strong>⋮</strong> (três pontos) no Chrome</p>
                <p>2. Selecione <strong>Adicionar à tela inicial</strong></p>
                <p>3. Toque em <strong>Adicionar</strong></p>
              </div>
            )}
          </div>
        )}

        {/* iOS instructions */}
        {isIOS && (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-700" />
                <div>
                  <p className="font-medium text-gray-900">iPhone / iPad</p>
                  <p className="text-sm text-gray-500">Adicionar à Tela de Início pelo Safari</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setExpanded(expanded === "ios" ? null : "ios")}>
                {expanded === "ios" ? <X className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
              </Button>
            </div>
            {expanded === "ios" && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-1.5">
                <p>1. Toque em <strong>Compartilhar</strong> <span className="text-lg">⎙</span> no Safari</p>
                <p>2. Role e toque em <strong>Adicionar à Tela de Início</strong></p>
                <p>3. Toque em <strong>Adicionar</strong></p>
              </div>
            )}
          </div>
        )}

        {/* Desktop instructions */}
        {!isMobile && (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Computador (Chrome / Edge)</p>
                  <p className="text-sm text-gray-500">Instalar como aplicativo</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setExpanded(expanded === "desktop" ? null : "desktop")}>
                {expanded === "desktop" ? <X className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
              </Button>
            </div>
            {expanded === "desktop" && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-1.5">
                <p>1. Olhe no canto direito da barra de endereço</p>
                <p>2. Clique no ícone <strong>⊕</strong> ou <strong>↓</strong> (Instalar)</p>
                <p>3. Confirme com <strong>Instalar</strong></p>
                <hr className="my-2" />
                <p className="text-xs text-gray-600 font-medium">No Brave / Opera / Firefox:</p>
                <p className="text-xs text-gray-400">Menu <strong>⋮</strong> ou <strong>☰</strong> → <strong>Instalar</strong> ou <strong>Criar Atalho</strong> (marque "Abrir como janela")</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
