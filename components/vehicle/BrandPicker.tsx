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

// Algunos logos del dataset traen mucho margen transparente alrededor del
// isotipo y se ven chicos con object-contain — se agrandan puntualmente.
const LOGO_SCALE: Record<string, number> = {
  kia:      1.35,
  mg:       1.5,
  peugeot:  1.3,
  jac:      1.45,
  changan:  1.55,
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

      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
        {filtered.map((brand) => {
          const logoUrl = getBrandLogoUrl(brand)
          const isSelected = value === brand.name

          return (
            <button
              key={brand.slug}
              type="button"
              title={brand.name}
              aria-label={brand.name}
              onClick={() => { setSearch(brand.name); onChange(brand) }}
              className={[
                "relative aspect-square overflow-hidden p-1.5 rounded-2xl border transition-all duration-150",
                isSelected
                  ? "border-ink bg-ink/5 shadow-sm"
                  : "border-black/8 bg-surface hover:border-black/20 hover:bg-black/3",
              ].join(" ")}
            >
              {logoUrl && !brokenLogos.has(brand.slug) ? (
                <Image
                  src={logoUrl}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 448px) 33vw, 140px"
                  className="object-contain p-2"
                  style={LOGO_SCALE[brand.slug] ? { transform: `scale(${LOGO_SCALE[brand.slug]})` } : undefined}
                  onError={() => {
                    setBrokenLogos((prev) => new Set(prev).add(brand.slug))
                  }}
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center px-1 text-center text-sm font-semibold font-syne leading-tight text-ink">
                  {brand.name}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
