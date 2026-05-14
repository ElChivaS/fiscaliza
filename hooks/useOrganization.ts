"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"

export function useOrganization() {
  const { profile, organization, planLimits, loading, error, init } = useAuthStore()

  useEffect(() => {
    const unsub = init()
    return unsub
  }, [init])

  return { profile, organization, planLimits, loading, error }
}
