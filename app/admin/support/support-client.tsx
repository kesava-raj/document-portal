"use client"

import * as React from "react"
import { Search, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AvatarInitials } from "@/components/ui/avatar-initials"
import { ActivityPanel } from "@/components/support/activity-panel"

export function SupportClient({ clients }: { clients: any[] }) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null)
  
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.sector && c.sector.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const selectedClient = clients.find(c => c.id === selectedClientId)

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)]">Support Activity</h2>
          <p className="text-sm text-[var(--color-ink2)] mt-1">Chat and support logs for your clients</p>
        </div>
      </div>

      <div className="flex items-center relative w-full max-w-md">
        <Search className="absolute left-3 h-4 w-4 text-[var(--color-ink3)]" />
        <Input 
          placeholder="Search clients..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
          <div 
            key={client.id} 
            className="flex flex-col p-5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <AvatarInitials initials={client.short_code} logoUrl={client.logo_url} size="md" />
              <div>
                <h3 className="font-medium text-[var(--color-ink)] leading-tight">{client.name}</h3>
                <p className="text-xs text-[var(--color-ink3)] mt-1">{client.sector || "No sector"}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-auto" 
              onClick={() => setSelectedClientId(client.id)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              View Activity
            </Button>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-[var(--color-ink3)] border-2 border-dashed border-[var(--color-line)] rounded-lg">
            No clients found matching your search.
          </div>
        )}
      </div>

      {selectedClient && (
        <ActivityPanel 
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          isOpen={!!selectedClientId}
          onClose={() => setSelectedClientId(null)}
        />
      )}
    </div>
  )
}
