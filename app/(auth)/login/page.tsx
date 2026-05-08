"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Button from "@/components/ui/Button"

const SUPABASE_ERRORS: Record<string, string> = {
  "Invalid login credentials": "Email o contraseña incorrectos.",
  "Email not confirmed":        "Debes confirmar tu email antes de ingresar.",
  "Too many requests":          "Demasiados intentos. Espera unos minutos.",
}

function mapError(msg: string): string {
  for (const [key, val] of Object.entries(SUPABASE_ERRORS)) {
    if (msg.includes(key)) return val
  }
  return "Ocurrió un error. Intenta de nuevo."
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]         = useState("")
  const [password, setPassword]   = useState("")
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [loadingOAuth, setLoadingOAuth] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError(mapError(err.message))
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  async function handleGoogle() {
    setLoadingOAuth(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-8 text-center">
        <Link href="/" className="font-syne font-bold text-2xl text-ink">
          FISCALIZA
        </Link>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-start justify-center px-6 pt-4">
        <div className="w-full max-w-sm">
          <h1 className="font-syne font-bold text-2xl text-ink mb-1">
            Bienvenido de vuelta
          </h1>
          <p className="text-sm text-muted mb-8">
            No tienes cuenta?{" "}
            <Link href="/register" className="text-ink font-medium underline underline-offset-2">
              Regístrate gratis
            </Link>
          </p>

          {/* Google OAuth */}
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

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-black/8" />
            <span className="text-xs text-muted">o con email</span>
            <div className="flex-1 h-px bg-black/8" />
          </div>

          {/* Email/pass form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-expired/10 border border-expired/20 px-4 py-3 text-sm text-expired">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 pr-12 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center text-muted hover:text-ink"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Iniciar sesión
            </Button>
          </form>
        </div>
      </main>

      {/* Footer legal */}
      <footer className="px-6 py-6 text-center">
        <p className="text-xs text-muted">
          Al continuar, aceptas nuestra{" "}
          <Link href="#" className="underline underline-offset-2">
            política de privacidad
          </Link>{" "}
          y{" "}
          <Link href="#" className="underline underline-offset-2">
            términos de uso
          </Link>
          .
        </p>
      </footer>
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
