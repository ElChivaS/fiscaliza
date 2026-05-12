/**
 * Firebase Admin SDK — solo para uso server-side (Route Handlers, Server Components).
 * No importar en código cliente.
 */
import { getApps, initializeApp, cert, getApp, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

function getAdminApp(): App {
  if (getApps().length > 0) return getApp()

  const serviceAccount = process.env.FIREBASE_ADMIN_SDK_JSON
    ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON)
    : undefined

  if (serviceAccount) {
    return initializeApp({ credential: cert(serviceAccount) })
  }

  // Fallback para entornos con Application Default Credentials (Google Cloud)
  return initializeApp()
}

export const adminAuth = getAuth(getAdminApp())

export async function verifySessionToken(token: string | undefined) {
  if (!token) return null
  try {
    return await adminAuth.verifyIdToken(token)
  } catch {
    return null
  }
}
