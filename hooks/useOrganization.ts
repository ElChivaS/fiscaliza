"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Organization, Profile, PlanLimits } from "@/types/document.types"

interface OrgData {
  profile: Profile | null
  organization: Organization | null
  planLimits: PlanLimits | null
}

export function useOrganization() {
  const [data, setData] = useState<OrgData>({
    profile: null,
    organization: null,
    planLimits: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileErr) throw profileErr

        const { data: org, error: orgErr } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", profile.organization_id)
          .single()

        if (orgErr) throw orgErr

        const { data: limits, error: limitsErr } = await supabase
          .from("plan_limits")
          .select("*")
          .eq("plan", org.plan)
          .single()

        if (limitsErr) throw limitsErr

        setData({ profile, organization: org, planLimits: limits })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar organización")
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { ...data, loading, error }
}
