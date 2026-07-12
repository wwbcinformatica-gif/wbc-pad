"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Crown, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function SubscriptionPage() {
  const [status, setStatus] = useState("")
  const [trialEnds, setTrialEnds] = useState("")
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadSubscription()
  }, [])

  async function loadSubscription() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    const { data } = await supabase
      .from("profiles")
      .select("subscription_status, trial_ends_at, subscription_ends_at")
      .eq("id", user.id)
      .single()

    if (data) {
      setStatus(data.subscription_status)
      setTrialEnds(data.trial_ends_at)
    }
    setLoading(false)
  }

  async function handleSubscribe() {
    setSubscribing(true)
    try {
      const res = await fetch("/api/mercadopago/create-subscription", {
        method: "POST",
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erro ao criar assinatura")
        return
      }

      if (data.init_point) {
        window.location.href = data.init_point
      }
    } catch {
      alert("Erro de conexão. Tente novamente.")
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Assinatura</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-secondary)]/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-[var(--theme-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Plano Premium</h2>
              <p className="text-sm text-gray-500">WBC NotePad</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Status</span>
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                status === "active"
                  ? "bg-green-100 text-green-700"
                  : status === "trial"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {status === "active"
                ? "Ativo"
                : status === "trial"
                ? "Período de Teste"
                : "Expirado"}
            </span>
          </div>

          {status === "trial" && trialEnds && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-700">
                Seu período de teste termina em{" "}
                <strong>{new Date(trialEnds).toLocaleDateString("pt-BR")}</strong>
              </p>
            </div>
          )}

          {status === "active" && (
            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">Sua assinatura está ativa</p>
            </div>
          )}

          <div className="pt-4 space-y-3">
            <Button
              className="w-full"
              disabled={status === "active" || subscribing}
              onClick={handleSubscribe}
            >
              {subscribing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aguarde...
                </>
              ) : status === "active" ? (
                "Assinatura Ativa"
              ) : (
                "Assinar Agora — R$ 19,90/mês"
              )}
            </Button>
            <p className="text-xs text-center text-gray-500">
              Pagamento via Mercado Pago. Renovação mensal automática. Cancele quando quiser.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
