"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { logout, sendResetEmail, auth } from "@/lib/firebase/auth"
import { updateProfile as fbUpdateProfile } from "@/lib/firebase/firestore"
import { useOrganization } from "@/hooks/useOrganization"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { toast } from "@/components/ui/Toast"
import Spinner from "@/components/ui/Spinner"

const PLAN_LABELS: Record<string, string> = {
  free:     "Free",
  pro:      "Pro",
  business: "Business",
}

export default function AccountPage() {
  const router = useRouter()
  const { profile, organization, planLimits, loading } = useOrganization()

  const [editName, setEditName]     = useState(false)
  const [name, setName]             = useState("")
  const [savingName, setSavingName] = useState(false)
  const [showPlans, setShowPlans]   = useState(false)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")

  async function handleSaveName() {
    if (!name.trim()) return
    setSavingName(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error("No autenticado")

      await fbUpdateProfile(user.uid, { full_name: name.trim() })
      toast("Nombre actualizado", "success")
      setEditName(false)
    } catch {
      toast("Error al guardar", "error")
    } finally {
      setSavingName(false)
    }
  }

  async function handleResetPassword() {
    const user = auth.currentUser
    if (!user?.email) return
    try {
      await sendResetEmail(user.email)
      toast("Revisa tu email para cambiar la contraseña", "success")
    } catch {
      toast("Error al enviar el correo", "error")
    }
  }

  async function handleSignOut() {
    await logout()
    router.push("/login")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" className="text-ink" />
      </div>
    )
  }

  const displayName = profile?.full_name ?? "Usuario"

  return (
    <div className="max-w-md mx-auto px-4">
      <PageHeader title="Mi cuenta" />

      {/* Avatar + nombre */}
      <div className="flex flex-col items-center py-8 gap-3">
        <div className="size-20 rounded-full bg-ink flex items-center justify-center text-white font-syne font-bold text-3xl">
          {displayName[0]?.toUpperCase()}
        </div>

        {editName ? (
          <div className="flex items-center gap-2 w-full max-w-xs">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 h-10 rounded-xl border border-black/10 bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
              placeholder="Tu nombre"
            />
            <Button size="sm" loading={savingName} onClick={handleSaveName}>
              Guardar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditName(false)}>
              ✕
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-syne font-bold text-xl text-ink">{displayName}</p>
            <button
              onClick={() => { setName(displayName); setEditName(true) }}
              className="text-xs text-muted underline underline-offset-2 mt-1 hover:text-ink transition-colors"
            >
              Editar nombre
            </button>
          </div>
        )}
      </div>

      {/* Plan card */}
      <div className="rounded-2xl bg-ink p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs mb-1">Tu plan actual</p>
            <p className="font-syne font-bold text-white text-xl">
              {PLAN_LABELS[organization?.plan ?? "free"]}
            </p>
            {planLimits && (
              <p className="text-white/50 text-xs mt-1">
                {planLimits.max_vehicles === -1
                  ? "Vehículos ilimitados"
                  : `${planLimits.max_vehicles} vehículo${planLimits.max_vehicles !== 1 ? "s" : ""}`}
                {" · "}
                {planLimits.expiry_alerts ? "Alertas activas" : "Sin alertas"}
              </p>
            )}
          </div>
          {organization?.plan === "free" && (
            <button
              onClick={() => setShowPlans(true)}
              className="text-xs font-medium bg-white text-ink px-4 py-2 rounded-xl hover:bg-white/90 transition-colors"
            >
              Mejorar
            </button>
          )}
        </div>
      </div>

      {/* Menú */}
      <div className="flex flex-col gap-1 rounded-2xl bg-surface border border-black/8 overflow-hidden mb-4">
        <MenuItem
          label="Cambiar contraseña"
          icon="🔑"
          onClick={handleResetPassword}
        />
      </div>

      <div className="flex flex-col gap-1 rounded-2xl bg-surface border border-black/8 overflow-hidden">
        <MenuItem
          label="Cerrar sesión"
          icon="↩️"
          danger
          onClick={handleSignOut}
        />
      </div>

      {/* App info */}
      <p className="text-center text-xs text-muted mt-8">
        FISCALIZA v0.1.0 · Ley 21.302 Chile
      </p>

      {/* Modal de planes */}
      <Modal
        open={showPlans}
        onClose={() => setShowPlans(false)}
        title="Planes"
        bottomSheet
      >
        {/* Toggle mensual/anual */}
        <div className="flex items-center justify-center bg-black/5 rounded-xl p-1 mb-6">
          {(["monthly", "annual"] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={[
                "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
                billingCycle === cycle ? "bg-surface text-ink shadow-sm" : "text-muted",
              ].join(" ")}
            >
              {cycle === "monthly" ? "Mensual" : "Anual −20%"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {PLANS.map((plan) => {
            const price = billingCycle === "annual" ? plan.annual : plan.monthly
            const isCurrent = organization?.plan === plan.id

            return (
              <div
                key={plan.id}
                className={[
                  "rounded-2xl border p-4",
                  isCurrent ? "border-valid bg-valid/5" : "border-black/10 bg-surface",
                ].join(" ")}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-syne font-bold text-ink">{plan.name}</p>
                  {isCurrent && (
                    <span className="text-xs font-medium text-valid bg-valid/10 px-2 py-0.5 rounded-full">
                      Actual
                    </span>
                  )}
                </div>
                <p className="font-syne font-bold text-2xl text-ink">
                  {price === 0 ? "Gratis" : `$${price.toLocaleString("es-CL")} CLP`}
                  {price > 0 && <span className="text-sm text-muted font-normal">/mes</span>}
                </p>
                <ul className="mt-3 flex flex-col gap-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-muted flex items-center gap-1.5">
                      <span className="text-valid">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && plan.id !== "free" && (
                  <Button fullWidth className="mt-4" size="sm">
                    Elegir {plan.name}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}

function MenuItem({
  label,
  icon,
  danger = false,
  onClick,
}: {
  label: string
  icon: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-3 px-5 py-4 w-full text-left hover:bg-black/3 transition-colors",
        danger ? "text-expired" : "text-ink",
      ].join(" ")}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-auto text-muted">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    annual: 0,
    features: ["1 vehículo", "1 usuario", "Documentos ilimitados"],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 4990,
    annual: 3990,
    features: ["Vehículos ilimitados", "1 usuario", "Alertas de vencimiento", "QR verificable"],
  },
  {
    id: "business",
    name: "Business",
    monthly: 14990,
    annual: 11990,
    features: ["Vehículos ilimitados", "Hasta 20 usuarios", "Alertas de vencimiento", "Panel de flota", "Reportes"],
  },
]
