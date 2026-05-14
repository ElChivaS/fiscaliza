"use client"

import Skeleton from "@/components/ui/Skeleton"

export default function VehicleDetailSkeleton() {
  return (
    <div className="max-w-md mx-auto px-4">
      {/* PageHeader */}
      <div className="h-14 flex items-center justify-between">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="size-9 rounded-full" />
      </div>

      {/* Hero */}
      <div className="py-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      {/* Document rows */}
      <div className="divide-y divide-black/5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-xl" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Botón modo presentación */}
      <Skeleton className="mt-8 h-12 w-full rounded-2xl" />
    </div>
  )
}
