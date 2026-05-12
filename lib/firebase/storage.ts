import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage"
import { firebaseApp } from "./config"

export const storage = getStorage(firebaseApp)

/**
 * Sube un archivo al bucket de documentos.
 * Path: documents/{orgId}/{vehicleId}/{docType}/{timestamp}.{ext}
 */
export async function uploadDocument(
  file:       File,
  orgId:      string,
  vehicleId:  string,
  docType:    string
): Promise<{ storagePath: string; downloadUrl: string }> {
  const ext         = file.name.split(".").pop() ?? "pdf"
  const storagePath = `documents/${orgId}/${vehicleId}/${docType}/${Date.now()}.${ext}`
  const storageRef  = ref(storage, storagePath)

  await uploadBytes(storageRef, file, { contentType: file.type })
  const downloadUrl = await getDownloadURL(storageRef)

  return { storagePath, downloadUrl }
}

/**
 * Elimina un archivo del storage dado su path.
 */
export async function deleteDocument(storagePath: string): Promise<void> {
  try {
    await deleteObject(ref(storage, storagePath))
  } catch {
    // Si ya no existe, ignorar
  }
}

/**
 * Obtiene la URL de descarga de un archivo (ya autenticada por Firebase).
 * Cacheable: Firebase Storage URLs no expiran por defecto.
 */
export async function getDocumentUrl(storagePath: string): Promise<string> {
  return getDownloadURL(ref(storage, storagePath))
}
