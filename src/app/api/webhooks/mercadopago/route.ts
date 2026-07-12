import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import {
  getPreapproval,
  getPayment,
  getAuthorizedPayment,
  verifySignature,
} from "@/lib/mercadopago"

async function updateSubscription(
  externalRef: string,
  status: string
) {
  const client = createAdminClient()
  const now = new Date().toISOString()
  const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const updates: Record<string, string> = {
    subscription_status: status,
    updated_at: now,
  }

  if (status === "active" || status === "trial") {
    updates.subscription_ends_at = endsAt
  }

  await client.from("profiles").update(updates).eq("id", externalRef)
}

export async function POST(request: Request) {
  try {
    const xSignature = request.headers.get("x-signature") || ""
    const xRequestId = request.headers.get("x-request-id") || ""
    const url = new URL(request.url)
    const dataId = url.searchParams.get("data.id") || ""

    const secret = process.env.MP_WEBHOOK_SECRET
    if (secret) {
      const valid = verifySignature({ xSignature, xRequestId, dataId, secret })
      if (!valid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const body = await request.json()
    const type = body.type || body.topic
    const resourceId = body.data?.id || body.id

    if (!resourceId) {
      return NextResponse.json({ received: true })
    }

    switch (type) {
      case "subscription_preapproval": {
        const preapproval = await getPreapproval(resourceId)
        const externalRef = preapproval.external_reference
        const mpStatus = preapproval.status

        if (externalRef) {
          const statusMap: Record<string, string> = {
            authorized: "active",
            pending: "trial",
            cancelled: "canceled",
          }
          await updateSubscription(externalRef, statusMap[mpStatus] || mpStatus)
        }
        break
      }

      case "subscription_authorized_payment": {
        const authPay = await getAuthorizedPayment(resourceId)
        const preapprovalId = authPay.preapproval_id
        if (preapprovalId) {
          const preapproval = await getPreapproval(preapprovalId)
          const externalRef = preapproval.external_reference
          if (externalRef && authPay.status === "approved") {
            await updateSubscription(externalRef, "active")
          }
        }
        break
      }

      case "payment": {
        const payment = await getPayment(resourceId)
        const externalRef = payment.external_reference

        if (externalRef) {
          if (payment.status === "approved") {
            await updateSubscription(externalRef, "active")
          } else if (["cancelled", "refunded"].includes(payment.status)) {
            await updateSubscription(externalRef, "canceled")
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
