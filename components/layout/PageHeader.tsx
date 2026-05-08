"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  back?: boolean
  backHref?: string
  right?: ReactNode
  centered?: boolean
}

export default function PageHeader({
  title,
  back = false,
  backHref,
  right,
  centered = false,
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) router.push(backHref)
    else router.back()
  }

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-black/5">
      <div className="flex items-center h-14 px-4 max-w-md mx-auto gap-2">
        {back && (
          <button
            onClick={handleBack}
            className="size-9 flex items-center justify-center rounded-full hover:bg-black/5 text-muted -ml-1 shrink-0"
            aria-label="Volver"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        <h1
          className={[
            "font-syne font-bold text-lg text-ink flex-1 truncate",
            centered ? "text-center" : "",
          ].join(" ")}
        >
          {title}
        </h1>

        {right ?? (back ? <div className="size-9" /> : null)}
      </div>
    </header>
  )
}
