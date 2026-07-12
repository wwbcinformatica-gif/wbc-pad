"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSound } from "@/contexts/sound-context"
import { SOUND_LIST } from "@/lib/sounds"
import { THEMES, applyTheme, loadSavedTheme } from "@/lib/themes"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Music, Palette, Check, Play, ArrowLeft, Share2, Copy, ExternalLink, Database } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { testDatabaseConnection } from "@/lib/supabase"

export default function SettingsPage() {
  const router = useRouter()
  const { enabled, volume, selectedSound, navSound, setEnabled, setVolume, setSelectedSound, setNavSound, saveToDatabase, playPreview } = useSound()
  const [currentTheme, setCurrentTheme] = useState("teal-spring")
  const [previewSound, setPreviewSound] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState("")
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)

  useEffect(() => {
    const saved = loadSavedTheme()
    if (saved) setCurrentTheme(saved)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      try {
        console.log('Getting user...')
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.error('Auth error:', authError)
          alert('Usuário não autenticado. Por favor, faça login novamente.')
          router.push("/login")
          return
        }

        console.log('User found:', user.email)
        setUserId(user.id)
        
        // Test database connection with better error handling
        console.log('Testing database connection...')
        try {
          const connected = await testDatabaseConnection()
          console.log('Database connection result:', connected)
          setDbConnected(connected)
        } catch (dbError) {
          console.error('Database test error:', dbError)
          setDbConnected(false)
        }
      } catch (error) {
        console.error('Error getting user:', error)
        alert('Erro ao obter informações do usuário.')
        setDbConnected(false)
      }
    }
    
    getUser()
    
    // Generate share URL
    if (typeof window !== 'undefined') {
      const url = 'https://wbc-notepad.vercel.app'
      setShareUrl(url)
    }
  }, [router])

  const handleSaveSettings = async () => {
    if (!userId) {
      console.error('User ID not available')
      alert('Erro: Usuário não identificado. Por favor, recarregue a página.')
      return
    }

    try {
      console.log('Attempting to save settings for user:', userId)
      await saveToDatabase(userId)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Ocorreu um erro ao salvar as configurações. Verifique sua conexão e tente novamente.')
    }
  }

  const handleCopyShareUrl = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy: ', err)
      }
    }
  }

  const handleThemeSelect = (themeId: string) => {
    setCurrentTheme(themeId)
    applyTheme(themeId)
  }

  const handlePreview = (soundId: string) => {
    playPreview(soundId as any)
    setPreviewSound(soundId)
    setTimeout(() => setPreviewSound(null), 500)
  }

  const testAudio = () => {
    playPreview('seco')
    setPreviewSound('seco')
    setTimeout(() => setPreviewSound(null), 500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500">Personalize sua experiência</p>
        </div>
      </div>

      {/* === COMPARTILHAMENTO === */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Compartilhar</h2>
            <p className="text-sm text-gray-500">Compartilhe seu WBC NotePad com amigos</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4 btn-3d">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Link do seu WBC NotePad</p>
              <p className="text-sm text-gray-500">Compartilhe este link para acessar suas anotações</p>
            </div>
            <Button
              onClick={handleCopyShareUrl}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-600 truncate">{shareUrl}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(shareUrl, '_blank')}
              className="p-3"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* === THEMES === */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-secondary)]/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-[var(--theme-primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Temas</h2>
            <p className="text-sm text-gray-500">Escolha a cor do seu WBC NotePad</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              className={`relative rounded-2xl p-4 text-left transition-all duration-300 btn-3d ${
                currentTheme === theme.id
                  ? "ring-2 ring-[var(--theme-primary)] ring-offset-2"
                  : "hover:ring-2 hover:ring-gray-200 hover:ring-offset-1"
              }`}
              style={{ background: theme.colors.bg }}
            >
              <div className={`h-10 rounded-xl mb-3 bg-gradient-to-r ${theme.preview} shadow-sm`} />
              <p className="text-sm font-semibold" style={{ color: theme.colors.text }}>{theme.label}</p>
              <div className="flex gap-1 mt-2">
                <span className="w-3 h-3 rounded-full" style={{ background: theme.colors.primary }} />
                <span className="w-3 h-3 rounded-full" style={{ background: theme.colors.secondary }} />
                <span className="w-3 h-3 rounded-full" style={{ background: theme.colors.accent }} />
              </div>
              {currentTheme === theme.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--theme-primary)] rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* === SOUNDS === */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
            <Music className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Sons</h2>
            <p className="text-sm text-gray-500">Ative sons nos botões e escolha seu estilo</p>
            {dbConnected === false && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <Database className="w-4 h-4" />
                <span>Banco de dados não conectado</span>
              </div>
            )}
            {dbConnected === true && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Database className="w-4 h-4" />
                <span>Banco de dados conectado</span>
              </div>
            )}
          </div>
        </div>

        {/* Sound Controls */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4 btn-3d">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-7 rounded-full transition-all relative ${
                  enabled ? "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)]" : "bg-gray-200"
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                  enabled ? "left-[22px]" : "left-0.5"
                }`} />
              </button>
              <span className="font-medium text-gray-900">
                {enabled ? "Som ativado" : "Som desativado"}
              </span>
            </div>
            {enabled ? (
              <Volume2 className="w-5 h-5 text-[var(--theme-primary)]" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNavSound(!navSound)}
                className={`w-12 h-7 rounded-full transition-all relative ${
                  navSound ? "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)]" : "bg-gray-200"
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                  navSound ? "left-[22px]" : "left-0.5"
                }`} />
              </button>
              <span className="font-medium text-gray-900">
                {navSound ? "Som nos links ativado" : "Som nos links desativado"}
              </span>
            </div>
            {navSound ? (
              <Volume2 className="w-5 h-5 text-[var(--theme-secondary)]" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {enabled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Volume</span>
                <span className="font-semibold text-gray-900">{volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[var(--theme-primary)]"
                style={{
                  background: `linear-gradient(to right, var(--theme-primary) 0%, var(--theme-secondary) ${volume}%, #e5e7eb ${volume}%, #e5e7eb 100%)`,
                }}
              />
            </div>
          )}
        </div>

        {/* Sound selector */}
        {enabled && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Escolha o seu som:</h3>
              <Button 
                onClick={testAudio}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Testar Áudio
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {SOUND_LIST.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => {
                    setSelectedSound(sound.id)
                    handlePreview(sound.id)
                  }}
                  className={`relative rounded-2xl p-4 text-center transition-all duration-300 btn-3d ${
                    selectedSound === sound.id
                      ? "ring-2 ring-[var(--theme-primary)] ring-offset-2 bg-[var(--theme-primary)]/5"
                      : "bg-white border border-gray-200/80 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center transition-all ${
                    selectedSound === sound.id
                      ? "bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white shadow-lg"
                      : "bg-gray-100 text-gray-500"
                  } ${previewSound === sound.id ? "scale-110" : ""}`}>
                    <Play className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{sound.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sound.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={!userId}
          className="px-6 py-2 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:from-[var(--theme-primary)]/90 hover:to-[var(--theme-secondary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saved ? (
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Salvo!</span>
            </div>
          ) : (
            "Salvar Configurações"
          )}
        </Button>
      </div>
    </div>
  )
}