"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signInWithGoogle, registerWithEmail } from "@/lib/firebase/auth"
import Button from "@/components/ui/Button"
import TesterWelcomeModal from "@/components/auth/TesterWelcomeModal"

function getPasswordStrength(p: string): { label: string; color: string; width: string } {
  if (p.length === 0) return { label: "", color: "", width: "0%" }
  if (p.length < 6)   return { label: "Débil",    color: "#ef4444", width: "33%" }
  if (p.length < 10 || !/[0-9]/.test(p) || !/[A-Z]/.test(p))
                       return { label: "Moderada", color: "#f59e0b", width: "66%" }
  return              { label: "Fuerte",   color: "#22c55e", width: "100%" }
}

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/email-already-in-use":   "Ya existe una cuenta con ese email.",
  "auth/weak-password":          "La contraseña debe tener al menos 6 caracteres.",
  "auth/invalid-email":          "Email inválido.",
  "auth/network-request-failed": "Error de red. Verifica tu conexión.",
}

function mapError(code: string): string {
  return FIREBASE_ERRORS[code] ?? "Ocurrió un error. Intenta de nuevo."
}

function setSessionCookie() {
  document.cookie = "fiscaliza-session=1; path=/; max-age=86400; SameSite=Lax"
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isTesterInvite = searchParams.get("tester") === "1"

  const [name, setName]                 = useState("")
  const [email, setEmail]               = useState("")
  const [password, setPassword]         = useState("")
  const [showPass, setShowPass]         = useState(false)
  const [loading, setLoading]           = useState(false)
  const [loadingOAuth, setLoadingOAuth] = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const [showTesterModal, setShowTesterModal] = useState(isTesterInvite)
  const [isTesterSignup, setIsTesterSignup]   = useState(false)

  const strength = getPasswordStrength(password)

  function handleTesterComplete(data: { fullName: string; email: string }) {
    setName(data.fullName)
    setEmail(data.email)
    setIsTesterSignup(true)
    setShowTesterModal(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return }
    setLoading(true)
    setError(null)
    try {
      await registerWithEmail(email, password, name.trim(), isTesterSignup)
      setSessionCookie()
      router.push("/dashboard")
    } catch (err) {
      const code = (err as { code?: string }).code ?? ""
      setError(mapError(code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoadingOAuth(true)
    setError(null)
    try {
      await signInWithGoogle()
      setSessionCookie()
      router.push("/dashboard")
    } catch (err) {
      const code = (err as { code?: string }).code ?? ""
      if (code !== "auth/popup-closed-by-user") setError(mapError(code))
    } finally {
      setLoadingOAuth(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-8 text-center">
        <Link href="/" className="font-syne font-bold text-2xl text-ink">
          FISCALIZA
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 pt-4">
        <div className="w-full max-w-sm">
          <h1 className="font-syne font-bold text-2xl text-ink mb-1">
            Crear cuenta gratis
          </h1>
          <p className="text-sm text-muted mb-8">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-ink font-medium underline underline-offset-2">
              Inicia sesión
            </Link>
          </p>

          {isTesterSignup && (
            <div className="rounded-2xl bg-ink/5 border border-ink/10 px-4 py-3 mb-6 text-lg text-ink">
              Registrándote como tester 🎉 — Podrás activar tu MES GRATIS del plan Pro con el botón "Activar mi mes gratis" en la configuración de tu cuenta.
              <br />
              <span className="text-xs font-medium">Recuerda: Tienes un año para activarla.</span>
            </div>
          )}

          <Button
            variant="secondary"
            fullWidth
            size="lg"
            loading={loadingOAuth}
            onClick={handleGoogle}
            className="mb-6"
          >
            <GoogleIcon />
            Continuar con Google
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-black/8" />
            <span className="text-xs text-muted">o con email</span>
            <div className="flex-1 h-px bg-black/8" />
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-expired/10 border border-expired/20 px-4 py-3 text-sm text-expired">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">Nombre</label>
              <input
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 pr-12 text-sm text-ink placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center text-muted hover:text-ink"
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1 rounded-full bg-black/8 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength.color }}>
                    Contraseña {strength.label}
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
              Crear cuenta
            </Button>
          </form>
        </div>
      </main>

      <footer className="px-6 py-6 text-center">
        <p className="text-xs text-muted">
          Al registrarte, aceptas nuestra{" "}
          <Link href="#" className="underline underline-offset-2">política de privacidad</Link>
          {" "}y{" "}
          <Link href="#" className="underline underline-offset-2">términos de uso</Link>.
        </p>
      </footer>

      <TesterWelcomeModal
        open={showTesterModal}
        onClose={() => setShowTesterModal(false)}
        onComplete={handleTesterComplete}
      />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
