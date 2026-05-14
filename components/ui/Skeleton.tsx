"use client"

import { cn } from "@/lib/utils/cn"

interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-black/8",
        className
      )}
    />
  )
}
