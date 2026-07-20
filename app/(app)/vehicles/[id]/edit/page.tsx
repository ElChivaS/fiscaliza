"use client"

import { use, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useVehiclesStore } from "@/stores/vehiclesStore"
import { uploadDocument } from "@/lib/firebase/storage"
import { updateVehiclePhoto } from "@/lib/firebase/firestore"
import PageHeader from "@/components/layout/PageHeader"
import Button from "@/components/ui/Button"
import { toast } from "@/components/ui/Toast"
import { formatPlate } from "@/lib/utils/plate.utils"

export default function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router  = useRouter()

  const { vehicles, updateVehicle } = useVehiclesStore()
  const vehicle = vehicles.find((v) => v.id === id)

  const [alias, setAlias] = useState(vehicle?.alias ?? "")
  const [brand, setBrand] = useState(vehicle?.brand ?? "")
  const [model, setModel] = useState(vehicle?.model ?? "")
  const [year, setYear]   = useState(vehicle?.year?.toString() ?? "")
  const [saving, setSaving] = useState(false)

  const [uploadingPhoto, setUploadingPhoto]           = useState(false)
  const [uploadingPlatePhoto, setUploadingPlatePhoto] = useState(false)
  const photoInputRef      = useRef<HTMLInputElement>(null)
  const platePhotoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (vehicle) {
      setAlias(vehicle.alias)
      setBrand(vehicle.brand ?? "")
      setModel(vehicle.model ?? "")
      setYear(vehicle.year?.toString() ?? "")
    }
  }, [vehicle])

  const isDirty =
    alias !== (vehicle?.alias ?? "") ||
    brand !== (vehicle?.brand ?? "") ||
    model !== (vehicle?.model ?? "") ||
    year  !== (vehicle?.year?.toString() ?? "")

  async function handleSave() {
    if (!alias.trim()) { toast("El alias es obligatorio", "error"); return }
    setSaving(true)
    try {
      await updateVehicle(id, {
        alias: alias.trim(),
        brand: brand || undefined,
        model: model || undefined,
        year:  year ? parseInt(year) : undefined,
      })
      toast("Cambios guardados", "success")
      router.push(`/vehicles/${id}`)
    } catch {
      toast("Error al guardar", "error")
    } finally {
      setSaving(false)
    }
  }

  async function handlePhotoChange(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "photo" | "plate"
  ) {
    const file = e.target.files?.[0]
    if (!file || !vehicle) return

    const setUploading = kind === "photo" ? setUploadingPhoto : setUploadingPlatePhoto
    setUploading(true)
    try {
      const { downloadUrl } = await uploadDocument(
        file,
        vehicle.organization_id,
        id,
        kind === "photo" ? "vehicle_photo" : "plate_photo"
      )
      await updateVehiclePhoto(id, kind === "photo" ? { photo_url: downloadUrl } : { plate_photo_url: downloadUrl })

      useVehiclesStore.setState((s) => ({
        vehicles: s.vehicles.map((v) =>
          v.id === id
            ? { ...v, ...(kind === "photo" ? { photo_url: downloadUrl } : { plate_photo_url: downloadUrl }) }
            : v
        ),
      }))

      toast(kind === "photo" ? "Foto actualizada" : "Foto de patente actualizada", "success")
    } catch {
      toast("Error al subir la foto", "error")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  if (!vehicle) {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="max-w-md mx-auto px-4">
      <PageHeader title="Editar vehículo" back backHref={`/vehicles/${id}`} />

      <div className="py-6 flex flex-col gap-4">
        {/* Patente — solo lectura */}
        <div>
          <label className="text-xs font-medium text-muted mb-1.5 block">Patente</label>
          <div className="w-full h-12 rounded-2xl border border-black/5 bg-black/3 px-4 flex items-center">
            <span className="font-syne font-bold text-ink tracking-widest">
              {formatPlate(vehicle.plate)}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            La patente no puede modificarse una vez registrada.
          </p>
        </div>

        {/* Foto del vehículo */}
        <div>
          <label className="text-xs font-medium text-muted mb-1.5 block">Foto del vehículo</label>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoChange(e, "photo")}
          />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="w-full h-32 rounded-2xl border border-dashed border-black/15 bg-black/3 flex items-center justify-center overflow-hidden relative"
          >
            {vehicle.photo_url ? (
              <Image src={vehicle.photo_url} alt="Foto del vehículo" fill className="object-cover" />
            ) : (
              <span className="text-xs text-muted">
                {uploadingPhoto ? "Subiendo..." : "Toca para subir una foto"}
              </span>
            )}
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="size-5 rounded-full border-2 border-white border-t-transparent animate-spin block" />
              </div>
            )}
          </button>
        </div>

        {/* Foto de la patente (opcional) */}
        <div>
          <label className="text-xs font-medium text-muted mb-1.5 block">Foto de la patente (opcional)</label>
          <input
            ref={platePhotoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoChange(e, "plate")}
          />
          <button
            type="button"
            onClick={() => platePhotoInputRef.current?.click()}
            disabled={uploadingPlatePhoto}
            className="w-full h-20 rounded-2xl border border-dashed border-black/15 bg-black/3 flex items-center justify-center overflow-hidden relative"
          >
            {vehicle.plate_photo_url ? (
              <Image src={vehicle.plate_photo_url} alt="Foto de la patente" fill className="object-cover" />
            ) : (
              <span className="text-xs text-muted">
                {uploadingPlatePhoto ? "Subiendo..." : "Toca para subir una foto"}
              </span>
            )}
            {uploadingPlatePhoto && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="size-5 rounded-full border-2 border-white border-t-transparent animate-spin block" />
              </div>
            )}
          </button>
        </div>

        <div>
          <label className="text-xs font-medium text-muted mb-1.5 block">Alias *</label>
          <input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Mi auto"
            className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted mb-1.5 block">Marca</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Toyota"
              className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted mb-1.5 block">Modelo</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Corolla"
              className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted mb-1.5 block">Año</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2020"
            min="1900"
            max={new Date().getFullYear() + 1}
            className="w-full h-12 rounded-2xl border border-black/10 bg-surface px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            disabled={!isDirty}
            onClick={() => {
              if (vehicle) {
                setAlias(vehicle.alias)
                setBrand(vehicle.brand ?? "")
                setModel(vehicle.model ?? "")
                setYear(vehicle.year?.toString() ?? "")
              }
            }}
          >
            Descartar
          </Button>
          <Button
            size="lg"
            className="flex-1"
            loading={saving}
            disabled={!isDirty || !alias.trim()}
            onClick={handleSave}
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  )
}
