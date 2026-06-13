import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  color?: string
}

export function ProgressBar({ value, max = 100, color = "var(--color-accent)", className, ...props }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const isComplete = percentage === 100
  const barColor = isComplete ? color : "var(--color-amber)"

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]", className)}
      {...props}
    >
      <div
        className="h-full transition-all duration-500 ease-in-out"
        style={{ width: `${percentage}%`, backgroundColor: barColor }}
      />
    </div>
  )
}
