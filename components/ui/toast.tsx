"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

interface Toast {
  id: string
  message: string
}

interface ToastContextType {
  toast: (message: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((message: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2600) // Auto-dismiss after 2.6s as requested
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="fade-in flex items-center gap-2 rounded-lg bg-[var(--color-ink)] px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)]" />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
