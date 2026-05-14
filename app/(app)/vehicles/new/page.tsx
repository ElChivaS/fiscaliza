"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useVehiclesStore } from "@/stores/vehiclesStore"
import { useOrganization } from "@/hooks/useOrganization"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import DocumentUploadSlot from "@/components/document/DocumentUploadSlot"
import LicenciaUploadSlot from "@/components/document/LicenciaUploadSlot"
import BrandPicker from "@/components/vehicle/BrandPicker"
import ModelPicker from "@/components/vehicle/ModelPicker"
import { DOCUMENT_TYPE_ORDER, DUAL_SIDE_TYPES } from "@/types/document.types"
import { isValidPlate, normalizePlate } from "@/lib/utils/plate.utils"
import { toast } from "@/components/ui/Toast"
import type { DocumentType } from "@/types/document.types"
import type { VehicleBrand, VehicleModel, VehicleCategory } from "@/lib/data/vehicles"

type Step = 1 | 2

export default function NewVehiclePage() {
  const router        = useRouter()
  const { createVehicle, checkPlateExists } = useVehiclesStore()
  const { planLimits } = useOrganization()

  const [step, setStep]       = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

  // Paso 1 — datos
  const [category, setCategory]     = useState<VehicleCategory>("auto")
  const [plate, setPlate]           = useState("")
  const [plateError, setPlateError] = useState<string | null>(null)
  const [plateChecking, setPlateChecking] = useState(false)
  const [alias, setAlias]           = useState("")
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrand | null>(null)
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null)
  const [customModel, setCustomModel]     = useState("")  // para marca "Otro"
  const [year, setYear]             = useState("")

  // Paso 2 — documentos
  const [files, setFiles]           = useState<Partial<Record<DocumentType, File>>>({})
  const [expires, setExpires]       = useState<Partial<Record<DocumentType, string>>>({})
  const [licenciaFront, setLicenciaFront] = useState<File | null>(null)
  const [licenciaBack, setLicenciaBack]   = useState<File | null>(null)
  const [uploading, setUploading]   = useState(false)

  // Debounce plate check
  useEffect(() => {
    if (!plate || !isValidPlate(plate)) { setPlateError(null); return }
    const timer = setTimeout(async () => {
      setPlateChecking(true)
      const exists = await checkPlateExists(plate)
      if (exists) setPlateError("Esta patente ya está registrada.")
      else setPlateError(null)
      setPlateChecking(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [plate, checkPlateExists])

  function handleCategoryChange(cat: VehicleCategory) {
    setCategory(cat)
    setSelectedBrand(null)
    setSelectedModel(null)
    setCustomModel("")
  }

  function handleBrandSelect(brand: VehicleBrand) {
    setSelectedBrand(brand)
    setSelectedModel(null)
    setCustomModel("")
  }

  function handleModelSelect(model: VehicleModel) {
    setSelectedModel(model)
  }

  const handleStep1 = async () => {
    if (!alias.trim()) { toast("El alias es obligatorio", "error"); return }
    if (!isValidPlate(plate)) { toast(category === "moto" ? "Patente inválida (ej: JRH017)" : "Patente inválida (ej: BBXX00 o AB1234)", "error"); return }
    if (plateError) { toast(plateError, "error"); return }

    const modelName = selectedBrand?.name === "Otro"
      ? customModel.trim()
      : selectedModel?.name

    setLoading(true)
    try {
      const id = await createVehicle({
        alias:     alias.trim(),
        plate:     normalizePlate(plate),
        brand:     selectedBrand?.name !== "Otro" ? selectedBrand?.name : undefined,
        model:     modelName || undefined,
        year:      year ? parseInt(year) : undefined,
        body_type: selectedModel?.bodyType ?? undefined,
        category,
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
    const hasLicencia = !!licenciaFront

    if (types.length === 0 && !hasLicencia) { router.push(`/vehicles/${createdId}`); return }

    setUploading(true)
    try {
      const { auth: fbAuth }                    = await import("@/lib/firebase/auth")
      const { getProfile, insertDocument }      = await import("@/lib/firebase/firestore")
      const { uploadDocument: uploadToStorage } = await import("@/lib/firebase/storage")

      const user    = fbAuth.currentUser
      if (!user) throw new Error("No autenticado")
      const profile = await getProfile(user.uid)
      if (!profile) throw new Error("Perfil no encontrado")

      // Licencia (frente + reverso opcional)
      if (licenciaFront) {
        const { storagePath } = await uploadToStorage(licenciaFront, profile.organization_id, createdId!, "licencia")
        await insertDocument({
          vehicleId:  createdId!,
          orgId:      profile.organization_id,
          type:       "licencia",
          side:       "front",
          storagePath,
          fileName:   licenciaFront.name,
          mimeType:   licenciaFront.type,
          expiresAt:  expires["licencia"] ?? null,
          uploadedBy: user.uid,
        })
        if (licenciaBack) {
          const { storagePath: backPath } = await uploadToStorage(licenciaBack, profile.organization_id, createdId!, "licencia")
          await insertDocument({
            vehicleId:  createdId!,
            orgId:      profile.organization_id,
            type:       "licencia",
            side:       "back",
            storagePath: backPath,
            fileName:   licenciaBack.name,
            mimeType:   licenciaBack.type,
            expiresAt:  expires["licencia"] ?? null,
            uploadedBy: user.uid,
          })
        }
      }

      // Resto de documentos (sin side)
      for (const type of types) {
        const file = files[type]!
        const { storagePath } = await uploadToStorage(file, profile.organization_id, createdId!, type)
        await insertDocument({
          vehicleId:  createdId!,
          orgId:      profile.organization_id,
          type,
          storagePath,
          fileName:   file.name,
          mimeType:   file.type,
          expiresAt:  expires[type] ?? null,
          uploadedBy: user.uid,
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

  const canContinue = !!alias && !!plate && !plateError && !plateChecking

  return (
    <div className="max-w-md mx-auto px-4">
      <PageHeader title="Nuevo vehículo" back />

      {/* Progress bar */}
      <div className="h-1 bg-black/8 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-ink rounded-full transition-all duration-500"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>

      <p className="text-xs text-muted mb-6">
        Paso {step} de 2 — {step === 1 ? "Datos del vehículo" : "Documentos (opcional)"}
      </p>

      {step === 1 ? (
        <div className="flex flex-col gap-5">
          {/* Categoría */}
          <div>
            <label className="text-xs font-medium text-muted mb-2 block">Tipo de vehículo</label>
            <div className="grid grid-cols-2 gap-2">
              {(["auto", "moto"] as VehicleCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={[
                    "h-12 rounded-2xl border text-sm font-medium transition-all",
                    category === cat
                      ? "border-ink bg-ink text-cream"
                      : "border-black/10 bg-surface text-muted hover:border-black/20",
                  ].join(" ")}
                >
                  {cat === "auto" ? "🚗 Auto" : "🏍 Moto"}
                </button>
              ))}
            </div>
          </div>

          {/* Patente */}
          <Field label="Patente *" hint={category === "moto" ? "Formato moto: LLL000 (ej: JRH017)" : "Formato chileno: BBXX00 o AB1234"}>
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
            {plateError && <p className="text-xs text-expired mt-1">{plateError}</p>}
          </Field>

          {/* Alias */}
          <Field label="Alias *" hint="Ej: Mi Corolla, Camioneta de trabajo">
            <input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Mi auto"
              className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </Field>

          {/* Marca */}
          <Field label="Marca">
            <BrandPicker
              value={selectedBrand?.name ?? ""}
              category={category}
              onChange={handleBrandSelect}
            />
          </Field>

          {/* Modelo — solo si hay marca seleccionada */}
          {selectedBrand && (
            <Field label="Modelo">
              {selectedBrand.name === "Otro" ? (
                <input
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="Ej: Hilux"
                  className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              ) : (
                <ModelPicker
                  brand={selectedBrand}
                  value={selectedModel?.name ?? ""}
                  onChange={handleModelSelect}
                />
              )}
            </Field>
          )}

          {/* Año */}
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
            disabled={!canContinue}
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

          {DOCUMENT_TYPE_ORDER.map((type) =>
            DUAL_SIDE_TYPES.includes(type) ? (
              <div key={type}>
                <p className="text-xs font-medium text-muted mb-2">Licencia de conducir</p>
                <LicenciaUploadSlot
                  frontFile={licenciaFront}
                  backFile={licenciaBack}
                  expiresAt={expires["licencia"] ?? ""}
                  onFrontChange={setLicenciaFront}
                  onBackChange={setLicenciaBack}
                  onExpiresAtChange={(d) => setExpires((prev) => ({ ...prev, licencia: d }))}
                />
              </div>
            ) : (
              <DocumentUploadSlot
                key={type}
                type={type}
                value={files[type] ?? null}
                expiresAt={expires[type] ?? ""}
                onFileChange={handleFile}
                onExpiresAtChange={handleExpires}
              />
            )
          )}

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
              {Object.keys(files).length > 0 || licenciaFront ? "Guardar documentos" : "Finalizar"}
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
      <label className="text-xs font-medium text-muted mb-2 block">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  )
}
