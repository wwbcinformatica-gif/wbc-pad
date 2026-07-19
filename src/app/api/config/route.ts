import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

const CONFIG_TITLE = "⚙️ Config Globais"

export async function GET() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("notes")
    .select("content")
    .eq("title", CONFIG_TITLE)
    .eq("type", "note")
    .single()

  if (data?.content) {
    try {
      return NextResponse.json(JSON.parse(data.content))
    } catch {
      return NextResponse.json({ trial_days: 7 })
    }
  }
  return NextResponse.json({ trial_days: 7 })
}

export async function POST(request: Request) {
  const supabase = createAdminClient()
  const body = await request.json()
  const config = { trial_days: body.trial_days ?? 7 }

  const { data: existing } = await supabase
    .from("notes")
    .select("id")
    .eq("title", CONFIG_TITLE)
    .eq("type", "note")
    .single()

  const payload = {
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
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || "00000000-0000-0000-0000-000000000000"
  const { error } = await supabase
    .from("notes")
    .insert({ ...payload, user_id: userId })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
