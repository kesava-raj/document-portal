import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "ready" | "draft" | "active" | "pending" | "locked" | "pdf" | "png" | "md"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[var(--color-surface2)] text-[var(--color-ink2)] border-[var(--color-line)]",
    ready: "bg-[var(--color-accent-soft)] text-[var(--color-accent-d)] border-[var(--color-accent-line)]",
    draft: "bg-[var(--color-amber-soft)] text-[var(--color-amber)] border-[#E2D2B5]",
    active: "bg-[var(--color-accent-soft)] text-[var(--color-accent-d)] border-[var(--color-accent-line)]",
    pending: "bg-[var(--color-amber-soft)] text-[var(--color-amber)] border-[#E2D2B5]",
    locked: "bg-[#E2E8F0] text-[#475569] border-[#CBD5E1]",
    pdf: "bg-[var(--color-red-soft)] text-[var(--color-red)] border-[#EBBFB8]",
    png: "bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]",
    md: "bg-[var(--color-accent-soft)] text-[var(--color-accent-d)] border-[var(--color-accent-line)]",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
