import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { createSubscriptionPreapproval } from "@/lib/mercadopago"

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, name, subscription_status")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (profile.subscription_status === "active") {
      return NextResponse.json({ error: "Already active" }, { status: 400 })
    }

    const origin = request.headers.get("origin") || "http://localhost:3000"

    const preapproval = await createSubscriptionPreapproval({
      email: profile.email,
      externalReference: user.id,
      backUrl: `${origin}/dashboard/subscription`,
    })

    await supabase
      .from("profiles")
      .update({ mp_subscription_id: preapproval.id })
      .eq("id", user.id)

    return NextResponse.json({
      init_point: preapproval.init_point,
      id: preapproval.id,
    })
  } catch (error) {
    console.error("Create subscription error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    )
  }
}
