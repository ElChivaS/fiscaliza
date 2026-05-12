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
import { createUserProfile } from "./firestore"

export const auth = getAuth(firebaseApp)

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider)
  // Crear perfil si es la primera vez
  await createUserProfile(result.user)
  return result.user
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password)
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
  await createUserProfile(result.user, fullName)
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
