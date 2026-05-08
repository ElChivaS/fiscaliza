"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useVehiclesStore } from "@/stores/vehiclesStore"
import { useOrganization } from "@/hooks/useOrganization"
import { useDocuments } from "@/hooks/useDocuments"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import DocumentUploadSlot from "@/components/document/DocumentUploadSlot"
import { DOCUMENT_TYPE_ORDER } from "@/types/document.types"
import { isValidPlate, normalizePlate } from "@/lib/utils/plate.utils"
import { toast } from "@/components/ui/Toast"
import type { DocumentType } from "@/types/document.types"

type Step = 1 | 2

export default function NewVehiclePage() {
  const router        = useRouter()
  const { createVehicle, checkPlateExists } = useVehiclesStore()
  const { planLimits, organization } = useOrganization()

  const [step, setStep]       = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

  // Paso 1
  const [plate, setPlate]       = useState("")
  const [plateError, setPlateError] = useState<string | null>(null)
  const [plateChecking, setPlateChecking] = useState(false)
  const [alias, setAlias]       = useState("")
  const [brand, setBrand]       = useState("")
  const [model, setModel]       = useState("")
  const [year, setYear]         = useState("")

  // Paso 2 — documentos
  const [files, setFiles]       = useState<Partial<Record<DocumentType, File>>>({})
  const [expires, setExpires]   = useState<Partial<Record<DocumentType, string>>>({})
  const [uploading, setUploading] = useState(false)

  // Debounce plate check
  useEffect(() => {
    if (!plate || !isValidPlate(plate)) return
    const timer = setTimeout(async () => {
      setPlateChecking(true)
      const exists = await checkPlateExists(plate)
      if (exists) setPlateError("Esta patente ya está registrada.")
      else setPlateError(null)
      setPlateChecking(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [plate, checkPlateExists])

  const handleStep1 = async () => {
    if (!alias.trim()) { toast("El alias es obligatorio", "error"); return }
    if (!isValidPlate(plate)) { toast("Patente inválida (ej: BBXX00 o AB1234)", "error"); return }
    if (plateError) { toast(plateError, "error"); return }

    setLoading(true)
    try {
      const id = await createVehicle({
        alias: alias.trim(),
        plate: normalizePlate(plate),
        brand: brand || undefined,
        model: model || undefined,
        year:  year ? parseInt(year) : undefined,
      })
      setCreatedId(id)
      setStep(2)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear vehículo"
      if (msg === "vehicle_limit_reached") {
        toast("Límite del plan alcanzado. Mejora tu plan para agregar más vehículos.", "error")
      } else {
        toast(msg, "error")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFile = useCallback((type: DocumentType, file: File | null) => {
    setFiles((prev) => {
      const next = { ...prev }
      if (file) next[type] = file
      else delete next[type]
      return next
    })
  }, [])

  const handleExpires = useCallback((type: DocumentType, date: string) => {
    setExpires((prev) => ({ ...prev, [type]: date }))
  }, [])

  const handleStep2 = async () => {
    if (!createdId) return
    const types = Object.keys(files) as DocumentType[]
    if (types.length === 0) {
      router.push(`/vehicles/${createdId}`)
      return
    }

    setUploading(true)
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile }  = await supabase.from("profiles").select("organization_id").eq("id", user!.id).single()

      for (const type of types) {
        const file = files[type]!
        const ext  = file.name.split(".").pop() ?? "pdf"
        const path = `${profile!.organization_id}/${createdId}/${type}/${Date.now()}.${ext}`

        await supabase.storage.from("documents").upload(path, file, { contentType: file.type })

        await supabase.from("documents").insert({
          vehicle_id:      createdId,
          organization_id: profile!.organization_id,
          type,
          storage_path:    path,
          file_name:       file.name,
          mime_type:       file.type,
          expires_at:      expires[type] ?? null,
          uploaded_by:     user!.id,
        })
      }

      toast("Vehículo creado con documentos", "success")
      router.push(`/vehicles/${createdId}`)
    } catch {
      toast("Error al subir documentos, pero el vehículo fue creado.", "error")
      router.push(`/vehicles/${createdId}`)
    } finally {
      setUploading(false)
    }
  }

  const vehicleLimit = planLimits?.max_vehicles ?? 1
  const isLimited = vehicleLimit !== -1

  return (
    <div className="max-w-md mx-auto px-4">
      <PageHeader title="Nuevo vehículo" back />

      {/* Progress bar */}
      <div className="h-1 bg-black/8 rounded-full mx-0 mb-8 overflow-hidden">
        <div
          className="h-full bg-ink rounded-full transition-all duration-500"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>

      <p className="text-xs text-muted mb-6">
        Paso {step} de 2 — {step === 1 ? "Datos del vehículo" : "Documentos (opcional)"}
      </p>

      {step === 1 ? (
        <div className="flex flex-col gap-4">
          <Field label="Patente *" hint="Formato chileno: BBXX00 o AB1234">
            <div className="relative">
              <input
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="AAAA00"
                maxLength={6}
                className={[
                  "w-full h-12 rounded-2xl border bg-surface px-4 text-sm text-ink font-syne font-bold tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-ink/20 uppercase",
                  plateError ? "border-expired" : "border-black/10",
                ].join(" ")}
              />
              {plateChecking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="size-4 rounded-full border-2 border-ink border-t-transparent animate-spin block" />
                </div>
              )}
            </div>
            {plateError && (
              <p className="text-xs text-expired mt-1">{plateError}</p>
            )}
          </Field>

          <Field label="Alias *" hint="Ej: Mi Corolla, Camioneta de trabajo">
            <input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Mi auto"
              className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Toyota"
                className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </Field>
            <Field label="Modelo">
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Corolla"
                className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </Field>
          </div>

          <Field label="Año">
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2020"
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </Field>

          <Button
            fullWidth
            size="lg"
            loading={loading}
            onClick={handleStep1}
            disabled={!alias || !plate || !!plateError || plateChecking}
            className="mt-2"
          >
            Continuar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Carga ahora o más tarde desde el detalle del vehículo.
          </p>

          {DOCUMENT_TYPE_ORDER.map((type) => (
            <DocumentUploadSlot
              key={type}
              type={type}
              value={files[type] ?? null}
              expiresAt={expires[type] ?? ""}
              onFileChange={handleFile}
              onExpiresAtChange={handleExpires}
            />
          ))}

          <div className="flex gap-3 mt-2">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => router.push(`/vehicles/${createdId}`)}
            >
              Omitir
            </Button>
            <Button
              size="lg"
              className="flex-1"
              loading={uploading}
              onClick={handleStep2}
            >
              {Object.keys(files).length > 0 ? "Guardar documentos" : "Finalizar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted mb-1.5 block">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  )
}
