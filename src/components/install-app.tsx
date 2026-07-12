"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, MonitorSmartphone, Check, ExternalLink, X } from "lucide-react"

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
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      if (result.outcome === "accepted") {
        setInstalled(true)
        setDeferredPrompt(null)
      }
    }
  }

  function handleDownloadShortcut() {
    const appUrl = window.location.origin
    const iconUrl = `${appUrl}/icon.svg`
    const isWindows = /Windows/.test(navigator.userAgent)
    const isMac = /Mac/.test(navigator.userAgent)

    let content: string
    let filename: string
    let mime: string

    if (isWindows) {
      content = `[InternetShortcut]\nURL=${appUrl}\nIconIndex=0\nIconFile=${iconUrl}`
      filename = "WBC NotePad.url"
      mime = "application/internet-shortcut"
    } else if (isMac) {
      content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>URL</key>
  <string>${appUrl}</string>
</dict>
</plist>`
      filename = "WBC NotePad.webloc"
      mime = "application/xml"
    } else {
      content = `[InternetShortcut]\nURL=${appUrl}`
      filename = "WBC NotePad.url"
      mime = "application/internet-shortcut"
    }

    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
          <p className="text-sm text-gray-500">Adicione um atalho do WBC NotePad na sua área de trabalho</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4 btn-3d">
        {canInstall && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MonitorSmartphone className="w-5 h-5 text-[var(--theme-primary)]" />
              <div>
                <p className="font-medium text-gray-900">Instalar como aplicativo</p>
                <p className="text-sm text-gray-500">Funciona offline e abre em tela cheia</p>
              </div>
            </div>
            <Button onClick={handleInstall} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Instalar
            </Button>
          </div>
        )}

        {isIOS && !canInstall && !isStandalone && (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MonitorSmartphone className="w-5 h-5 text-[var(--theme-primary)]" />
                <div>
                  <p className="font-medium text-gray-900">Instalar no iPhone/iPad</p>
                  <p className="text-sm text-gray-500">Adicione à tela de início pelo Safari</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowIOSHelp(!showIOSHelp)} className="flex items-center gap-2">
                {showIOSHelp ? <X className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                {showIOSHelp ? "Fechar" : "Como fazer"}
              </Button>
            </div>
            {showIOSHelp && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-2">
                <p>1. Toque no botão <strong>Compartilhar</strong> <span className="text-lg">⎙</span> no Safari</p>
                <p>2. Role para baixo e toque em <strong>Adicionar à Tela de Início</strong></p>
                <p>3. Confirme com <strong>Adicionar</strong></p>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Atalho para área de trabalho</p>
                <p className="text-sm text-gray-500">Baixe um arquivo de atalho (.url)</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleDownloadShortcut} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Baixar Atalho
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
