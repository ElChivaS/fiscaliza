"use client"

import Skeleton from "@/components/ui/Skeleton"

function VehicleCardSkeleton() {
  return (
    <div className="rounded-[20px] bg-surface border border-black/8 overflow-hidden">
      {/* Color strip */}
      <div className="h-1 bg-black/8 animate-pulse" />
      <div className="p-5">
        {/* Plate + badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Doc pills grid */}
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-4" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardSkeleton() {
  return (
    <div className="max-w-md mx-auto px-4">
      {/* Header */}
      <header className="pt-12 pb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-36" />
        </div>
        <Skeleton className="size-11 rounded-full" />
      </header>

      {/* Vehicle cards */}
      <div className="flex flex-col gap-4">
        <VehicleCardSkeleton />
      </div>

      {/* Plan strip */}
      <div className="mt-8 rounded-2xl bg-black/5 animate-pulse h-20" />
    </div>
  )
}
