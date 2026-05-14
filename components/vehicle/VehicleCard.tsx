"use client"

import Link from "next/link"
import type { VehicleWithDocuments } from "@/types/document.types"
import { DOCUMENT_TYPE_ORDER, DOCUMENT_TYPE_SHORT } from "@/types/document.types"
import { worstStatus, STATUS_COLOR, STATUS_LABEL } from "@/lib/utils/document.utils"
import { formatPlate } from "@/lib/utils/plate.utils"
import BodySilhouette from "./BodySilhouette"
import type { BodyType } from "@/lib/data/vehicles"

interface VehicleCardProps {
  vehicle: VehicleWithDocuments
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const docsByType = Object.fromEntries(
    vehicle.documents.map((d) => [d.type, d])
  )

  const statuses  = DOCUMENT_TYPE_ORDER.map((t) => docsByType[t]?.expiryStatus ?? "unknown")
  const worst     = worstStatus(statuses)
  const worstColor = STATUS_COLOR[worst]

  const subtitle = [vehicle.brand, vehicle.model, vehicle.year]
    .filter(Boolean)
    .join(" ")

  const bodyType = (vehicle.body_type as BodyType | null) ?? "sedan"

  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="block rounded-[20px] bg-surface border border-black/8 overflow-hidden
                 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
    >
      {/* Strip de color */}
      <div className="h-1" style={{ backgroundColor: worstColor }} />

      <div className="relative p-5 overflow-hidden">
        {/* Fila superior: patente + círculo con silueta */}
        <div className="flex items-start justify-between mb-1">
          <p
            className="font-syne font-bold text-2xl text-ink tracking-wide"
            style={{ letterSpacing: "0.06em" }}
          >
            {formatPlate(vehicle.plate)}
          </p>

          {/* Círculo con silueta + badge debajo */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div
              className="size-12 rounded-full flex items-center justify-center p-2"
              style={{ backgroundColor: worstColor + "18" }}
            >
              <div className="w-full h-full" style={{ color: worstColor }}>
                <BodySilhouette type={bodyType} />
              </div>
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: worstColor + "20",
                color: worstColor,
              }}
            >
              {STATUS_LABEL[worst]}
            </span>
          </div>
        </div>

        {/* Alias + subtítulo */}
        <div className="mb-4">
          <p className="text-sm text-muted">{vehicle.alias}</p>
          {subtitle && (
            <p className="text-xs text-muted/70 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Grid 2x2 de doc pills o mensaje vacío */}
        {vehicle.documents.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl px-3 py-3 bg-black/4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888580" strokeWidth="2" strokeLinecap="round">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <path d="M13 2v7h7" />
            </svg>
            <p className="text-xs text-muted">Sin documentos cargados</p>
          </div>
        ) : (
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
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5 ">
          <span className="text-xs text-muted">Ver documentos</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
