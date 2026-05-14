"use client"

import Skeleton from "@/components/ui/Skeleton"

export default function AccountSkeleton() {
  return (
    <div className="max-w-md mx-auto px-4">
      {/* PageHeader */}
      <div className="h-14 flex items-center">
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Avatar + nombre */}
      <div className="flex flex-col items-center py-8 gap-3">
        <Skeleton className="size-20 rounded-full" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-3.5 w-20" />
      </div>

      {/* Plan card */}
      <Skeleton className="rounded-2xl h-24 mb-6" />

      {/* Menú items */}
      <div className="rounded-2xl bg-surface border border-black/8 overflow-hidden mb-4">
        <div className="flex items-center gap-3 px-5 py-4">
          <Skeleton className="size-6 rounded-lg" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      <div className="rounded-2xl bg-surface border border-black/8 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4">
          <Skeleton className="size-6 rounded-lg" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  )
}
