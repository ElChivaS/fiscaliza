import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Protección de rutas vía cookie de sesión Firebase.
 * La cookie "fiscaliza-session" se establece en el cliente tras un login exitoso
 * y se elimina al hacer logout.
 * La validación real de seguridad ocurre en las Firestore Security Rules.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session      = request.cookies.get("fiscaliza-session")?.value

  const isAuthRoute  = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isPublic     = pathname === "/" ||
                       pathname.startsWith("/auth/") ||
                       pathname.startsWith("/_next") ||
                       pathname.startsWith("/api") ||
                       pathname.startsWith("/qr")

  // No autenticado → redirigir a login
  if (!session && !isAuthRoute && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Autenticado → redirigir desde auth pages al dashboard
  if (session && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-.*\\.png).*)",
  ],
}
