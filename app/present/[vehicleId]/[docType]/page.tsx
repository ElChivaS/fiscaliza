"use client"

import { use, useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getVehicle, getDocumentsForVehicle } from "@/lib/firebase/firestore"
import { getDocumentUrl } from "@/lib/firebase/storage"
import { enrichWithStatus } from "@/lib/utils/document.utils"
import { formatPlate } from "@/lib/utils/plate.utils"
import {
  DOCUMENT_TYPE_ORDER,
  DOCUMENT_TYPE_SHORT,
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
  type DocumentWithStatus,
  type Vehicle,
} from "@/types/document.types"
import { STATUS_COLOR } from "@/lib/utils/document.utils"
import Spinner from "@/components/ui/Spinner"

// ─── IndexedDB cache para URLs de Firebase Storage ───────────────────────────

const DB_NAME    = "fiscaliza-cache"
const DB_VERSION = 1
const STORE_NAME = "download-urls"

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: "path" })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

async function getCachedUrl(path: string): Promise<string | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx  = db.transaction(STORE_NAME, "readonly")
      const req = tx.objectStore(STORE_NAME).get(path)
      req.onsuccess = () => {
        const entry = req.result as { path: string; url: string; exp: number } | undefined
        if (entry && entry.exp > Date.now()) resolve(entry.url)
        else resolve(null)
      }
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function cacheUrl(path: string, url: string) {
  try {
    const db = await openDB()
    const tx  = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put({
      path,
      url,
      exp: Date.now() + 60 * 60 * 1000,
    })
  } catch {}
}

async function resolveUrl(path: string): Promise<string | null> {
  const cached = await getCachedUrl(path)
  if (cached) return cached
  try {
    const url = await getDocumentUrl(path)
    await cacheUrl(path, url)
    return url
  } catch {
    return null
  }
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PresentPage({
  params,
}: {
  params: Promise<{ vehicleId: string; docType: string }>
}) {
  const { vehicleId, docType } = use(params)
  const router = useRouter()

  const [vehicle, setVehicle]       = useState<Vehicle | null>(null)
  const [docs, setDocs]             = useState<Partial<Record<DocumentType, DocumentWithStatus>>>({})
  // Licencia tiene frente y reverso por separado
  const [licenciaFront, setLicenciaFront] = useState<DocumentWithStatus | null>(null)
  const [licenciaBack,  setLicenciaBack]  = useState<DocumentWithStatus | null>(null)

  const [activeType, setActiveType] = useState<DocumentType>(docType as DocumentType)

  // URLs resueltas para el tipo activo
  const [docUrl,     setDocUrl]     = useState<string | null>(null)
  const [backUrl,    setBackUrl]    = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [renderError, setRenderError] = useState<string | null>(null)

  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const canvasBackRef = useRef<HTMLCanvasElement>(null)

  // Bloquear orientación portrait
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(screen.orientation as any).lock?.("portrait")?.catch?.(() => {})
    } catch {}
  }, [])

  // Cargar vehículo y documentos desde Firestore
  useEffect(() => {
    async function load() {
      const v = await getVehicle(vehicleId)
      if (!v) return
      setVehicle(v)
      const rawDocs = await getDocumentsForVehicle(vehicleId, v.organization_id)

      const byType: Partial<Record<DocumentType, DocumentWithStatus>> = {}
      let front: DocumentWithStatus | null = null
      let back:  DocumentWithStatus | null = null

      rawDocs.forEach((d) => {
        const enriched = enrichWithStatus(d)
        if (d.type === "licencia") {
          if (d.side === "back") back  = enriched
          else                   front = enriched  // front o null (doc antiguo sin side)
        } else {
          byType[d.type as DocumentType] = enriched
        }
      })

      setDocs(byType)
      setLicenciaFront(front)
      setLicenciaBack(back)

      // El representante de licencia en byType es el frente (para el badge de estado)
      if (front ?? back) {
        byType["licencia"] = (front ?? back)!
        setDocs({ ...byType })
      }
    }
    load()
  }, [vehicleId])

  // Obtener URLs al cambiar de tab
  const loadDocUrls = useCallback(async (type: DocumentType) => {
    setLoadingUrl(true)
    setDocUrl(null)
    setBackUrl(null)
    setRenderError(null)

    if (type === "licencia") {
      const [fUrl, bUrl] = await Promise.all([
        licenciaFront ? resolveUrl(licenciaFront.storage_path) : Promise.resolve(null),
        licenciaBack  ? resolveUrl(licenciaBack.storage_path)  : Promise.resolve(null),
      ])
      setDocUrl(fUrl)
      setBackUrl(bUrl)
    } else {
      const doc = docs[type]
      if (!doc) { setLoadingUrl(false); return }
      const url = await resolveUrl(doc.storage_path)
      setDocUrl(url)
    }

    setLoadingUrl(false)
  }, [docs, licenciaFront, licenciaBack])

  useEffect(() => {
    if (Object.keys(docs).length > 0 || licenciaFront || licenciaBack) {
      loadDocUrls(activeType)
    }
  }, [activeType, docs, licenciaFront, licenciaBack, loadDocUrls])

  // Renderizar PDF en canvas — helper
  async function renderPdfToCanvas(url: string, canvas: HTMLCanvasElement) {
    try {
      setRenderError(null)
      const pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString()

      // Descargamos el PDF nosotros mismos en vez de dejar que pdf.js haga sus
      // propios range-requests: evita "Invalid PDF structure" cuando esas
      // peticiones parciales chocan con la config de CORS del bucket.
      const response = await fetch(url)
      if (!response.ok) throw new Error(`No se pudo descargar el PDF (${response.status})`)
      const data = await response.arrayBuffer()

      const pdf     = await pdfjsLib.getDocument({ data }).promise
      const page    = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 1 })
      const scale   = canvas.parentElement!.clientWidth / viewport.width
      const scaled  = page.getViewport({ scale })

      canvas.width  = scaled.width
      canvas.height = scaled.height

      await page.render({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvasContext: canvas.getContext("2d") as any,
        canvas,
        viewport: scaled,
      }).promise
    } catch (err) {
      console.error("[present] fallo al renderizar PDF:", err)
      setRenderError(err instanceof Error ? err.message : String(err))
    }
  }

  // Renderizar PDFs en canvas al cambiar URLs
  useEffect(() => {
    if (!docUrl || !canvasRef.current) return
    const doc = activeType === "licencia" ? licenciaFront : docs[activeType]
    if (!doc || doc.mime_type !== "application/pdf") return
    renderPdfToCanvas(docUrl, canvasRef.current)
  }, [docUrl, activeType, docs, licenciaFront])

  useEffect(() => {
    if (!backUrl || !canvasBackRef.current || !licenciaBack) return
    if (licenciaBack.mime_type !== "application/pdf") return
    renderPdfToCanvas(backUrl, canvasBackRef.current)
  }, [backUrl, licenciaBack])

  const activeDoc = docs[activeType]
  const isLicencia = activeType === "licencia"
  const hasFront   = isLicencia && !!licenciaFront
  const hasBack    = isLicencia && !!licenciaBack

  // Determina si el doc activo (no licencia) es PDF
  const isPdf = (doc: DocumentWithStatus | null | undefined) =>
    doc?.mime_type === "application/pdf"

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Header oscuro */}
      <header className="flex items-center gap-3 px-4 pt-12 pb-4 shrink-0">
        <button
          onClick={() => router.back()}
          className="size-9 flex items-center justify-center rounded-full bg-white/10 text-white shrink-0"
          aria-label="Volver"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-white/60 text-xs font-mono">
            {vehicle ? formatPlate(vehicle.plate) : "···"}
          </p>
          <p className="text-white font-syne font-bold truncate">
            {DOCUMENT_TYPE_LABELS[activeType]}
          </p>
        </div>

        {activeDoc && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
            style={{
              backgroundColor: STATUS_COLOR[activeDoc.expiryStatus] + "30",
              color:           STATUS_COLOR[activeDoc.expiryStatus],
            }}
          >
            {activeDoc.daysUntilExpiry !== null
              ? activeDoc.daysUntilExpiry < 0
                ? "Vencido"
                : `${activeDoc.daysUntilExpiry}d`
              : "Sin fecha"}
          </span>
        )}
      </header>

      {/* Área de documento */}
      <main className="flex-1 overflow-auto flex flex-col items-center px-4 py-2 gap-3">
        {loadingUrl ? (
          <div className="flex items-center justify-center w-full h-full">
            <Spinner size="lg" className="text-white/40" />
          </div>
        ) : !activeDoc ? (
          <div className="flex flex-col items-center justify-center w-full h-full text-center gap-3">
            <p className="text-white/40 text-sm">Sin documento</p>
            <p className="text-white/20 text-xs">
              Carga el {DOCUMENT_TYPE_LABELS[activeType]} desde el detalle del vehículo
            </p>
          </div>
        ) : isLicencia ? (
          /* ── Licencia: frente + reverso apilados ── */
          <>
            {hasFront && (
              <div className="w-full">
                <p className="text-white/40 text-[10px] font-medium mb-1.5 tracking-wide uppercase">Frente</p>
                {isPdf(licenciaFront) ? (
                  docUrl ? (
                    <>
                      <canvas ref={canvasRef} className="w-full rounded-xl" />
                      {renderError && (
                        <p className="text-red-400 text-xs mt-2 text-center wrap-break-word">
                          Error al renderizar PDF: {renderError}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center">
                      <p className="text-red-400 text-xs">No se pudo obtener la URL</p>
                    </div>
                  )
                ) : docUrl ? (
                  <img
                    src={docUrl}
                    alt="Frente licencia"
                    className="w-full rounded-xl object-contain"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center">
                    <Spinner />
                  </div>
                )}
              </div>
            )}
            {hasBack && (
              <div className="w-full">
                <p className="text-white/40 text-[10px] font-medium mb-1.5 tracking-wide uppercase">Reverso</p>
                {isPdf(licenciaBack) ? (
                  backUrl ? (
                    <>
                      <canvas ref={canvasBackRef} className="w-full rounded-xl" />
                      {renderError && (
                        <p className="text-red-400 text-xs mt-2 text-center wrap-break-word">
                          Error al renderizar PDF: {renderError}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center">
                      <p className="text-red-400 text-xs">No se pudo obtener la URL</p>
                    </div>
                  )
                ) : backUrl ? (
                  <img
                    src={backUrl}
                    alt="Reverso licencia"
                    className="w-full rounded-xl object-contain"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center">
                    <Spinner />
                  </div>
                )}
              </div>
            )}
            {!hasFront && !hasBack && (
              <div className="flex flex-col items-center justify-center w-full h-full text-center gap-3">
                <p className="text-white/40 text-sm">Sin documento</p>
              </div>
            )}
          </>
        ) : isPdf(activeDoc) ? (
          /* ── PDF normal ── */
          docUrl ? (
            <div className="w-full">
              <canvas
                ref={canvasRef}
                className="w-full rounded-xl"
                style={{ maxWidth: "100%" }}
              />
              {renderError && (
                <p className="text-red-400 text-xs mt-2 text-center wrap-break-word">
                  Error al renderizar PDF: {renderError}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-center gap-2">
              <p className="text-red-400 text-sm">No se pudo obtener la URL del documento</p>
            </div>
          )
        ) : docUrl ? (
          /* ── Imagen normal ── */
          <img
            src={docUrl}
            alt={DOCUMENT_TYPE_LABELS[activeType]}
            className="w-full rounded-xl object-contain"
            style={{ maxHeight: "calc(100dvh - 200px)" }}
          />
        ) : (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        )}
      </main>

      {/* Bottom nav de tabs */}
      <nav className="shrink-0 pb-8" style={{ backgroundColor: "#141414" }}>
        <div className="flex">
          {DOCUMENT_TYPE_ORDER.map((type) => {
            const d      = docs[type]
            const active = type === activeType
            const color  = d ? STATUS_COLOR[d.expiryStatus] : "#888580"

            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className="flex-1 flex flex-col items-center pt-3 pb-2 gap-1 relative transition-colors"
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-white" />
                )}
                <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span
                  className={[
                    "text-[10px] font-medium leading-tight text-center",
                    active ? "text-white" : "text-white/40",
                  ].join(" ")}
                >
                  {DOCUMENT_TYPE_SHORT[type]}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
