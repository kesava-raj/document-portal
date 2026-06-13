import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarInitialsProps extends React.HTMLAttributes<HTMLDivElement> {
  initials: string
  color?: string
  logoUrl?: string
  size?: "sm" | "md" | "lg"
}

export function AvatarInitials({ initials, color = "var(--color-accent)", logoUrl, size = "md", className, ...props }: AvatarInitialsProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  }

  if (logoUrl) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] shadow-sm overflow-hidden bg-white",
          sizes[size],
          className
        )}
        {...props}
      >
        <img src={logoUrl} alt={initials} className="w-full h-full object-contain" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] font-medium text-white shadow-sm",
        sizes[size],
        className
      )}
      style={{ backgroundColor: color }}
      {...props}
    >
      {initials.substring(0, 2).toUpperCase()}
    </div>
  )
}
