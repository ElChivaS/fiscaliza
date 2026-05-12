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
      const docs = await getDocumentsForVehicle(vehicleId)
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
      storagePath,
      fileName:    file.name,
      mimeType:    file.type,
      expiresAt:   expiresAt ?? null,
      issuedAt:    issuedAt ?? null,
      uploadedBy:  user.uid,
    })

    await fetchDocuments()
  }, [fetchDocuments])

  const deleteDocument = useCallback(async (docId: string, storagePath: string) => {
    await Promise.all([
      deleteFromStorage(storagePath),
      retireDocument(docId),
    ])
    await fetchDocuments()
  }, [fetchDocuments])

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    getSignedUrl,
    uploadDocument,
    deleteDocument,
    getDocumentByType: (type: DocumentType) =>
      documents.find((d) => d.type === type) ?? null,
  }
}
