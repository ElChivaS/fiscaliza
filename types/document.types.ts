import type { Database } from "./database.types"
import type { VehicleCategory } from "@/lib/data/vehicles"

export type DocumentType  = Database["public"]["Enums"]["document_type"]
export type PlanType      = Database["public"]["Enums"]["plan_type"]
export type MemberRole    = Database["public"]["Enums"]["member_role"]

export type Document      = Database["public"]["Tables"]["documents"]["Row"]
export type Vehicle       = Database["public"]["Tables"]["vehicles"]["Row"]
export type Profile       = Database["public"]["Tables"]["profiles"]["Row"]
export type Organization  = Database["public"]["Tables"]["organizations"]["Row"]
export type PlanLimits    = Database["public"]["Tables"]["plan_limits"]["Row"]

export interface VehicleWithDocuments extends Vehicle {
  documents: DocumentWithStatus[]
}

export interface DocumentWithStatus extends Document {
  expiryStatus: "valid" | "expiring_soon" | "expired" | "unknown"
  daysUntilExpiry: number | null
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  licencia:             "Licencia de conducir",
  revision_tecnica:     "Revisión técnica",
  permiso_circulacion:  "Permiso de circulación",
  soap:                 "SOAP",
}

export const DOCUMENT_TYPE_SHORT: Record<DocumentType, string> = {
  licencia:             "Licencia",
  revision_tecnica:     "Rev. Técnica",
  permiso_circulacion:  "Permiso",
  soap:                 "SOAP",
}

export const DOCUMENT_TYPE_ORDER: DocumentType[] = [
  "licencia",
  "revision_tecnica",
  "permiso_circulacion",
  "soap",
]

export interface CreateVehiclePayload {
  alias:      string
  plate:      string
  brand?:     string
  model?:     string
  year?:      number
  body_type?: string
  category?:  VehicleCategory
}

export interface UploadDocumentPayload {
  vehicleId: string
  type: DocumentType
  file: File
  side?: "front" | "back" | null
  expiresAt?: string
  issuedAt?: string
}

/** Tipos de documento que requieren frente y reverso */
export const DUAL_SIDE_TYPES: DocumentType[] = ["licencia"]
