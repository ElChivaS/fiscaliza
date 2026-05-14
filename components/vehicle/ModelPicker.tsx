"use client"

import BodySilhouette from "./BodySilhouette"
import { BODY_TYPE_LABELS, type VehicleBrand, type VehicleModel } from "@/lib/data/vehicles"

interface Props {
  brand:    VehicleBrand
  value:    string
  onChange: (model: VehicleModel) => void
}

export default function ModelPicker({ brand, value, onChange }: Props) {
  if (brand.models.length === 0) {
    return (
      <p className="text-xs text-muted py-2">
        Ingresa el modelo manualmente en el campo de texto.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
      {brand.models.map((model) => {
        const isSelected = value === model.name
        return (
          <button
            key={model.name}
            type="button"
            onClick={() => onChange(model)}
            className={[
              "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 text-left",
              isSelected
                ? "border-ink bg-ink/5"
                : "border-black/8 bg-surface hover:border-black/20 hover:bg-black/3",
            ].join(" ")}
          >
            {/* Silueta pequeña */}
            <div className="w-14 h-7 text-ink shrink-0" style={{ opacity: isSelected ? 1 : 0.35 }}>
              <BodySilhouette type={model.bodyType} />
            </div>

            <div className="flex-1 min-w-0">
              <p className={["text-sm font-medium truncate", isSelected ? "text-ink" : "text-ink/80"].join(" ")}>
                {model.name}
              </p>
              <p className="text-[10px] text-muted">{BODY_TYPE_LABELS[model.bodyType]}</p>
            </div>

            {isSelected && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ink shrink-0">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}
