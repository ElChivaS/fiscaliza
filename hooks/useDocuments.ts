"use client"

import { useState, useCallback } from "react"
import { auth } from "@/lib/firebase/auth"
import {
  getDocumentsForVehicle,
  getProfile,
  insertDocument,
  retireDocument,
} from "@/lib/firebase/firestore"
import { uploadDocument as uploadToStorage, deleteDocument as deleteFromStorage, getDocumentUrl } from "@/lib/firebase/storage"
import { enrichWithStatus } from "@/lib/utils/document.utils"
import type { DocumentWithStatus, DocumentType, UploadDocumentPayload } from "@/types/document.types"

export function useDocuments(vehicleId: string) {
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const user = auth.currentUser
      if (!user) throw new Error("No autenticado")
      const profile = await getProfile(user.uid)
      if (!profile) throw new Error("Perfil no encontrado")
      const docs = await getDocumentsForVehicle(vehicleId, profile.organization_id)
      setDocuments(docs.map(enrichWithStatus))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar documentos")
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  const getSignedUrl = useCallback(async (storagePath: string): Promise<string | null> => {
    try {
      return await getDocumentUrl(storagePath)
    } catch {
      return null
    }
  }, [])

  const uploadDocument = useCallback(async ({
    vehicleId,
    type,
    file,
    side,
    expiresAt,
    issuedAt,
  }: UploadDocumentPayload) => {
    const user = auth.currentUser
    if (!user) throw new Error("No autenticado")

    const profile = await getProfile(user.uid)
    if (!profile) throw new Error("Perfil no encontrado")

    const { storagePath } = await uploadToStorage(file, profile.organization_id, vehicleId, type)

    await insertDocument({
      vehicleId,
      orgId:       profile.organization_id,
      type,
      side:        side ?? null,
      storagePath,
      fileName:    file.name,
      mimeType:    file.type,
      expiresAt:   expiresAt ?? null,
      issuedAt:    issuedAt ?? null,
      uploadedBy:  user.uid,
    })

    await fetchDocuments()
  }, [fetchDocuments])

  /**
   * Sube frente y reverso de la licencia en una sola operación.
   * El reverso es opcional.
   */
  const uploadLicencia = useCallback(async ({
    vehicleId,
    frontFile,
    backFile,
    expiresAt,
  }: {
    vehicleId:  string
    frontFile:  File
    backFile:   File | null
    expiresAt?: string
  }) => {
    const user = auth.currentUser
    if (!user) throw new Error("No autenticado")

    const profile = await getProfile(user.uid)
    if (!profile) throw new Error("Perfil no encontrado")

    // Subir frente
    const { storagePath: frontPath } = await uploadToStorage(frontFile, profile.organization_id, vehicleId, "licencia")
    await insertDocument({
      vehicleId,
      orgId:      profile.organization_id,
      type:       "licencia",
      side:       "front",
      storagePath: frontPath,
      fileName:   frontFile.name,
      mimeType:   frontFile.type,
      expiresAt:  expiresAt ?? null,
      uploadedBy: user.uid,
    })

    // Subir reverso si existe
    if (backFile) {
      const { storagePath: backPath } = await uploadToStorage(backFile, profile.organization_id, vehicleId, "licencia")
      await insertDocument({
        vehicleId,
        orgId:      profile.organization_id,
        type:       "licencia",
        side:       "back",
        storagePath: backPath,
        fileName:   backFile.name,
        mimeType:   backFile.type,
        expiresAt:  expiresAt ?? null,
        uploadedBy: user.uid,
      })
    }

    await fetchDocuments()
  }, [fetchDocuments])

  const deleteDocument = useCallback(async (docId: string, storagePath: string) => {
    await Promise.all([
      deleteFromStorage(storagePath),
      retireDocument(docId),
    ])
    await fetchDocuments()
  }, [fetchDocuments])

  /**
   * Elimina todos los documentos actuales de un tipo (útil para licencia con dos lados).
   */
  const deleteAllByType = useCallback(async (type: DocumentType) => {
    const toDelete = documents.filter((d) => d.type === type)
    await Promise.all(
      toDelete.map((d) => Promise.all([
        deleteFromStorage(d.storage_path),
        retireDocument(d.id),
      ]))
    )
    await fetchDocuments()
  }, [documents, fetchDocuments])

  /** Retorna el documento de un tipo (para tipos simples, o el frente de licencia) */
  const getDocumentByType = useCallback((type: DocumentType): DocumentWithStatus | null => {
    const docs = documents.filter((d) => d.type === type)
    if (docs.length === 0) return null
    // Para licencia, prefiere el frente; si no, el primero disponible
    return docs.find((d) => d.side === "front" || d.side === null) ?? docs[0]
  }, [documents])

  /** Retorna el documento de un lado específico (solo aplica a licencia) */
  const getDocumentBySide = useCallback((type: DocumentType, side: "front" | "back"): DocumentWithStatus | null => {
    return documents.find((d) => d.type === type && d.side === side) ?? null
  }, [documents])

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    getSignedUrl,
    uploadDocument,
    uploadLicencia,
    deleteDocument,
    deleteAllByType,
    getDocumentByType,
    getDocumentBySide,
  }
}
