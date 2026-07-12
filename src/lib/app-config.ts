import { createClient } from "./supabase"

const CONFIG_TITLE = "⚙️ Config Globais"

export interface AppConfig {
  trial_days: number
}

const defaults: AppConfig = {
  trial_days: 7,
}

export async function getAppConfig(): Promise<AppConfig> {
  const supabase = createClient()
  const { data } = await supabase
    .from("notes")
    .select("content")
    .eq("title", CONFIG_TITLE)
    .eq("type", "note")
    .single()

  if (data?.content) {
    try {
      return { ...defaults, ...JSON.parse(data.content) }
    } catch {
      return defaults
    }
  }
  return defaults
}

export async function saveAppConfig(config: AppConfig): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: existing } = await supabase
    .from("notes")
    .select("id")
    .eq("title", CONFIG_TITLE)
    .eq("type", "note")
    .single()

  const payload = {
    user_id: user.id,
    title: CONFIG_TITLE,
    type: "note",
    content: JSON.stringify(config),
    pinned: false,
    color: "#fef3c7",
    checklist: [],
  }

  if (existing) {
    const { error } = await supabase
      .from("notes")
      .update(payload)
      .eq("id", existing.id)
    return !error
  }

  const { error } = await supabase
    .from("notes")
    .insert(payload)
  return !error
}
