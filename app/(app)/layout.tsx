import BottomNav from "@/components/layout/BottomNav"
import ToastContainer from "@/components/ui/Toast"
import type { ReactNode } from "react"

// Todas las páginas bajo (app) requieren auth — no se pueden prerender estáticamente
export const dynamic = "force-dynamic"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      <BottomNav />
      <ToastContainer />
    </div>
  )
}
