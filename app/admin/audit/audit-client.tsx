"use client"

import * as React from "react"
import { format } from "date-fns"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AuditClient({ initialEvents }: { initialEvents: any[] }) {
  const { toast } = useToast()
  const [events] = React.useState(initialEvents)

  const handleExportCSV = () => {
    if (events.length === 0) {
      toast("No data to export.")
      return
    }

    const headers = ["When (IST)", "Actor (Email)", "Action", "Document", "Workspace", "IP Address", "User Agent"]
    const csvContent = [
      headers.join(","),
      ...events.map((e: any) => {
        // Convert to IST if needed, or just use local time for the CSV export
        const date = new Date(e.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        return [
          `"${date}"`,
          `"${e.user_email}"`,
          `"${e.action}"`,
          `"${e.document_title}"`,
          `"${e.client_name}"`,
          `"${e.ip_address || ''}"`,
          `"${e.user_agent || ''}"`
        ].join(",")
      })
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "audit_log.csv")
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast("CSV exported successfully")
  }

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)]">Audit Log</h2>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-sh1)] overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When (IST)</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Workspace</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[var(--color-ink3)] h-24">
                  No audit events found.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event: any) => (
                <TableRow key={event.id}>
                  <TableCell className="text-[var(--color-ink2)] whitespace-nowrap">
                    {new Date(event.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  </TableCell>
                  <TableCell className="font-medium text-[var(--color-ink)]">{event.user_email}</TableCell>
                  <TableCell className="capitalize text-[var(--color-ink2)]">{event.action}</TableCell>
                  <TableCell className="text-[var(--color-ink2)]">{event.document_title}</TableCell>
                  <TableCell className="text-[var(--color-ink2)]">{event.client_name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
