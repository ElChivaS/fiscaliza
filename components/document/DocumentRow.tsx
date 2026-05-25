"use client"

import { type DocumentWithStatus } from "@/types/document.types"
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ORDER, type DocumentType } from "@/types/document.types"
import { STATUS_COLOR, STATUS_LABEL, formatExpiry } from "@/lib/utils/document.utils"

interface DocumentRowProps {
  type: DocumentType
  document: DocumentWithStatus | null
  onOptions: (type: DocumentType) => void
  onClick: (type: DocumentType) => void
  hasBothSides?: boolean
}

export default function DocumentRow({
  type,
  document,
  onOptions,
  onClick,
  hasBothSides,
}: DocumentRowProps) {
  const status   = document?.expiryStatus ?? "unknown"
  const color    = STATUS_COLOR[status]
  const label    = STATUS_LABEL[status]
  const baseSubtitle = document ? formatExpiry(document) : "Sin documento cargado"
  const subtitle = hasBothSides ? `${baseSubtitle} · 2 lados` : baseSubtitle
  const hasDoc   = document !== null

  return (
    <div
      className="flex items-center gap-4 w-full py-3 px-1 text-left group cursor-pointer"
      onClick={() => (hasDoc ? onClick(type) : onOptions(type))}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") hasDoc ? onClick(type) : onOptions(type) }}
    >
      {/* Icono */}
      <span
        className="size-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-active:scale-95"
        style={{ backgroundColor: color + "1a" }}
      >
        <DocIcon type={type} color={color} />
      </span>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">
          {DOCUMENT_TYPE_LABELS[type]}
        </p>
        <p
          className="text-xs mt-0.5 truncate"
          style={{ color: hasDoc ? color : "#888580" }}
        >
          {subtitle}
        </p>
      </div>

      {/* Badge + menú */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: color + "20",
            color,
          }}
        >
          {label}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onOptions(type) }}
          className="size-8 flex items-center justify-center rounded-full hover:bg-black/5 text-muted"
          aria-label="Opciones"
        >
          ···
        </button>
      </div>
    </div>
  )
}

function DocIcon({ type, color }: { type: DocumentType; color: string }) {
  const icons: Record<DocumentType, React.ReactNode> = {
    licencia: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M15 9h2M15 13h2M6 15h6" />
      </svg>
    ),
    revision_tecnica: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    permiso_circulacion: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    soap: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  }

  return <>{icons[type]}</>
}

export { DOCUMENT_TYPE_ORDER }
