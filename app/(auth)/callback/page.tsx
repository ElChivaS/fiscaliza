"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Spinner from "@/components/ui/Spinner"

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function handle() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace("/dashboard")
      } else {
        router.replace("/login")
      }
    }
    handle()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" className="text-ink" />
      <p className="text-sm text-muted">Verificando sesión…</p>
    </div>
  )
}
