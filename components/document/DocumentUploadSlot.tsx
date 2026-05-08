"use client"

import { useRef, useState, type DragEvent } from "react"
import type { DocumentType } from "@/types/document.types"
import { DOCUMENT_TYPE_LABELS } from "@/types/document.types"

interface DocumentUploadSlotProps {
  type: DocumentType
  value: File | null
  expiresAt: string
  onFileChange: (type: DocumentType, file: File | null) => void
  onExpiresAtChange: (type: DocumentType, date: string) => void
}

export default function DocumentUploadSlot({
  type,
  value,
  expiresAt,
  onFileChange,
  onExpiresAtChange,
}: DocumentUploadSlotProps) {
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
    onFileChange(type, file)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-surface overflow-hidden">
      {/* Zona de drop */}
      <div
        className={[
          "relative p-4 cursor-pointer transition-colors",
          dragging ? "bg-black/5" : "hover:bg-black/2",
        ].join(" ")}
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

        <div className="flex items-center gap-3">
          <span className="size-10 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
            {value ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888580" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink">
              {DOCUMENT_TYPE_LABELS[type]}
            </p>
            <p className="text-xs text-muted truncate">
              {value ? value.name : "Toca para cargar PDF o imagen"}
            </p>
          </div>

          {value && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFileChange(type, null) }}
              className="size-7 flex items-center justify-center rounded-full hover:bg-black/10 text-muted text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Campo fecha */}
      <div className="px-4 pb-4 pt-1 border-t border-black/5">
        <label className="text-xs text-muted mb-1.5 block">Fecha de vencimiento (opcional)</label>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => onExpiresAtChange(type, e.target.value)}
          className="w-full h-9 rounded-xl border border-black/10 bg-background px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
      </div>
    </div>
  )
}
