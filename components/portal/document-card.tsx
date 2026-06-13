"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { FileText, Download, ExternalLink, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface DocumentCardProps {
  id: string
  title: string
  version: string
  fileType: string
  updatedAt: string
  status: string
}

export function DocumentCard({ id, title, version, fileType, updatedAt, status }: DocumentCardProps) {
  const { toast } = useToast()
  const [isViewing, setIsViewing] = React.useState(false)
  const [isDownloading, setIsDownloading] = React.useState(false)

  const handleAction = async (action: 'view' | 'download') => {
    try {
      if (action === 'view') setIsViewing(true)
      else setIsDownloading(true)

      const res = await fetch('/api/documents/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id, action })
      })

      if (!res.ok) {
        throw new Error('Failed to access document')
      }

      const { signedUrl } = await res.json()

      if (action === 'view') {
        window.open(signedUrl, '_blank')
      } else {
        // Trigger download
        const link = document.createElement('a')
        link.href = signedUrl
        // The downloaded filename is handled by the Content-Disposition header returned by Supabase
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast("Download started successfully")
      }
    } catch (error) {
      console.error(error)
      toast("Failed to access document. Please try again.")
    } finally {
      if (action === 'view') setIsViewing(false)
      else setIsDownloading(false)
    }
  }

  return (
    <div className="relative flex flex-col justify-between rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sh1)] transition-all hover:shadow-[var(--shadow-sh2)]">
      {/* Dog-ear fold effect */}
      <div className="absolute right-0 top-0 h-8 w-8 overflow-hidden rounded-tr-[var(--radius-md)] before:absolute before:-right-4 before:-top-4 before:h-8 before:w-8 before:-rotate-45 before:bg-[var(--color-line)] before:shadow-sm" />
      
      <div className="flex flex-col gap-3 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <Badge variant={fileType.toLowerCase() as any}>{fileType.toUpperCase()}</Badge>
          {status === 'Draft' && <Badge variant="draft">Draft</Badge>}
        </div>
        
        <div>
          <h3 className="font-serif text-lg font-medium leading-tight text-[var(--color-ink)] line-clamp-2">
            {title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-ink3)]">
            <span className="font-mono">{version}</span>
            <span>&middot;</span>
            <span>Updated {format(new Date(updatedAt), "MMM d, yyyy")}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 relative z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => handleAction('view')}
          disabled={isViewing}
        >
          {isViewing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="mr-2 h-3.5 w-3.5" />}
          View
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => handleAction('download')}
          disabled={isDownloading}
        >
          {isDownloading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}
          Download
        </Button>
      </div>
    </div>
  )
}
