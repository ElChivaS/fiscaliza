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
        // Firebase Storage URLs no expiran por defecto, cache 60 min para ser conservadores
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
      exp: Date.now() + 60 * 60 * 1000, // 60 min
    })
  } catch {}
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
  const [activeType, setActiveType] = useState<DocumentType>(docType as DocumentType)
  const [docUrl, setDocUrl]         = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
      const [v, rawDocs] = await Promise.all([
        getVehicle(vehicleId),
        getDocumentsForVehicle(vehicleId),
      ])
      if (v) setVehicle(v)

      const byType: Partial<Record<DocumentType, DocumentWithStatus>> = {}
      rawDocs.forEach((d) => {
        byType[d.type as DocumentType] = enrichWithStatus(d)
      })
      setDocs(byType)
    }
    load()
  }, [vehicleId])

  // Obtener URL de descarga al cambiar de tab
  const loadDocUrl = useCallback(async (type: DocumentType) => {
    const doc = docs[type]
    if (!doc) { setDocUrl(null); return }

    setLoadingUrl(true)
    setDocUrl(null)

    // Cache IndexedDB
    const cached = await getCachedUrl(doc.storage_path)
    if (cached) {
      setDocUrl(cached)
      setLoadingUrl(false)
      return
    }

    try {
      const url = await getDocumentUrl(doc.storage_path)
      await cacheUrl(doc.storage_path, url)
      setDocUrl(url)
    } catch {
      setDocUrl(null)
    } finally {
      setLoadingUrl(false)
    }
  }, [docs])

  useEffect(() => {
    if (Object.keys(docs).length > 0) {
      loadDocUrl(activeType)
    }
  }, [activeType, docs, loadDocUrl])

  // Renderizar PDF en canvas
  useEffect(() => {
    if (!docUrl || !canvasRef.current) return
    const doc = docs[activeType]
    if (!doc || doc.mime_type !== "application/pdf") return

    let cancelled = false

    async function renderPdf() {
      if (!canvasRef.current) return
      try {
        const pdfjsLib = await import("pdfjs-dist")
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs"

        const pdf    = await pdfjsLib.getDocument(docUrl!).promise
        const page   = await pdf.getPage(1)
        const canvas = canvasRef.current
        if (!canvas || cancelled) return

        const viewport = page.getViewport({ scale: 1 })
        const scale    = canvas.parentElement!.clientWidth / viewport.width
        const scaled   = page.getViewport({ scale })

        canvas.width  = scaled.width
        canvas.height = scaled.height

        await page.render({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          canvasContext: canvas.getContext("2d") as any,
          canvas,
          viewport: scaled,
        }).promise
      } catch {}
    }

    renderPdf()
    return () => { cancelled = true }
  }, [docUrl, activeType, docs])

  const activeDoc = docs[activeType]

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
              color:            STATUS_COLOR[activeDoc.expiryStatus],
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
      <main className="flex-1 overflow-auto flex items-start justify-center px-4 py-2">
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
        ) : activeDoc.mime_type === "application/pdf" ? (
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl"
            style={{ maxWidth: "100%" }}
          />
        ) : (
          <img
            src={docUrl ?? ""}
            alt={DOCUMENT_TYPE_LABELS[activeType]}
            className="w-full rounded-xl object-contain"
            style={{ maxHeight: "calc(100dvh - 200px)" }}
          />
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
