"use client"

import { useEffect, type ReactNode } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  bottomSheet?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  bottomSheet = false,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  useEffect(() => {
    if (!open || !closeOnEscape) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, closeOnEscape, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Panel */}
      <div
        className={[
          "relative z-10 bg-surface w-full max-h-[90dvh] overflow-y-auto",
          bottomSheet
            ? "rounded-t-3xl sm:rounded-3xl sm:max-w-md sm:mx-4"
            : "rounded-3xl max-w-md mx-4",
        ].join(" ")}
      >
        {/* Handle bar (bottom sheet) */}
        {bottomSheet && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-black/20" />
          </div>
        )}

        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
            <h2 className="font-syne font-bold text-lg text-ink">{title}</h2>
            <button
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-full hover:bg-black/5 text-muted"
            >
              ✕
            </button>
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
