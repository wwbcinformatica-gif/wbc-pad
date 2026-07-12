import crypto from "crypto"

const MP_API = "https://api.mercadopago.com"

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN!}`,
    "Content-Type": "application/json",
  }
}

export async function createSubscriptionPreapproval(params: {
  email: string
  externalReference: string
  backUrl: string
}) {
  const body = {
    reason: "WBC NotePad Premium",
    external_reference: params.externalReference,
    payer_email: params.email,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: 19.9,
      currency_id: "BRL",
    },
    back_url: params.backUrl,
    status: "pending",
  }

  const res = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`MP preapproval error ${res.status}: ${err}`)
  }

  return res.json()
}

export async function getPreapproval(id: string) {
  const res = await fetch(`${MP_API}/preapproval/${id}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`MP getPreapproval error ${res.status}`)
  return res.json()
}

export async function getPayment(id: string) {
  const res = await fetch(`${MP_API}/v1/payments/${id}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`MP getPayment error ${res.status}`)
  return res.json()
}

export async function cancelPreapproval(id: string) {
  const res = await fetch(`${MP_API}/preapproval/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ status: "cancelled" }),
  })
  if (!res.ok) throw new Error(`MP cancelPreapproval error ${res.status}`)
  return res.json()
}

export async function getAuthorizedPayment(id: string) {
  const res = await fetch(`${MP_API}/authorized_payments/${id}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`MP getAuthorizedPayment error ${res.status}`)
  return res.json()
}

export function verifySignature(params: {
  xSignature: string
  xRequestId: string
  dataId: string
  secret: string
}): boolean {
  const parts = params.xSignature.split(",")
  let ts = ""
  let hash = ""

  for (const part of parts) {
    const [key, value] = part.split("=")
    if (key?.trim() === "ts") ts = value?.trim() ?? ""
    if (key?.trim() === "v1") hash = value?.trim() ?? ""
  }

  const manifest = `id:${params.dataId};request-id:${params.xRequestId};ts:${ts};`

  const computed = crypto
    .createHmac("sha256", params.secret)
    .update(manifest)
    .digest("hex")

  return computed === hash
}
