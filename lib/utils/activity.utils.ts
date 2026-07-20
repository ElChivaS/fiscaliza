import type { ActivityLogEntry } from "@/types/document.types"

export function describeActivity(entry: ActivityLogEntry): string {
  const who    = entry.user_name
  const target = entry.target_label ?? ""

  switch (entry.action) {
    case "login":              return `${who} inició sesión`
    case "vehicle_created":    return `${who} agregó ${target || "un vehículo"}`
    case "vehicle_updated":    return `${who} editó ${target || "un vehículo"}`
    case "vehicle_deleted":    return `${who} eliminó ${target || "un vehículo"}`
    case "document_uploaded":  return `${who} subió ${target || "un documento"}`
    case "document_deleted":   return `${who} eliminó ${target || "un documento"}`
  }
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / (1000 * 60))

  if (diffMin < 1)   return "recién"
  if (diffMin < 60)  return `hace ${diffMin}m`

  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `hace ${diffH}h`

  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `hace ${diffD}d`

  return new Date(iso).toLocaleDateString("es-CL", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  })
}
