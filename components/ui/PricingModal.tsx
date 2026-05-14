"use client"

import { useState } from "react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"

// ─── Datos de planes ──────────────────────────────────────────────────────────

export const PLANS = [
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

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  open:         boolean
  onClose:      () => void
  currentPlan?: string
}

export default function PricingModal({ open, onClose, currentPlan }: Props) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")

  return (
    <Modal open={open} onClose={onClose} title="Planes" bottomSheet>
      {/* Toggle mensual / anual */}
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
          const price     = billingCycle === "annual" ? plan.annual : plan.monthly
          const isCurrent = currentPlan === plan.id

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
  )
}
