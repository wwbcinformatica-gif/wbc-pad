"use client"

export type SoundId =
  | "grave" | "agudo" | "seco" | "violoncelo"
  | "piano" | "guitarra" | "tambor" | "flauta"
  | "metal" | "digital"
  | "bubble" | "tap" | "crisp" | "thud"

export const SOUND_LIST: { id: SoundId; label: string; description: string }[] = [
  { id: "grave", label: "Grave", description: "Tum profundo" },
  { id: "agudo", label: "Agudo", description: "Pip agudo" },
  { id: "seco", label: "Seco", description: "Clique seco curto" },
  { id: "violoncelo", label: "Violoncelo", description: "Tom encorpado" },
  { id: "piano", label: "Piano", description: "Nota suave" },
  { id: "guitarra", label: "Guitarra", description: "R dedilhado" },
  { id: "tambor", label: "Tambor", description: "Batida grave" },
  { id: "flauta", label: "Flauta", description: "Soprado doce" },
  { id: "metal", label: "Metal", description: "Timbre metálico" },
  { id: "digital", label: "Digital", description: "Beep moderno" },
  { id: "bubble", label: "Bolha", description: "Pop suave" },
  { id: "tap", label: "Toque", description: "Tap leve" },
  { id: "crisp", label: "Crisp", description: "Clique nítido" },
  { id: "thud", label: "Thud", description: "Batida surda" },
]

export const SOUND_PRESETS: { [key in SoundId]: { frequencies: number[]; types: OscillatorType[]; durations: number[]; gains: number[] } } = {
  grave: {
    frequencies: [80, 100, 120],
    types: ["sine", "triangle", "sine"],
    durations: [0.15, 0.12, 0.1],
    gains: [0.8, 0.6, 0.4]
  },
  agudo: {
    frequencies: [1000, 1400, 1800],
    types: ["sine", "square", "triangle"],
    durations: [0.08, 0.06, 0.04],
    gains: [0.5, 0.4, 0.2]
  },
  seco: {
    frequencies: [400, 600, 800],
    types: ["square", "square", "square"],
    durations: [0.03, 0.025, 0.02],
    gains: [0.7, 0.5, 0.3]
  },
  violoncelo: {
    frequencies: [110, 165, 220],
    types: ["sawtooth", "triangle", "sine"],
    durations: [0.2, 0.15, 0.1],
    gains: [0.6, 0.4, 0.2]
  },
  piano: {
    frequencies: [261, 329, 392],
    types: ["triangle", "sine", "sine"],
    durations: [0.3, 0.25, 0.2],
    gains: [0.5, 0.3, 0.15]
  },
  guitarra: {
    frequencies: [196, 246, 293],
    types: ["sawtooth", "triangle", "square"],
    durations: [0.15, 0.12, 0.08],
    gains: [0.6, 0.4, 0.2]
  },
  tambor: {
    frequencies: [60, 100, 150],
    types: ["sine", "sawtooth", "square"],
    durations: [0.12, 0.08, 0.05],
    gains: [0.8, 0.5, 0.3]
  },
  flauta: {
    frequencies: [392, 493, 587],
    types: ["sine", "sine", "triangle"],
    durations: [0.25, 0.2, 0.15],
    gains: [0.5, 0.3, 0.15]
  },
  metal: {
    frequencies: [800, 1200, 1600],
    types: ["square", "square", "sawtooth"],
    durations: [0.08, 0.06, 0.04],
    gains: [0.6, 0.4, 0.2]
  },
  digital: {
    frequencies: [600, 900, 1200],
    types: ["square", "square", "triangle"],
    durations: [0.06, 0.04, 0.03],
    gains: [0.5, 0.3, 0.15]
  },
  bubble: {
    frequencies: [500, 700, 900],
    types: ["sine", "triangle", "sine"],
    durations: [0.08, 0.06, 0.05],
    gains: [0.6, 0.4, 0.2]
  },
  tap: {
    frequencies: [250, 350, 450],
    types: ["triangle", "sine", "sine"],
    durations: [0.04, 0.03, 0.02],
    gains: [0.7, 0.5, 0.3]
  },
  crisp: {
    frequencies: [800, 1200, 1500],
    types: ["square", "square", "triangle"],
    durations: [0.02, 0.015, 0.01],
    gains: [0.9, 0.6, 0.4]
  },
  thud: {
    frequencies: [60, 40, 80],
    types: ["sine", "sine", "triangle"],
    durations: [0.12, 0.08, 0.06],
    gains: [1.0, 0.7, 0.5]
  }
}

// Novos sons específicos para botões - mais graves e satisfatórios
export const BUTTON_SOUNDS: { [key in SoundId]: { frequencies: number[]; types: OscillatorType[]; durations: number[]; gains: number[] } } = {
  grave: {
    frequencies: [60, 80, 100],
    types: ["sine", "triangle", "sine"],
    durations: [0.08, 0.06, 0.04],
    gains: [0.9, 0.7, 0.5]
  },
  agudo: {
    frequencies: [800, 1000, 1200],
    types: ["sine", "square", "triangle"],
    durations: [0.05, 0.04, 0.03],
    gains: [0.6, 0.4, 0.2]
  },
  seco: {
    frequencies: [300, 400, 500],
    types: ["square", "square", "square"],
    durations: [0.02, 0.015, 0.01],
    gains: [0.8, 0.6, 0.4]
  },
  violoncelo: {
    frequencies: [80, 120, 160],
    types: ["sawtooth", "triangle", "sine"],
    durations: [0.1, 0.08, 0.05],
    gains: [0.7, 0.5, 0.3]
  },
  piano: {
    frequencies: [200, 250, 300],
    types: ["triangle", "sine", "sine"],
    durations: [0.15, 0.12, 0.08],
    gains: [0.6, 0.4, 0.2]
  },
  guitarra: {
    frequencies: [150, 200, 250],
    types: ["sawtooth", "triangle", "square"],
    durations: [0.08, 0.06, 0.04],
    gains: [0.7, 0.5, 0.3]
  },
  tambor: {
    frequencies: [40, 80, 120],
    types: ["sine", "sawtooth", "square"],
    durations: [0.06, 0.04, 0.02],
    gains: [1.0, 0.7, 0.4]
  },
  flauta: {
    frequencies: [300, 400, 500],
    types: ["sine", "sine", "triangle"],
    durations: [0.12, 0.08, 0.05],
    gains: [0.6, 0.4, 0.2]
  },
  metal: {
    frequencies: [400, 600, 800],
    types: ["square", "square", "sawtooth"],
    durations: [0.05, 0.04, 0.03],
    gains: [0.7, 0.5, 0.3]
  },
  digital: {
    frequencies: [300, 500, 700],
    types: ["square", "square", "triangle"],
    durations: [0.04, 0.03, 0.02],
    gains: [0.6, 0.4, 0.2]
  },
  bubble: {
    frequencies: [400, 600, 800],
    types: ["sine", "triangle", "sine"],
    durations: [0.05, 0.04, 0.03],
    gains: [0.7, 0.5, 0.3]
  },
  tap: {
    frequencies: [200, 300, 400],
    types: ["triangle", "sine", "sine"],
    durations: [0.03, 0.02, 0.015],
    gains: [0.8, 0.5, 0.3]
  },
  crisp: {
    frequencies: [600, 900, 1200],
    types: ["square", "square", "triangle"],
    durations: [0.015, 0.01, 0.008],
    gains: [1.0, 0.7, 0.5]
  },
  thud: {
    frequencies: [50, 30, 60],
    types: ["sine", "sine", "triangle"],
    durations: [0.08, 0.06, 0.04],
    gains: [1.0, 0.8, 0.5]
  }
}

let audioCtx: AudioContext | null = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioCtx
}

function initializeAudio() {
  if (typeof window !== 'undefined') {
    getAudioContext()
  }
}

// Initialize audio on module load
initializeAudio()

function playTone(
  frequency: number,
  type: OscillatorType,
  duration: number,
  gain: number,
  delay = 0,
  detune = 0,
  ramp?: "sine" | "exp"
) {
  const ctx = getAudioContext()
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay)
  osc.detune.setValueAtTime(detune, ctx.currentTime + delay)
  gainNode.gain.setValueAtTime(gain * 0.3, ctx.currentTime + delay)
  if (ramp === "exp") {
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
  } else {
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration)
  }
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.start(ctx.currentTime + delay)
  osc.stop(ctx.currentTime + delay + duration)
}

export function playSound(id: SoundId, volume: number, isPreview = false) {
  try {
    const v = volume / 100
    const ctx = getAudioContext()
    
    if (!ctx) {
      console.error('Audio context not available')
      return
    }
    
    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    
    const preset = isPreview ? BUTTON_SOUNDS[id] : SOUND_PRESETS[id]
    
    if (!preset) {
      console.error('Sound preset not found for:', id)
      return
    }
    
    preset.frequencies.forEach((freq, index) => {
      playTone(
        freq,
        preset.types[index],
        preset.durations[index],
        preset.gains[index] * v,
        index * 0.01,
        0,
        "exp"
      )
    })
  } catch (error) {
    console.error('Error playing sound:', error)
  }
}

export function playPreviewSound(id: SoundId, volume: number = 70) {
  try {
    const v = volume / 100
    const ctx = getAudioContext()
    
    if (!ctx) {
      console.error('Audio context not available')
      return
    }
    
    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        playSound(id, v)
      })
    } else {
      playSound(id, v)
    }
  } catch (error) {
    console.error('Error playing preview sound:', error)
  }
}
