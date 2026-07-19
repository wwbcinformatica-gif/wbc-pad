export interface AppConfig {
  trial_days: number
}

const defaults: AppConfig = {
  trial_days: 7,
}

export async function getAppConfig(): Promise<AppConfig> {
  try {
    const res = await fetch("/api/config")
    if (res.ok) {
      const data = await res.json()
      return { ...defaults, ...data }
    }
  } catch {}
  return defaults
}

export async function saveAppConfig(config: AppConfig): Promise<boolean> {
  try {
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })
    return res.ok
  } catch {
    return false
  }
}
