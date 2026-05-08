"use client"

import { useVehiclesStore } from "@/stores/vehiclesStore"
import { useEffect } from "react"

export function useVehicles() {
  const store = useVehiclesStore()

  useEffect(() => {
    if (store.vehicles.length === 0 && !store.loading) {
      store.fetchVehiclesWithDocuments()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    vehicles: store.vehicles,
    loading:  store.loading,
    error:    store.error,
    refresh:  store.fetchVehiclesWithDocuments,
    create:   store.createVehicle,
    update:   store.updateVehicle,
    remove:   store.deleteVehicle,
    checkPlate: store.checkPlateExists,
  }
}
