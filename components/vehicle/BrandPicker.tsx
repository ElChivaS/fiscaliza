"use client"

import { useState } from "react"
import Image from "next/image"
import { VEHICLE_BRANDS, getBrandLogoUrl, type VehicleBrand, type VehicleCategory } from "@/lib/data/vehicles"

interface Props {
  value:      string
  category?:  VehicleCategory
  onChange:   (brand: VehicleBrand) => void
}

export default function BrandPicker({ value, category, onChange }: Props) {
  const [search, setSearch] = useState("")

  const filtered = VEHICLE_BRANDS.filter((b) => {
    if (category && b.category !== category) return false
    return b.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col gap-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar marca..."
        className="w-full h-10 rounded-xl border border-black/10 bg-surface px-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
      />

      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
        {filtered.map((brand) => {
          const logoUrl = getBrandLogoUrl(brand)
          const isSelected = value === brand.name

          return (
            <button
              key={brand.slug}
              type="button"
              onClick={() => { setSearch(brand.name); onChange(brand) }}
              className={[
                "flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all duration-150",
                isSelected
                  ? "border-ink bg-ink/5 shadow-sm"
                  : "border-black/8 bg-surface hover:border-black/20 hover:bg-black/3",
              ].join(" ")}
            >
              {/* Logo o badge */}
              <div className="size-10 flex items-center justify-center">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={brand.name}
                    width={40}
                    height={40}
                    className="object-contain size-9"
                    onError={(e) => {
                      // Fallback si no carga
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<span class="size-10 rounded-xl bg-black/8 flex items-center justify-center text-sm font-bold font-syne text-ink">${brand.name[0]}</span>`
                      }
                    }}
                  />
                ) : (
                  <span className="size-10 rounded-xl bg-black/8 flex items-center justify-center text-sm font-bold font-syne text-ink">
                    {brand.name[0]}
                  </span>
                )}
              </div>

              <span className={[
                "text-[10px] font-medium text-center leading-tight",
                isSelected ? "text-ink" : "text-muted",
              ].join(" ")}>
                {brand.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
