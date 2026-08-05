"use client"

import { useState } from "react"
import Image from "next/image"
import { VEHICLE_BRANDS, getBrandLogoUrl, type VehicleBrand, type VehicleCategory } from "@/lib/data/vehicles"

interface Props {
  value:      string
  category?:  VehicleCategory
  onChange:   (brand: VehicleBrand) => void
  onClear?:   () => void
}

export default function BrandPicker({ value, category, onChange, onClear }: Props) {
  const [search, setSearch] = useState("")
  const [brokenLogos, setBrokenLogos] = useState<Set<string>>(new Set())

  const filtered = VEHICLE_BRANDS.filter((b) => {
    if (category && b.category !== category) return false
    return b.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar marca..."
          className="w-full h-10 border-0 border-b border-black/15 bg-transparent pr-9 text-sm text-ink placeholder:text-placeholder transition-colors duration-150 focus:border-ink focus:outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(""); onClear?.() }}
            aria-label="Borrar búsqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-expired"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9.53 8.47a.75.75 0 0 0-1.06 1.06L10.94 12l-2.47 2.47a.75.75 0 1 0 1.06 1.06L12 13.06l2.47 2.47a.75.75 0 1 0 1.06-1.06L13.06 12l2.47-2.47a.75.75 0 0 0-1.06-1.06L12 10.94 9.53 8.47Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

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
                {logoUrl && !brokenLogos.has(brand.slug) ? (
                  <Image
                    src={logoUrl}
                    alt={brand.name}
                    width={40}
                    height={40}
                    className="object-contain size-9"
                    onError={() => {
                      setBrokenLogos((prev) => new Set(prev).add(brand.slug))
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
