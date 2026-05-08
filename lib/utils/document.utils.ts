import type { Document, DocumentWithStatus } from "@/types/document.types"

export function enrichWithStatus(doc: Document): DocumentWithStatus {
  if (!doc.expires_at) {
    return { ...doc, expiryStatus: "unknown", daysUntilExpiry: null }
  }

  const days = Math.ceil(
    (new Date(doc.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  const expiryStatus =
    days < 0 ? "expired" : days <= 30 ? "expiring_soon" : "valid"

  return { ...doc, expiryStatus, daysUntilExpiry: days }
}

export function formatExpiry(doc: DocumentWithStatus): string {
  if (!doc.expires_at) return "Sin fecha de vencimiento"
  if (doc.daysUntilExpiry === null) return "Sin fecha"

  const date = new Date(doc.expires_at).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  if (doc.expiryStatus === "expired") {
    return `Venció ${Math.abs(doc.daysUntilExpiry)}d atrás (${date})`
  }
  if (doc.expiryStatus === "expiring_soon") {
    return `Vence en ${doc.daysUntilExpiry}d (${date})`
  }
  return `Vigente hasta ${date}`
}

export function worstStatus(
  statuses: DocumentWithStatus["expiryStatus"][]
): DocumentWithStatus["expiryStatus"] {
  if (statuses.includes("expired"))      return "expired"
  if (statuses.includes("expiring_soon")) return "expiring_soon"
  if (statuses.includes("valid"))         return "valid"
  return "unknown"
}

export const STATUS_COLOR: Record<DocumentWithStatus["expiryStatus"], string> = {
  valid:         "#22c55e",
  expiring_soon: "#f59e0b",
  expired:       "#ef4444",
  unknown:       "#888580",
}

export const STATUS_LABEL: Record<DocumentWithStatus["expiryStatus"], string> = {
  valid:         "Vigente",
  expiring_soon: "Por vencer",
  expired:       "Vencido",
  unknown:       "Sin doc",
}
