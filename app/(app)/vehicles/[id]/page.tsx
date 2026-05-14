"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useVehiclesStore } from "@/stores/vehiclesStore"
import { useDocuments } from "@/hooks/useDocuments"
import { getVehicle } from "@/lib/firebase/firestore"
import type { Vehicle } from "@/types/document.types"
import VehicleDetailSkeleton from "@/components/skeletons/VehicleDetailSkeleton"
import PageHeader from "@/components/layout/PageHeader"
import DocumentRow from "@/components/document/DocumentRow"
import DocumentUploadSlot from "@/components/document/DocumentUploadSlot"
import LicenciaUploadSlot from "@/components/document/LicenciaUploadSlot"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Spinner from "@/components/ui/Spinner"
import { toast } from "@/components/ui/Toast"
import { DOCUMENT_TYPE_ORDER, DOCUMENT_TYPE_LABELS, DUAL_SIDE_TYPES, type DocumentType } from "@/types/document.types"
import { formatPlate } from "@/lib/utils/plate.utils"
import { worstStatus, STATUS_COLOR, STATUS_LABEL } from "@/lib/utils/document.utils"

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router  = useRouter()

  const { vehicles, fetchVehiclesWithDocuments, deleteVehicle, refreshVehicleDocuments } = useVehiclesStore()
  const [fallbackVehicle, setFallbackVehicle] = useState<Vehicle | null>(null)
  const vehicle = vehicles.find((v) => v.id === id) ?? fallbackVehicle ?? null

  // Si el store no tiene el vehículo, cargarlo directamente
  useEffect(() => {
    if (!vehicles.find((v) => v.id === id)) {
      fetchVehiclesWithDocuments()
      getVehicle(id).then((v) => { if (v) setFallbackVehicle(v) })
    }
  }, [id, vehicles, fetchVehiclesWithDocuments])

  const {
    documents,
    loading: docsLoading,
    fetchDocuments,
    getSignedUrl,
    uploadDocument,
    uploadLicencia,
    deleteDocument,
    deleteAllByType,
    getDocumentByType,
    getDocumentBySide,
  } = useDocuments(id)

  const [activeDocType, setActiveDocType]     = useState<DocumentType | null>(null)
  const [docOptionsType, setDocOptionsType]   = useState<DocumentType | null>(null)
  const [showVehicleMenu, setShowVehicleMenu] = useState(false)
  const [showDeleteVehicle, setShowDeleteVehicle] = useState(false)
  const [showUpload, setShowUpload]           = useState<DocumentType | null>(null)
  const [uploadFile, setUploadFile]           = useState<File | null>(null)
  const [uploadFrontFile, setUploadFrontFile] = useState<File | null>(null)
  const [uploadBackFile, setUploadBackFile]   = useState<File | null>(null)
  const [uploadExpires, setUploadExpires]     = useState("")
  const [uploading, setUploading]             = useState(false)
  const [deletingDoc, setDeletingDoc]         = useState(false)
  const [deletingVehicle, setDeletingVehicle] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  if (!vehicle) {
    return <VehicleDetailSkeleton />
  }

  const worst = worstStatus(documents.map((d) => d.expiryStatus))
  const worstColor = STATUS_COLOR[worst]

  function closeUploadModal() {
    setShowUpload(null)
    setUploadFile(null)
    setUploadFrontFile(null)
    setUploadBackFile(null)
    setUploadExpires("")
  }

  async function handleUpload() {
    if (!showUpload) return
    setUploading(true)
    try {
      if (DUAL_SIDE_TYPES.includes(showUpload)) {
        if (!uploadFrontFile) return
        await uploadLicencia({
          vehicleId: id,
          frontFile: uploadFrontFile,
          backFile:  uploadBackFile,
          expiresAt: uploadExpires || undefined,
        })
      } else {
        if (!uploadFile) return
        await uploadDocument({
          vehicleId: id,
          type:      showUpload,
          file:      uploadFile,
          expiresAt: uploadExpires || undefined,
        })
      }
      toast("Documento cargado", "success")
      closeUploadModal()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al subir", "error")
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteDoc() {
    if (!docOptionsType) return
    setDeletingDoc(true)
    try {
      if (DUAL_SIDE_TYPES.includes(docOptionsType)) {
        // Eliminar ambos lados de la licencia
        await deleteAllByType(docOptionsType)
      } else {
        const doc = getDocumentByType(docOptionsType)
        if (!doc) return
        await deleteDocument(doc.id, doc.storage_path)
      }
      toast("Documento eliminado", "success")
      setDocOptionsType(null)
    } catch {
      toast("Error al eliminar", "error")
    } finally {
      setDeletingDoc(false)
    }
  }

  async function handleDeleteVehicle() {
    setDeletingVehicle(true)
    try {
      await deleteVehicle(id)
      toast("Vehículo eliminado", "success")
      router.push("/dashboard")
    } catch {
      toast("Error al eliminar vehículo", "error")
      setDeletingVehicle(false)
    }
  }

  const docOptionsDoc = docOptionsType ? getDocumentByType(docOptionsType) : null

  return (
    <div className="max-w-md mx-auto px-4">
      <PageHeader
        title={formatPlate(vehicle.plate)}
        back
        backHref="/dashboard"
        centered
        right={
          <button
            onClick={() => setShowVehicleMenu(true)}
            className="size-9 flex items-center justify-center rounded-full hover:bg-black/5 text-muted text-xl"
          >
            ⋮
          </button>
        }
      />

      {/* Hero */}
      <div className="py-6 flex items-center justify-between">
        <div>
          <p className="font-syne font-bold text-2xl text-ink">{vehicle.alias}</p>
          {(vehicle.brand || vehicle.model || vehicle.year) && (
            <p className="text-sm text-muted mt-0.5">
              {[vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(" ")}
            </p>
          )}
        </div>
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: worstColor + "20", color: worstColor }}
        >
          {STATUS_LABEL[worst]}
        </span>
      </div>

      {/* Documentos */}
      {docsLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="text-ink" />
        </div>
      ) : (
        <div className="divide-y divide-black/5">
          {DOCUMENT_TYPE_ORDER.map((type) => (
            <DocumentRow
              key={type}
              type={type}
              document={getDocumentByType(type)}
              hasBothSides={
                DUAL_SIDE_TYPES.includes(type) &&
                getDocumentBySide(type, "front") !== null &&
                getDocumentBySide(type, "back") !== null
              }
              onOptions={(t) => setDocOptionsType(t)}
              onClick={(t) => router.push(`/present/${id}/${t}`)}
            />
          ))}
        </div>
      )}

      {/* Botón modo presentación */}
      <Button
        fullWidth
        size="lg"
        className="mt-8"
        onClick={() => {
          const firstWithDoc = DOCUMENT_TYPE_ORDER.find(
            (t) => getDocumentByType(t) !== null
          )
          if (firstWithDoc) {
            router.push(`/present/${id}/${firstWithDoc}`)
          } else {
            toast("No hay documentos cargados aún", "info")
          }
        }}
      >
        Modo presentación
      </Button>

      {/* === Bottom sheet: opciones de documento === */}
      <Modal
        open={docOptionsType !== null}
        onClose={() => setDocOptionsType(null)}
        bottomSheet
      >
        <p className="font-syne font-bold text-base text-ink mb-4">
          {docOptionsType ? DOCUMENT_TYPE_LABELS[docOptionsType] : ""}
        </p>

        <div className="flex flex-col gap-2">
          {docOptionsDoc ? (
            <>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  if (docOptionsType) router.push(`/present/${id}/${docOptionsType}`)
                  setDocOptionsType(null)
                }}
              >
                Ver documento
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  if (docOptionsType) setShowUpload(docOptionsType)
                  setDocOptionsType(null)
                }}
              >
                Reemplazar
              </Button>
              <Button
                variant="danger"
                fullWidth
                loading={deletingDoc}
                onClick={handleDeleteDoc}
              >
                Eliminar
              </Button>
            </>
          ) : (
            <Button
              fullWidth
              onClick={() => {
                if (docOptionsType) setShowUpload(docOptionsType)
                setDocOptionsType(null)
              }}
            >
              Cargar documento
            </Button>
          )}
        </div>
      </Modal>

      {/* === Bottom sheet: subir documento === */}
      <Modal
        open={showUpload !== null}
        onClose={closeUploadModal}
        title={showUpload ? `Subir ${DOCUMENT_TYPE_LABELS[showUpload]}` : ""}
        bottomSheet
      >
        {showUpload && (
          <>
            {DUAL_SIDE_TYPES.includes(showUpload) ? (
              <LicenciaUploadSlot
                frontFile={uploadFrontFile}
                backFile={uploadBackFile}
                expiresAt={uploadExpires}
                onFrontChange={setUploadFrontFile}
                onBackChange={setUploadBackFile}
                onExpiresAtChange={setUploadExpires}
              />
            ) : (
              <DocumentUploadSlot
                type={showUpload}
                value={uploadFile}
                expiresAt={uploadExpires}
                onFileChange={(_, f) => setUploadFile(f)}
                onExpiresAtChange={(_, d) => setUploadExpires(d)}
              />
            )}
            <Button
              fullWidth
              size="lg"
              loading={uploading}
              disabled={DUAL_SIDE_TYPES.includes(showUpload) ? !uploadFrontFile : !uploadFile}
              onClick={handleUpload}
              className="mt-4"
            >
              Subir documento
            </Button>
          </>
        )}
      </Modal>

      {/* === Bottom sheet: opciones de vehículo === */}
      <Modal
        open={showVehicleMenu}
        onClose={() => setShowVehicleMenu(false)}
        bottomSheet
      >
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => { setShowVehicleMenu(false); router.push(`/vehicles/${id}/edit`) }}
          >
            Editar vehículo
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => { setShowVehicleMenu(false); setShowDeleteVehicle(true) }}
          >
            Eliminar vehículo
          </Button>
        </div>
      </Modal>

      {/* === Confirmar eliminar vehículo === */}
      <Modal
        open={showDeleteVehicle}
        onClose={() => setShowDeleteVehicle(false)}
        title="Eliminar vehículo"
      >
        <p className="text-sm text-muted mb-6">
          ¿Estás seguro? Se eliminarán todos los documentos de{" "}
          <strong>{vehicle.alias}</strong>. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowDeleteVehicle(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            fullWidth
            loading={deletingVehicle}
            onClick={handleDeleteVehicle}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
