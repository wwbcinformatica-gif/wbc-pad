"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, MonitorSmartphone, ExternalLink, X, Smartphone, Laptop } from "lucide-react"

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [showIOSHelp, setShowIOSHelp] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handler)

    const installedHandler = () => setInstalled(true)
    window.addEventListener("appinstalled", installedHandler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", installedHandler)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === "accepted") {
      setInstalled(true)
      setDeferredPrompt(null)
    }
  }

  const canInstall = !!deferredPrompt

  if (installed || isStandalone) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
          <Download className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Instalar Aplicativo</h2>
          <p className="text-sm text-gray-500">Adicione na tela de início do seu celular ou computador</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4 btn-3d">
        {/* Chrome/Edge/Android - PWA Install */}
        {canInstall && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Laptop className="w-5 h-5 text-[var(--theme-primary)]" />
              <div>
                <p className="font-medium text-gray-900">Instalar no computador ou celular</p>
                <p className="text-sm text-gray-500">Cria um atalho na área de trabalho / tela de início</p>
              </div>
            </div>
            <Button onClick={handleInstall} className="flex items-center gap-2 whitespace-nowrap">
              <Download className="w-4 h-4" /> Instalar
            </Button>
          </div>
        )}

        {/* iOS - Safari instructions */}
        {isIOS && !canInstall && (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-[var(--theme-primary)]" />
                <div>
                  <p className="font-medium text-gray-900">Instalar no iPhone/iPad</p>
                  <p className="text-sm text-gray-500">Adicione à tela de início pelo Safari</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowIOSHelp(!showIOSHelp)} className="flex items-center gap-2 whitespace-nowrap">
                {showIOSHelp ? <X className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                {showIOSHelp ? "Fechar" : "Como fazer"}
              </Button>
            </div>
            {showIOSHelp && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-2">
                <p>1. Toque no botão <strong>Compartilhar</strong> <span className="text-lg">⎙</span> no Safari</p>
                <p>2. Role para baixo e toque em <strong>Adicionar à Tela de Início</strong></p>
                <p>3. Confirme com <strong>Adicionar</strong></p>
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-400">
                  Isso cria um ícone na tela de início do seu iPhone/iPad que abre o WBC NotePad como um aplicativo normal.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Android fallback */}
        {!canInstall && !isIOS && (
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Disponível para instalação</p>
              <p className="text-sm text-gray-500">
                Abra pelo Chrome ou Edge e use a opção &quot;Instalar aplicativo&quot; no menu
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
