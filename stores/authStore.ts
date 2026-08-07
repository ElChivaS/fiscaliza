"use client"

import { create } from "zustand"
import { onAuthStateChanged, auth } from "@/lib/firebase/auth"
import { getProfile, getOrganization, getPlanLimits, expireTesterPromo } from "@/lib/firebase/firestore"
import type { Organization, Profile, PlanLimits } from "@/types/document.types"
import { useVehiclesStore } from "./vehiclesStore"

// Persiste el listener de Firebase fuera de React para que sobreviva desmontes de componentes
let _firebaseUnsub: (() => void) | null = null

interface AuthStore {
  profile:      Profile | null
  organization: Organization | null
  planLimits:   PlanLimits | null
  loading:      boolean
  error:        string | null
  _initialized: boolean

  init: () => () => void   // returns unsubscribe
  reset: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  profile:      null,
  organization: null,
  planLimits:   null,
  loading:      true,
  error:        null,
  _initialized: false,

  init: () => {
    if (get()._initialized) return () => {}
    set({ _initialized: true })

    _firebaseUnsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Limpiar datos del usuario anterior
        useVehiclesStore.getState().reset()
        set({ profile: null, organization: null, planLimits: null, loading: false })
        return
      }

      // Si ya tenemos el perfil de este usuario, no recargar
      if (get().profile?.id === user.uid) {
        set({ loading: false })
        return
      }

      // Nuevo usuario — limpiar datos del anterior antes de cargar los nuevos
      useVehiclesStore.getState().reset()

      set({ loading: true, error: null })
      try {
        const profile = await getProfile(user.uid)
        if (!profile) throw new Error("Perfil no encontrado")

        let [organization, planLimits] = await Promise.all([
          getOrganization(profile.organization_id),
          getOrganization(profile.organization_id).then((org) =>
            org ? getPlanLimits(org.plan) : null
          ),
        ])

        // Mes gratis de tester vencido — se revierte a Free al abrir la app
        // (no hay Cloud Functions en este proyecto para hacerlo en segundo plano).
        if (
          organization?.is_tester_promo &&
          organization.plan_expires_at &&
          new Date(organization.plan_expires_at) < new Date()
        ) {
          await expireTesterPromo(organization.id)
          organization = await getOrganization(organization.id)
          planLimits   = organization ? await getPlanLimits(organization.plan) : null
        }

        set({ profile, organization, planLimits, loading: false })
      } catch (err) {
        set({
          error:   err instanceof Error ? err.message : "Error al cargar perfil",
          loading: false,
        })
      }
    })

    // El listener vive a nivel de módulo — no lo matamos al desmontar el componente
    return () => {}
  },

  reset: () => {
    _firebaseUnsub?.()
    _firebaseUnsub = null
    set({
      profile: null, organization: null, planLimits: null,
      loading: true, error: null, _initialized: false,
    })
  },
}))
