import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth"
import { firebaseApp } from "./config"
import { createUserProfile, logActivity } from "./firestore"

export const auth = getAuth(firebaseApp)

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider)
  // Crear perfil si es la primera vez
  const { organizationId, fullName } = await createUserProfile(result.user)
  await logActivity({ orgId: organizationId, userId: result.user.uid, userName: fullName, action: "login" })
  return result.user
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password)
  // Crear perfil si no existe (p.ej. si falló durante el registro)
  const { organizationId, fullName } = await createUserProfile(result.user)
  await logActivity({ orgId: organizationId, userId: result.user.uid, userName: fullName, action: "login" })
  return result.user
}

export async function registerWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName: fullName })
  // Crear organización y perfil automáticamente
  const { organizationId, fullName: profileName } = await createUserProfile(result.user, fullName)
  await logActivity({ orgId: organizationId, userId: result.user.uid, userName: profileName, action: "login" })
  return result.user
}

export async function sendResetEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export async function logout(): Promise<void> {
  await signOut(auth)
  // Limpiar cookie de sesión
  document.cookie = "fiscaliza-session=; path=/; max-age=0"
}

export { onAuthStateChanged, type User }
