"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import { getQrShare } from "@/lib/firebase/firestore"
import type { QrShare } from "@/types/document.types"
import { qrShareDocStatus, formatQrShareExpiry } from "@/lib/utils/qr-share.utils"
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/utils/document.utils"
import { formatPlate } from "@/lib/utils/plate.utils"
import Spinner from "@/components/ui/Spinner"

export default function QrSharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)

  const [share, setShare]     = useState<QrShare | null>(null)
  const [loading, setLoading] = useState(true)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    getQrShare(token)
      .then((s) => {
        if (!s || new Date(s.expires_at).getTime() <= Date.now()) {
          setExpired(true)
        } else {
          setShare(s)
        }
      })
      .catch(() => setExpired(true))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Spinner className="text-ink" />
      </div>
    )
  }

  if (expired || !share) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center gap-2 px-4">
        <p className="font-syne font-bold text-xl text-ink">Este código ya no es válido</p>
        <p className="text-sm text-muted">Pide al conductor que genere uno nuevo.</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-10 min-h-dvh">
      <header className="py-6 text-center">
        <p className="font-syne font-bold text-lg text-ink">FISCALIZA</p>
      </header>

      {share.vehicle_photo_url && (
        <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 relative bg-black/5">
          <Image src={share.vehicle_photo_url} alt={share.vehicle_alias} fill className="object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between mb-1">
        <p className="font-syne font-bold text-2xl text-ink">{share.vehicle_alias}</p>
        <span className="font-mono text-sm text-muted tracking-widest">
          {formatPlate(share.vehicle_plate)}
        </span>
      </div>
      <p className="text-sm text-muted mb-6">Conductor: {share.owner_name}</p>

      {share.plate_photo_url && (
        <div className="w-full h-24 rounded-2xl overflow-hidden mb-6 relative bg-black/5">
          <Image src={share.plate_photo_url} alt="Foto de la patente" fill className="object-cover" />
        </div>
      )}

      <div className="rounded-2xl border border-black/8 overflow-hidden divide-y divide-black/5">
        {share.documents.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">Sin documentos cargados</p>
        ) : (
          share.documents.map((doc) => {
            const { status } = qrShareDocStatus(doc)
            const color = STATUS_COLOR[status]

            return (
              <div key={doc.type} className="px-4 py-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-ink">{doc.label}</p>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: color + "20", color }}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <p className="text-xs text-muted mb-2">{formatQrShareExpiry(doc)}</p>
                <div className="flex gap-4">
                  {doc.front_url && (
                    <a
                      href={doc.front_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-ink underline underline-offset-2"
                    >
                      {doc.back_url ? "Ver frente" : "Ver documento"}
                    </a>
                  )}
                  {doc.back_url && (
                    <a
                      href={doc.back_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-ink underline underline-offset-2"
                    >
                      Ver reverso
                    </a>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
