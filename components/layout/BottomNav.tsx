"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/vehicles/new",
    label: "Agregar",
    icon: () => (
      <span className="size-10 flex items-center justify-center rounded-2xl bg-ink text-white shadow-lg">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
    ),
    isAction: true,
  },
  {
    href: "/account",
    label: "Cuenta",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-md border-t border-black/5 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-4 max-w-md mx-auto">
        {NAV_ITEMS.map(({ href, label, icon, isAction }) => {
          const active = pathname === href || (href !== "/dashboard" && !isAction && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-col items-center gap-0.5 px-4 transition-colors duration-150",
                isAction ? "-mt-4" : "",
                active ? "text-ink" : "text-muted",
              ].join(" ")}
            >
              {icon(active)}
              {!isAction && (
                <span className="text-[10px] font-medium">{label}</span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
