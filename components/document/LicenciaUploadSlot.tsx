"use client"

import { useRef, useState, type DragEvent } from "react"
import { STATUS_COLOR } from "@/lib/utils/document.utils"

interface SideSlotProps {
  label: string
  required?: boolean
  value: File | null
  onChange: (file: File | null) => void
}

function SideSlot({ label, required, value, onChange }: SideSlotProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowed.includes(file.type)) {
      alert("Solo se aceptan PDF o imágenes (JPG, PNG, WEBP)")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo no puede superar los 10 MB")
      return
    }
    onChange(file)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const isImage = value && value.type.startsWith("image/")

  return (
    <div className="flex-1">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs font-semibold text-ink uppercase tracking-wide">{label}</span>
        {required && <span className="text-[10px] text-expired font-medium">requerido</span>}
      </div>

      <div
        className={[
          "relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden",
          dragging        ? "border-ink/40 bg-black/5" :
          value           ? "border-valid/40 bg-valid/5" :
                            "border-black/15 hover:border-black/30 bg-surface",
        ].join(" ")}
        style={{ minHeight: 120 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ""
          }}
        />

        {/* Preview de imagen */}
        {isImage && value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={URL.createObjectURL(value)}
            alt={label}
            className="w-full h-full object-cover"
            style={{ maxHeight: 160 }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4 h-full" style={{ minHeight: 120 }}>
            {value ? (
              <>
                {/* PDF seleccionado */}
                <span className="size-10 rounded-xl bg-valid/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </span>
                <p className="text-xs text-valid font-medium text-center truncate w-full px-2">{value.name}</p>
              </>
            ) : (
              <>
                <span className="size-10 rounded-xl bg-black/5 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888580" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M15 9h2M15 13h2M6 15h6" />
                  </svg>
                </span>
                <p className="text-xs text-muted text-center">Foto o PDF</p>
              </>
            )}
          </div>
        )}

        {/* Botón quitar */}
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="absolute top-2 right-2 size-6 rounded-full bg-black/30 text-white flex items-center justify-center text-xs hover:bg-black/50 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

interface LicenciaUploadSlotProps {
  frontFile:  File | null
  backFile:   File | null
  expiresAt:  string
  onFrontChange: (file: File | null) => void
  onBackChange:  (file: File | null) => void
  onExpiresAtChange: (date: string) => void
}

export default function LicenciaUploadSlot({
  frontFile,
  backFile,
  expiresAt,
  onFrontChange,
  onBackChange,
  onExpiresAtChange,
}: LicenciaUploadSlotProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Las dos caras */}
      <div className="flex gap-3">
        <SideSlot
          label="Frente"
          required
          value={frontFile}
          onChange={onFrontChange}
        />
        <SideSlot
          label="Reverso"
          value={backFile}
          onChange={onBackChange}
        />
      </div>

      {/* Advertencia formato vigente */}
      <div className="flex gap-3 rounded-2xl p-4" style={{ backgroundColor: STATUS_COLOR.expiring_soon + "15" }}>
        <span className="text-lg leading-none shrink-0" aria-hidden>⚠️</span>
        <p className="text-base leading-relaxed" style={{ color: STATUS_COLOR.expiring_soon }}>
          Ten en cuenta que los fiscalizadores pueden pedir tu licencia de conducir en físico
          si esta no presenta el nuevo formato vigente a contar de 2026.
        </p>
      </div>

      {/* Fecha de vencimiento compartida */}
      <div className="rounded-2xl border border-black/10 bg-surface px-4 py-3">
        <label className="text-xs text-muted mb-1.5 block">Fecha de vencimiento (opcional)</label>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => onExpiresAtChange(e.target.value)}
          className="w-full h-9 rounded-xl border border-black/10 bg-background px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
      </div>
    </div>
  )
}
