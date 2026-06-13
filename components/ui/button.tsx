import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-(--color-accent) text-white shadow-(--shadow-sh1) hover:bg-(--color-accent-d)",
      destructive: "bg-(--color-red) text-white shadow-(--shadow-sh1) hover:opacity-90",
      outline: "border border-(--color-line) bg-(--color-surface) shadow-(--shadow-sh1) hover:bg-(--color-surface2) text-(--color-ink)",
      secondary: "bg-(--color-surface2) text-(--color-ink2) hover:bg-(--color-line)",
      ghost: "hover:bg-(--color-surface2) text-(--color-ink)",
      link: "text-(--color-accent) underline-offset-4 hover:underline",
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-md px-8",
      icon: "h-10 w-10",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
