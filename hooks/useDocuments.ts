"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
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
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from("documents")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .eq("is_current", true)

      if (err) throw err
      setDocuments((data ?? []).map(enrichWithStatus))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar documentos")
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  const getSignedUrl = useCallback(async (storagePath: string): Promise<string | null> => {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(storagePath, 900) // 15 minutos

    if (error) return null
    return data.signedUrl
  }, [])

  const uploadDocument = useCallback(async ({
    vehicleId,
    type,
    file,
    expiresAt,
    issuedAt,
  }: UploadDocumentPayload) => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()

    if (!profile) throw new Error("Perfil no encontrado")

    const ext = file.name.split(".").pop() ?? "pdf"
    const path = `${profile.organization_id}/${vehicleId}/${type}/${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from("documents")
      .upload(path, file, { contentType: file.type })

    if (uploadErr) throw uploadErr

    const { error: insertErr } = await supabase.from("documents").insert({
      vehicle_id:      vehicleId,
      organization_id: profile.organization_id,
      type,
      storage_path:    path,
      file_name:       file.name,
      mime_type:       file.type,
      expires_at:      expiresAt ?? null,
      issued_at:       issuedAt ?? null,
      uploaded_by:     user.id,
    })

    if (insertErr) {
      // Limpiar el archivo subido si el insert falla
      await supabase.storage.from("documents").remove([path])
      throw insertErr
    }

    await fetchDocuments()
  }, [fetchDocuments])

  const deleteDocument = useCallback(async (docId: string, storagePath: string) => {
    const supabase = createClient()

    await supabase.storage.from("documents").remove([storagePath])

    const { error } = await supabase
      .from("documents")
      .update({ is_current: false })
      .eq("id", docId)

    if (error) throw error
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
