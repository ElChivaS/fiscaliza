// Generado manualmente — reemplazar con: npx supabase gen types typescript --project-id <id>

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          type: "personal" | "business"
          plan: "free" | "pro" | "business"
          plan_expires_at: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: "personal" | "business"
          plan?: "free" | "pro" | "business"
          plan_expires_at?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: "personal" | "business"
          plan?: "free" | "pro" | "business"
          plan_expires_at?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          organization_id: string
          role: "owner" | "admin" | "driver"
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          organization_id: string
          role?: "owner" | "admin" | "driver"
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          role?: "owner" | "admin" | "driver"
          full_name?: string | null
          avatar_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      plan_limits: {
        Row: {
          plan: "free" | "pro" | "business"
          max_vehicles: number
          max_members: number
          expiry_alerts: boolean
          qr_enabled: boolean
        }
        Insert: {
          plan: "free" | "pro" | "business"
          max_vehicles: number
          max_members: number
          expiry_alerts?: boolean
          qr_enabled?: boolean
        }
        Update: {
          plan?: "free" | "pro" | "business"
          max_vehicles?: number
          max_members?: number
          expiry_alerts?: boolean
          qr_enabled?: boolean
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          id: string
          organization_id: string
          alias: string
          plate: string
          brand: string | null
          model: string | null
          year: number | null
          body_type: string | null
          category: "auto" | "moto" | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          alias: string
          plate: string
          brand?: string | null
          model?: string | null
          year?: number | null
          body_type?: string | null
          category?: "auto" | "moto" | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          alias?: string
          plate?: string
          brand?: string | null
          model?: string | null
          year?: number | null
          body_type?: string | null
          category?: "auto" | "moto" | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          vehicle_id: string
          organization_id: string
          type: "licencia" | "revision_tecnica" | "permiso_circulacion" | "soap"
          side: "front" | "back" | null
          storage_path: string
          file_name: string
          mime_type: string
          expires_at: string | null
          issued_at: string | null
          is_current: boolean
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          organization_id: string
          type: "licencia" | "revision_tecnica" | "permiso_circulacion" | "soap"
          side?: "front" | "back" | null
          storage_path: string
          file_name: string
          mime_type: string
          expires_at?: string | null
          issued_at?: string | null
          is_current?: boolean
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          organization_id?: string
          type?: "licencia" | "revision_tecnica" | "permiso_circulacion" | "soap"
          side?: "front" | "back" | null
          storage_path?: string
          file_name?: string
          mime_type?: string
          expires_at?: string | null
          issued_at?: string | null
          is_current?: boolean
          uploaded_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      plan_type: "free" | "pro" | "business"
      org_type: "personal" | "business"
      member_role: "owner" | "admin" | "driver"
      document_type: "licencia" | "revision_tecnica" | "permiso_circulacion" | "soap"
    }
    CompositeTypes: Record<string, never>
  }
}
