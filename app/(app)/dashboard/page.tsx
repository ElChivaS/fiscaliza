"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useVehiclesStore } from "@/stores/vehiclesStore"
import { useOrganization } from "@/hooks/useOrganization"
import VehicleList from "@/components/vehicle/VehicleList"
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton"

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}

export default function DashboardPage() {
  const { profile, organization } = useOrganization()
  const { vehicles, fetchVehiclesWithDocuments } = useVehiclesStore()

  useEffect(() => {
    fetchVehiclesWithDocuments()
  }, [fetchVehiclesWithDocuments])

  const firstName = profile?.full_name?.split(" ")[0] ?? "Usuario"

  if (!profile) {
    return <DashboardSkeleton />
  }

  // Vehículos con documentos por vencer (≤30 días)
  const alertVehicles = vehicles.filter((v) =>
    v.documents.some((d) => d.expiryStatus === "expiring_soon" || d.expiryStatus === "expired")
  )

  const isPro  = organization?.plan === "pro" || organization?.plan === "business"

  return (
    <div className="max-w-md mx-auto px-4">
      {/* Header */}
      <header className="pt-12 pb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{getGreeting()},</p>
          <h1 className="font-syne font-bold text-2xl text-ink">{firstName}</h1>
        </div>
        <Link
          href="/account"
          className="size-11 rounded-full bg-surface border border-black/10 flex items-center justify-center text-ink font-syne font-bold text-sm hover:bg-black/5 transition-colors overflow-hidden"
        >
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={firstName}
              width={44}
              height={44}
              className="size-11 rounded-full object-cover"
            />
          ) : (
            firstName[0]?.toUpperCase()
          )}
        </Link>
      </header>

      {/* Banner de alertas */}
      {alertVehicles.length > 0 && (
        <div className="mb-4 rounded-2xl bg-expiring/10 border border-expiring/30 p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm font-medium text-ink">
              {alertVehicles.length === 1
                ? "1 vehículo con documentos por vencer"
                : `${alertVehicles.length} vehículos con documentos por vencer`}
            </p>
            <p className="text-xs text-muted mt-0.5">
              Revisa y actualiza antes de que venzan.
            </p>
          </div>
        </div>
      )}

      {/* Lista */}
      <VehicleList vehicles={vehicles} />

      {/* Strip de plan */}
      {!isPro && (
        <div className="mt-8 rounded-2xl bg-ink p-5 flex items-center justify-between">
          <div>
            <p className="font-syne font-bold text-white text-sm">Plan Free</p>
            <p className="text-white/60 text-xs mt-0.5">
              1 vehículo · Sin alertas
            </p>
          </div>
          <Link
            href="/account"
            className="text-xs font-medium bg-white text-ink px-4 py-2 rounded-xl hover:bg-white/90 transition-colors shrink-0"
          >
            Mejorar plan
          </Link>
        </div>
      )}
    </div>
  )
}
