"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth, onAuthStateChanged } from "@/lib/firebase/auth"
import Spinner from "@/components/ui/Spinner"

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        document.cookie = "fiscaliza-session=1; path=/; max-age=86400; SameSite=Lax"
        router.replace("/dashboard")
      } else {
        router.replace("/login")
      }
    })
    return unsub
  }, [router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" className="text-ink" />
      <p className="text-sm text-muted">Verificando sesión…</p>
    </div>
  )
}
