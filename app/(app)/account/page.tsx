"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { logout, sendResetEmail, auth } from "@/lib/firebase/auth"
import { updateProfile as fbUpdateProfile } from "@/lib/firebase/firestore"
import { uploadAvatar } from "@/lib/firebase/storage"
import { useOrganization } from "@/hooks/useOrganization"
import { useAuthStore } from "@/stores/authStore"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import PricingModal from "@/components/ui/PricingModal"
import { toast } from "@/components/ui/Toast"
import AccountSkeleton from "@/components/skeletons/AccountSkeleton"

const PLAN_LABELS: Record<string, string> = {
  free:     "Free",
  pro:      "Pro",
  business: "Business",
}

export default function AccountPage() {
  const router = useRouter()
  const { profile, organization, planLimits, loading } = useOrganization()

  const [editName, setEditName]         = useState(false)
  const [name, setName]                 = useState("")
  const [savingName, setSavingName]     = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showPlans, setShowPlans] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSaveName() {
    if (!name.trim()) return
    setSavingName(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error("No autenticado")

      await fbUpdateProfile(user.uid, { full_name: name.trim() })
      toast("Nombre actualizado", "success")
      setEditName(false)
    } catch {
      toast("Error al guardar", "error")
    } finally {
      setSavingName(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const user = auth.currentUser
    if (!user) return

    setUploadingAvatar(true)
    try {
      const url = await uploadAvatar(file, user.uid)
      await fbUpdateProfile(user.uid, { avatar_url: url })
      // Actualizar el store inmediatamente
      useAuthStore.setState((s) => ({
        profile: s.profile ? { ...s.profile, avatar_url: url } : s.profile,
      }))
      toast("Foto actualizada", "success")
    } catch {
      toast("Error al subir la foto", "error")
    } finally {
      setUploadingAvatar(false)
      // Reset input para permitir reseleccionar el mismo archivo
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleResetPassword() {
    const user = auth.currentUser
    if (!user?.email) return
    try {
      await sendResetEmail(user.email)
      toast("Revisa tu email para cambiar la contraseña", "success")
    } catch {
      toast("Error al enviar el correo", "error")
    }
  }

  async function handleSignOut() {
    await logout()
    router.push("/login")
    router.refresh()
  }

  if (loading) {
    return <AccountSkeleton />
  }

  const displayName = profile?.full_name ?? "Usuario"

  return (
    <div className="max-w-md mx-auto px-4">
      <PageHeader title="Mi cuenta" back backHref="/dashboard" />

      {/* Avatar + nombre */}
      <div className="flex flex-col items-center py-8 gap-3">
        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {/* Avatar clickeable */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative group focus:outline-none"
          disabled={uploadingAvatar}
        >
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              width={80}
              height={80}
              className="size-20 rounded-full object-cover"
            />
          ) : (
            <div className="size-20 rounded-full bg-ink flex items-center justify-center text-white font-syne font-bold text-3xl">
              {displayName[0]?.toUpperCase()}
            </div>
          )}

          {/* Overlay de cámara */}
          <div className={[
            "absolute inset-0 rounded-full flex items-center justify-center transition-all duration-150",
            uploadingAvatar
              ? "bg-black/40"
              : "bg-black/0 group-hover:bg-black/30",
          ].join(" ")}>
            {uploadingAvatar ? (
              <span className="size-5 rounded-full border-2 border-white border-t-transparent animate-spin block" />
            ) : (
              <svg
                width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </div>
        </button>

        {editName ? (
          <div className="flex items-center gap-2 w-full max-w-xs">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 h-10 rounded-xl border border-black/10 bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
              placeholder="Tu nombre"
            />
            <Button size="sm" loading={savingName} onClick={handleSaveName}>
              Guardar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditName(false)}>
              ✕
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-syne font-bold text-xl text-ink">{displayName}</p>
            <button
              onClick={() => { setName(displayName); setEditName(true) }}
              className="text-xs text-muted underline underline-offset-2 mt-1 hover:text-ink transition-colors"
            >
              Editar nombre
            </button>
          </div>
        )}
      </div>

      {/* Plan card */}
      <div className="rounded-2xl bg-ink p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs mb-1">Tu plan actual</p>
            <p className="font-syne font-bold text-white text-xl">
              {PLAN_LABELS[organization?.plan ?? "free"]}
            </p>
            {planLimits && (
              <p className="text-white/50 text-xs mt-1">
                {planLimits.max_vehicles === -1
                  ? "Vehículos ilimitados"
                  : `${planLimits.max_vehicles} vehículo${planLimits.max_vehicles !== 1 ? "s" : ""}`}
                {" · "}
                {planLimits.expiry_alerts ? "Alertas activas" : "Sin alertas"}
              </p>
            )}
          </div>
          {organization?.plan === "free" && (
            <button
              onClick={() => setShowPlans(true)}
              className="text-xs font-medium bg-white text-ink px-4 py-2 rounded-xl hover:bg-white/90 transition-colors"
            >
              Mejorar
            </button>
          )}
        </div>
      </div>

      {/* Menú */}
      <div className="flex flex-col gap-1 rounded-2xl bg-surface border border-black/8 overflow-hidden mb-4">
        <MenuItem
          label="Cambiar contraseña"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
          onClick={handleResetPassword}
        />
      </div>

      <div className="flex flex-col gap-1 rounded-2xl bg-surface border border-black/8 overflow-hidden">
        <MenuItem
          label="Cerrar sesión"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          }
          danger
          onClick={handleSignOut}
        />
      </div>

      {/* App info */}
      <p className="text-center text-xs text-muted mt-8">
        FISCALIZA v0.1.0 · Ley 21.302 Chile
      </p>

      {/* Modal de planes */}
      <PricingModal
        open={showPlans}
        onClose={() => setShowPlans(false)}
        currentPlan={organization?.plan ?? "free"}
      />
    </div>
  )
}

function MenuItem({
  label,
  icon,
  danger = false,
  onClick,
}: {
  label:   string
  icon:    React.ReactNode
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-3 px-5 py-4 w-full text-left hover:bg-black/3 transition-colors",
        danger ? "text-expired" : "text-ink",
      ].join(" ")}
    >
      <span className="size-5 flex items-center justify-center shrink-0">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-auto text-muted shrink-0">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}

