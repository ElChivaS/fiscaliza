"use client"

import Skeleton from "@/components/ui/Skeleton"

export default function ActivitySkeleton() {
  return (
    <div className="max-w-md mx-auto px-4">
      {/* PageHeader */}
      <div className="h-14 flex items-center">
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Filas de actividad */}
      <div className="rounded-2xl bg-surface border border-black/8 overflow-hidden divide-y divide-black/8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4">
            <Skeleton className="size-9 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
