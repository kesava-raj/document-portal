"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { name: "Overview", href: "/admin" },
  { name: "Clients", href: "/admin/clients" },
  { name: "Documents", href: "/admin/documents" },
  { name: "Support", href: "/admin/support" },
  { name: "Access", href: "/admin/access" },
  { name: "Audit log", href: "/admin/audit" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-2 py-3 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || (tab.href !== "/admin" && pathname?.startsWith(tab.href))
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-[var(--color-ink)] text-white"
                : "text-[var(--color-ink2)] hover:bg-[var(--color-surface2)] hover:text-[var(--color-ink)]"
            )}
          >
            {tab.name}
          </Link>
        )
      })}
    </nav>
  )
}
