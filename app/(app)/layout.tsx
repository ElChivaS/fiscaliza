import BottomNav from "@/components/layout/BottomNav"
import ToastContainer from "@/components/ui/Toast"
import type { ReactNode } from "react"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      <BottomNav />
      <ToastContainer />
    </div>
  )
}
