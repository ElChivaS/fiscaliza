"use client"

import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import { enrichWithStatus } from "@/lib/utils/document.utils"
import { normalizePlate } from "@/lib/utils/plate.utils"
import type { VehicleWithDocuments, CreateVehiclePayload } from "@/types/document.types"

interface VehiclesStore {
  vehicles: VehicleWithDocuments[]
  loading:  boolean
  error:    string | null

  fetchVehiclesWithDocuments:  () => Promise<void>
  createVehicle:               (payload: CreateVehiclePayload) => Promise<string>
  updateVehicle:               (id: string, payload: Partial<CreateVehiclePayload>) => Promise<void>
  deleteVehicle:               (id: string) => Promise<void>
  checkPlateExists:            (plate: string) => Promise<boolean>
  refreshVehicleDocuments:     (vehicleId: string) => Promise<void>
}

export const useVehiclesStore = create<VehiclesStore>((set, get) => ({
  vehicles: [],
  loading:  false,
  error:    null,

  fetchVehiclesWithDocuments: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()

      const { data: vehicles, error: vErr } = await supabase
        .from("vehicles")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (vErr) throw vErr

      const vehicleIds = (vehicles ?? []).map((v) => v.id)

      const { data: docs, error: dErr } = vehicleIds.length
        ? await supabase
            .from("documents")
            .select("*")
            .in("vehicle_id", vehicleIds)
            .eq("is_current", true)
        : { data: [], error: null }

      if (dErr) throw dErr

      const enriched: VehicleWithDocuments[] = (vehicles ?? []).map((v) => ({
        ...v,
        documents: (docs ?? [])
          .filter((d) => d.vehicle_id === v.id)
          .map(enrichWithStatus),
      }))

      set({ vehicles: enriched, loading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error al cargar vehículos",
        loading: false,
      })
    }
  },

  createVehicle: async (payload) => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()

    if (!profile) throw new Error("Perfil no encontrado")

    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        organization_id: profile.organization_id,
        alias:  payload.alias,
        plate:  normalizePlate(payload.plate),
        brand:  payload.brand ?? null,
        model:  payload.model ?? null,
        year:   payload.year ?? null,
      })
      .select("id")
      .single()

    if (error) {
      if (error.message.includes("vehicle_limit_reached")) {
        throw new Error("vehicle_limit_reached")
      }
      throw error
    }

    await get().fetchVehiclesWithDocuments()
    return data.id
  },

  updateVehicle: async (id, payload) => {
    const supabase = createClient()

    const { error } = await supabase
      .from("vehicles")
      .update({
        alias:  payload.alias,
        brand:  payload.brand,
        model:  payload.model,
        year:   payload.year,
      })
      .eq("id", id)

    if (error) throw error

    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, ...payload } : v
      ),
    }))
  },

  deleteVehicle: async (id) => {
    const supabase = createClient()

    const { error } = await supabase
      .from("vehicles")
      .update({ is_active: false })
      .eq("id", id)

    if (error) throw error

    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
    }))
  },

  checkPlateExists: async (plate) => {
    const supabase = createClient()
    const { count } = await supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("plate", normalizePlate(plate))
      .eq("is_active", true)

    return (count ?? 0) > 0
  },

  refreshVehicleDocuments: async (vehicleId) => {
    const supabase = createClient()

    const { data: docs } = await supabase
      .from("documents")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .eq("is_current", true)

    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, documents: (docs ?? []).map(enrichWithStatus) }
          : v
      ),
    }))
  },
}))
