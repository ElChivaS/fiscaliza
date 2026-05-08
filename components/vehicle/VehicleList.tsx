"use client"

import VehicleCard from "./VehicleCard"
import type { VehicleWithDocuments } from "@/types/document.types"
import Link from "next/link"

interface VehicleListProps {
  vehicles: VehicleWithDocuments[]
}

export default function VehicleList({ vehicles }: VehicleListProps) {
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="size-20 rounded-3xl bg-black/5 flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#888580" strokeWidth="1.5" strokeLinecap="round">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h6l2 4v4h-8V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <p className="font-syne font-bold text-lg text-ink mb-2">
          Sin vehículos aún
        </p>
        <p className="text-sm text-muted mb-6">
          Agrega tu primer vehículo para guardar tus documentos.
        </p>
        <Link
          href="/vehicles/new"
          className="inline-flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-2xl text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          + Agregar vehículo
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {vehicles.map((v) => (
        <VehicleCard key={v.id} vehicle={v} />
      ))}
    </div>
  )
}
