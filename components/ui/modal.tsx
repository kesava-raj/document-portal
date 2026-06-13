"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen) return null
  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className={cn(
          "fade-in relative z-50 w-full max-w-lg rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sh3)] my-8",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <h2 className="font-serif text-xl font-semibold leading-none tracking-tight text-[var(--color-ink)]">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-[var(--color-ink3)]">
              {description}
            </p>
          )}
        </div>
        
        {children}
      </div>
    </div>,
    document.body
  )
}
