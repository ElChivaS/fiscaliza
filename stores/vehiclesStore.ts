"use client"

import { create } from "zustand"
import { auth } from "@/lib/firebase/auth"
import {
  getVehicles,
  getDocumentsForVehicle,
  createVehicle as fbCreateVehicle,
  updateVehicle as fbUpdateVehicle,
  softDeleteVehicle,
  checkPlateExists as fbCheckPlate,
  getProfile,
} from "@/lib/firebase/firestore"
import { enrichWithStatus } from "@/lib/utils/document.utils"
import { normalizePlate } from "@/lib/utils/plate.utils"
import type { VehicleWithDocuments, CreateVehiclePayload } from "@/types/document.types"

interface VehiclesStore {
  vehicles:       VehicleWithDocuments[]
  organizationId: string | null
  loading:        boolean
  error:          string | null

  fetchVehiclesWithDocuments:  () => Promise<void>
  createVehicle:               (payload: CreateVehiclePayload) => Promise<string>
  updateVehicle:               (id: string, payload: Partial<CreateVehiclePayload>) => Promise<void>
  deleteVehicle:               (id: string) => Promise<void>
  checkPlateExists:            (plate: string) => Promise<boolean>
  refreshVehicleDocuments:     (vehicleId: string) => Promise<void>
  reset:                       () => void
}

export const useVehiclesStore = create<VehiclesStore>((set, get) => ({
  vehicles:       [],
  organizationId: null,
  loading:        false,
  error:          null,

  fetchVehiclesWithDocuments: async () => {
    set({ loading: true, error: null })
    try {
      const user = auth.currentUser
      if (!user) throw new Error("No autenticado")

      const profile = await getProfile(user.uid)
      if (!profile) throw new Error("Perfil no encontrado")

      const orgId    = profile.organization_id
      const vehicles = await getVehicles(orgId)

      // Cargar documentos en paralelo
      const vehiclesWithDocs: VehicleWithDocuments[] = await Promise.all(
        vehicles.map(async (v) => {
          const docs = await getDocumentsForVehicle(v.id, orgId)
          return { ...v, documents: docs.map(enrichWithStatus) }
        })
      )

      set({ vehicles: vehiclesWithDocs, organizationId: orgId, loading: false })
    } catch (err) {
      set({
        error:   err instanceof Error ? err.message : "Error al cargar vehículos",
        loading: false,
      })
    }
  },

  createVehicle: async (payload) => {
    const user = auth.currentUser
    if (!user) throw new Error("No autenticado")

    const profile = await getProfile(user.uid)
    if (!profile) throw new Error("Perfil no encontrado")

    const id = await fbCreateVehicle(profile.organization_id, {
      ...payload,
      plate: normalizePlate(payload.plate),
    })

    await get().fetchVehiclesWithDocuments()
    return id
  },

  updateVehicle: async (id, payload) => {
    await fbUpdateVehicle(id, {
      alias: payload.alias,
      brand: payload.brand,
      model: payload.model,
      year:  payload.year,
    })

    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, ...payload } : v
      ),
    }))
  },

  deleteVehicle: async (id) => {
    await softDeleteVehicle(id)
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
    }))
  },

  checkPlateExists: async (plate) => {
    const orgId = get().organizationId
    if (!orgId) {
      // Si aún no tenemos el orgId, cargamos el perfil
      const user = auth.currentUser
      if (!user) return false
      const profile = await getProfile(user.uid)
      if (!profile) return false
      return fbCheckPlate(normalizePlate(plate), profile.organization_id)
    }
    return fbCheckPlate(normalizePlate(plate), orgId)
  },

  refreshVehicleDocuments: async (vehicleId) => {
    const orgId = get().organizationId
    if (!orgId) return
    const docs = await getDocumentsForVehicle(vehicleId, orgId)
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, documents: docs.map(enrichWithStatus) }
          : v
      ),
    }))
  },

  reset: () => set({ vehicles: [], organizationId: null, loading: false, error: null }),
}))
