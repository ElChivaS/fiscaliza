"use client"

import { useState } from "react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import FloatingInput from "@/components/ui/FloatingInput"
import { createTesterLead } from "@/lib/firebase/firestore"

interface TesterWelcomeModalProps {
  open: boolean
  onClose: () => void
  onComplete: (data: { fullName: string; email: string }) => void
}

export default function TesterWelcomeModal({ open, onClose, onComplete }: TesterWelcomeModalProps) {
  const [firstName, setFirstName]     = useState("")
  const [lastName, setLastName]       = useState("")
  const [email, setEmail]             = useState("")
  const [vehicleNote, setVehicleNote] = useState("")
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const canSubmit = firstName.trim() && lastName.trim() && email.trim() && vehicleNote.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`
      await createTesterLead({ fullName, email: email.trim(), vehicleNote: vehicleNote.trim() })
      onComplete({ fullName, email: email.trim() })
    } catch {
      setError("No pudimos guardar tus datos. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} bottomSheet>
      <div className="flex flex-col gap-1 mb-5 text-center">
        <p className="text-3xl">🎉</p>
        <h2 className="font-syne font-bold text-xl text-ink">¡Bienvenido, tester!</h2>
        <p className="text-sm text-muted">
          Gracias por ayudarnos a probar <b>FISCALIZA</b>. Como agradecimiento, vas a poder activar
          un mes gratis del plan Pro cuando quieras, dentro del próximo año. Antes de
          registrarte, cuéntanos un poco de ti.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-xl bg-expired/10 border border-expired/20 px-4 py-3 text-sm text-expired">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <FloatingInput
              label="Nombre"
              type="text"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={setFirstName}
              placeholder="Juan"
            />
          </div>
          <div className="flex-1">
            <FloatingInput
              label="Apellido"
              type="text"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={setLastName}
              placeholder="Pérez"
            />
          </div>
        </div>

        <FloatingInput
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={setEmail}
          placeholder="tu@email.com"
        />

        <FloatingInput
          label="¿Qué vehículo vas a probar?"
          type="text"
          required
          value={vehicleNote}
          onChange={setVehicleNote}
          placeholder="Ej: Toyota Corolla 2019"
        />

        <Button type="submit" fullWidth size="lg" loading={loading} disabled={!canSubmit} className="mt-2">
          Continuar al registro
        </Button>
      </form>
    </Modal>
  )
}
