"use client"

import { useEffect, useState, useCallback } from "react"

type ToastType = "success" | "error" | "info"

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

let listeners: ((toasts: ToastMessage[]) => void)[] = []
let toastQueue: ToastMessage[] = []

function notify(toasts: ToastMessage[]) {
  listeners.forEach((fn) => fn(toasts))
}

export function toast(message: string, type: ToastType = "info") {
  const id = Math.random().toString(36).slice(2)
  toastQueue = [...toastQueue, { id, message, type }]
  notify(toastQueue)
  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id)
    notify(toastQueue)
  }, 3500)
}

const typeClasses: Record<ToastType, string> = {
  success: "bg-valid text-white",
  error:   "bg-expired text-white",
  info:    "bg-ink text-white",
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const handleToasts = useCallback((updated: ToastMessage[]) => {
    setToasts([...updated])
  }, [])

  useEffect(() => {
    listeners.push(handleToasts)
    return () => {
      listeners = listeners.filter((fn) => fn !== handleToasts)
    }
  }, [handleToasts])

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "rounded-2xl px-4 py-3 text-sm font-medium shadow-lg",
            "animate-in slide-in-from-bottom-2 fade-in duration-200",
            typeClasses[t.type],
          ].join(" ")}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
