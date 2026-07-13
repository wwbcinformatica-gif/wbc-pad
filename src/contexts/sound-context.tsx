"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { playSound, playPreviewSound, type SoundId } from "@/lib/sounds"
import { createClient } from "@/lib/supabase"

interface SoundContextType {
  enabled: boolean
  volume: number
  selectedSound: SoundId
  navSound: boolean
  setEnabled: (v: boolean) => void
  setVolume: (v: number) => void
  setSelectedSound: (s: SoundId) => void
  setNavSound: (v: boolean) => void
  play: () => void
  playPreview: (s: SoundId) => void
  saveToDatabase: (userId: string) => Promise<void>
  loadFromDatabase: (userId: string) => Promise<void>
}

const SoundContext = createContext<SoundContextType>({
  enabled: false,
  volume: 70,
  selectedSound: "seco",
  navSound: false,
  setEnabled: () => {},
  setVolume: () => {},
  setSelectedSound: () => {},
  setNavSound: () => {},
  play: () => {},
  playPreview: () => {},
  saveToDatabase: async () => {},
  loadFromDatabase: async () => {},
})

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(false)
  const [volume, setVolumeState] = useState(70)
  const [selectedSound, setSelectedSoundState] = useState<SoundId>("seco")
  const [navSound, setNavSoundState] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const e = localStorage.getItem("wbc-sound-enabled")
    const v = localStorage.getItem("wbc-sound-volume")
    const s = localStorage.getItem("wbc-sound-selected")
    const n = localStorage.getItem("wbc-nav-sound")
    if (e !== null) setEnabledState(e === "true")
    if (v !== null) setVolumeState(Number(v))
    if (s !== null) setSelectedSoundState(s as SoundId)
    if (n !== null) setNavSoundState(n === "true")
  }, [])

  const saveToDatabase = useCallback(async (userId: string): Promise<void> => {
    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }
      
      console.log('Attempting to save sound settings for user:', userId)
      console.log('Sound settings:', { enabled, volume, selectedSound, navSound })
      
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          sound_enabled: enabled,
          sound_volume: volume,
          sound_type: selectedSound,
          nav_sound: navSound,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
      
      if (error) {
        console.error('Supabase upsert error:', error)
        throw new Error(`Database error: ${error.message}`)
      }
      
      console.log('Sound settings saved successfully:', data)
    } catch (error: any) {
      console.error('Error saving sound settings:', error)
      throw error
    }
  }, [enabled, volume, selectedSound, navSound])

  const loadFromDatabase = useCallback(async (userId: string) => {
    try {
      const supabase = createClient()
      if (!supabase) return
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('sound_enabled, sound_volume, sound_type, nav_sound')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setEnabledState(data.sound_enabled ?? false)
        setVolumeState(data.sound_volume ?? 70)
        setSelectedSoundState(data.sound_type ?? "seco")
        setNavSoundState(data.nav_sound ?? false)
      }
    } catch (error) {
      console.error('Error loading sound settings:', error)
    }
  }, [])

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v)
    localStorage.setItem("wbc-sound-enabled", String(v))
  }, [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    localStorage.setItem("wbc-sound-volume", String(v))
  }, [])

  const setSelectedSound = useCallback((s: SoundId) => {
    setSelectedSoundState(s)
    localStorage.setItem("wbc-sound-selected", s)
  }, [])

  const setNavSound = useCallback((v: boolean) => {
    setNavSoundState(v)
    localStorage.setItem("wbc-nav-sound", String(v))
  }, [])

  const play = useCallback(() => {
    if (!enabled) return
    playSound(selectedSound, volume)
  }, [enabled, selectedSound, volume])

  const playPreview = useCallback((s: SoundId) => {
    if (!enabled) return
    playPreviewSound(s, volume)
  }, [enabled, volume])

  return (
    <SoundContext.Provider value={{ enabled, volume, selectedSound, navSound, setEnabled, setVolume, setSelectedSound, setNavSound, play, playPreview, saveToDatabase, loadFromDatabase }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  return useContext(SoundContext)
}
