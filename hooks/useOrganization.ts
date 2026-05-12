"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "@/lib/firebase/auth"
import { auth } from "@/lib/firebase/auth"
import { getProfile, getOrganization, getPlanLimits } from "@/lib/firebase/firestore"
import type { Organization, Profile, PlanLimits } from "@/types/document.types"

interface OrgData {
  profile:      Profile | null
  organization: Organization | null
  planLimits:   PlanLimits | null
}

export function useOrganization() {
  const [data, setData]       = useState<OrgData>({ profile: null, organization: null, planLimits: null })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setData({ profile: null, organization: null, planLimits: null })
        setLoading(false)
        return
      }

      try {
        const profile = await getProfile(user.uid)
        if (!profile) throw new Error("Perfil no encontrado")

        const [organization, planLimits] = await Promise.all([
          getOrganization(profile.organization_id),
          getPlanLimits(profile.organization_id).then(() =>
            getOrganization(profile.organization_id).then((org) =>
              org ? getPlanLimits(org.plan) : null
            )
          ),
        ])

        setData({ profile, organization, planLimits })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar organización")
      } finally {
        setLoading(false)
      }
    })

    return unsub
  }, [])

  return { ...data, loading, error }
}
