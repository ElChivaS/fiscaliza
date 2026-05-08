"use client"

import Link from "next/link"
import type { VehicleWithDocuments } from "@/types/document.types"
import { DOCUMENT_TYPE_ORDER, DOCUMENT_TYPE_SHORT } from "@/types/document.types"
import { worstStatus, STATUS_COLOR, STATUS_LABEL } from "@/lib/utils/document.utils"
import { formatPlate } from "@/lib/utils/plate.utils"

interface VehicleCardProps {
  vehicle: VehicleWithDocuments
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const docsByType = Object.fromEntries(
    vehicle.documents.map((d) => [d.type, d])
  )

  const statuses = DOCUMENT_TYPE_ORDER.map((t) =>
    docsByType[t]?.expiryStatus ?? "unknown"
  )
  const worst = worstStatus(statuses)
  const worstColor = STATUS_COLOR[worst]

  const subtitle = [vehicle.brand, vehicle.model, vehicle.year]
    .filter(Boolean)
    .join(" ")

  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="block rounded-[20px] bg-surface border border-black/8 overflow-hidden
                 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
    >
      {/* Strip de color según peor estado */}
      <div className="h-1" style={{ backgroundColor: worstColor }} />

      <div className="p-5">
        {/* Patente + alias */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className="font-syne font-bold text-2xl text-ink tracking-wide"
              style={{ letterSpacing: "0.06em" }}
            >
              {formatPlate(vehicle.plate)}
            </p>
            <p className="text-sm text-muted mt-0.5">{vehicle.alias}</p>
            {subtitle && (
              <p className="text-xs text-muted/70 mt-0.5">{subtitle}</p>
            )}
          </div>

          {/* Badge peor estado */}
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
            style={{
              backgroundColor: worstColor + "20",
              color: worstColor,
            }}
          >
            {STATUS_LABEL[worst]}
          </span>
        </div>

        {/* Grid 2x2 de doc pills */}
        <div className="grid grid-cols-2 gap-2">
          {DOCUMENT_TYPE_ORDER.map((type) => {
            const doc = docsByType[type]
            const st  = doc?.expiryStatus ?? "unknown"
            const col = STATUS_COLOR[st]

            return (
              <div
                key={type}
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ backgroundColor: col + "12" }}
              >
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: col }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink truncate">
                    {DOCUMENT_TYPE_SHORT[type]}
                  </p>
                  {doc?.daysUntilExpiry !== null && doc?.daysUntilExpiry !== undefined && (
                    <p className="text-[10px]" style={{ color: col }}>
                      {doc.daysUntilExpiry < 0
                        ? "Vencido"
                        : `${doc.daysUntilExpiry}d`}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5">
          <span className="text-xs text-muted">Ver documentos</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
