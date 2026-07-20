"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getActivityLog } from "@/lib/firebase/firestore"
import { useOrganization } from "@/hooks/useOrganization"
import { describeActivity, formatRelativeTime } from "@/lib/utils/activity.utils"
import type { ActivityLogEntry, ActivityAction } from "@/types/document.types"
import PageHeader from "@/components/layout/PageHeader"
import ActivitySkeleton from "@/components/skeletons/ActivitySkeleton"

const ACTION_ICON: Record<ActivityAction, React.ReactNode> = {
  login: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  ),
  vehicle_created: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3 17V9l2-5h10l4 5v8" />
    </svg>
  ),
  vehicle_updated: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  vehicle_deleted: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
    </svg>
  ),
  document_uploaded: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <polyline points="9 15 12 12 15 15" />
    </svg>
  ),
  document_deleted: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9.5" y1="13.5" x2="14.5" y2="18.5" />
      <line x1="14.5" y1="13.5" x2="9.5" y2="18.5" />
    </svg>
  ),
}

export default function ActivityPage() {
  const router = useRouter()
  const { organization, loading: loadingOrg } = useOrganization()

  const [entries, setEntries] = useState<ActivityLogEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(true)

  useEffect(() => {
    if (!organization) return
    getActivityLog(organization.id)
      .then(setEntries)
      .finally(() => setLoadingEntries(false))
  }, [organization])

  if (loadingOrg || loadingEntries) {
    return <ActivitySkeleton />
  }

  return (
    <div className="max-w-md mx-auto px-4">
      <PageHeader title="Actividad" back backHref="/account" />

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-2 py-16">
          <p className="text-muted text-sm">Sin actividad todavía</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface border border-black/8 overflow-hidden divide-y divide-black/8 my-4">
          {entries.map((entry) => {
            const clickable = entry.target_type === "vehicle" && !!entry.target_id
            return (
              <button
                key={entry.id}
                onClick={() => clickable && router.push(`/vehicles/${entry.target_id}`)}
                disabled={!clickable}
                className={[
                  "flex items-center gap-3 px-5 py-4 w-full text-left",
                  clickable ? "hover:bg-black/3 transition-colors" : "cursor-default",
                ].join(" ")}
              >
                <span className="size-9 rounded-full bg-ink/8 text-ink flex items-center justify-center shrink-0">
                  {ACTION_ICON[entry.action]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{describeActivity(entry)}</p>
                  <p className="text-xs text-muted mt-0.5">{formatRelativeTime(entry.created_at)}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
