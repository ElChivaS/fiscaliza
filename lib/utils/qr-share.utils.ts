import type { QrShareDocument } from "@/types/document.types"

export type QrShareStatus = "valid" | "expiring_soon" | "expired" | "unknown"

export interface QrShareDocStatus {
  status:          QrShareStatus
  daysUntilExpiry: number | null
}

/** Igual criterio que enrichWithStatus() en document.utils.ts, pero sobre el snapshot del QR. */
export function qrShareDocStatus(doc: QrShareDocument): QrShareDocStatus {
  if (!doc.expires_at) return { status: "unknown", daysUntilExpiry: null }

  const days = Math.ceil(
    (new Date(doc.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const status: QrShareStatus = days < 0 ? "expired" : days <= 30 ? "expiring_soon" : "valid"

  return { status, daysUntilExpiry: days }
}

export function formatQrShareExpiry(doc: QrShareDocument): string {
  const { status, daysUntilExpiry } = qrShareDocStatus(doc)
  if (!doc.expires_at || daysUntilExpiry === null) return "Sin fecha de vencimiento"

  const date = new Date(doc.expires_at).toLocaleDateString("es-CL", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  })

  if (status === "expired")       return `Venció ${Math.abs(daysUntilExpiry)}d atrás (${date})`
  if (status === "expiring_soon") return `Vence en ${daysUntilExpiry}d (${date})`
  return `Vigente hasta ${date}`
}
