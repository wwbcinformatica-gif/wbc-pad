import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: "userId obrigatório" }, { status: 400 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 })
  }

  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
