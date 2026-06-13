"use client"

import * as React from "react"
import { Search, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AvatarInitials } from "@/components/ui/avatar-initials"
import { Input } from "@/components/ui/input"
import { DocumentCard } from "@/components/portal/document-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ActivityPanel } from "@/components/support/activity-panel"
import { MessageSquare } from "lucide-react"

export function PortalClient({ client, initialDocuments, categories, isAdmin = false, allClients = [] }: any) {
  const router = useRouter()
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<number | "All">("All")
  const [isActivityOpen, setIsActivityOpen] = React.useState(false)

  const handleSignOut = async () => {
    if (isAdmin) {
      router.push("/admin")
      return
    }
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/portal?clientId=${e.target.value}`)
  }

  // Filter documents based on search and category
  const filteredDocs = initialDocuments.filter((doc: any) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "All" || doc.category_id === activeCategory
    return matchesSearch && matchesCategory
  })

  // Group by category for display
  const docsByCategory = React.useMemo(() => {
    const groups: Record<string, any[]> = {}
    filteredDocs.forEach((doc: any) => {
      const catName = Array.isArray(doc.categories) ? doc.categories[0]?.name : doc.categories?.name
      if (!groups[catName]) groups[catName] = []
      groups[catName].push(doc)
    })
    return groups
  }, [filteredDocs])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sub-header bar */}
      <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-surface)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <AvatarInitials initials={client.short_code} logoUrl={client.logo_url} size="md" />
            <div>
              <h1 className="font-serif text-lg font-semibold text-[var(--color-ink)] leading-tight">
                {client.name}
              </h1>
              <p className="text-xs text-[var(--color-ink3)]">
                {client.platform} &middot; client workspace
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <>
                <Badge variant="pending" className="bg-[var(--color-surface2)] text-[var(--color-ink2)] border-[var(--color-line)] hidden md:inline-flex uppercase tracking-wider font-semibold text-[10px]">Demo</Badge>
                <div className="hidden md:flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1 shadow-sm">
                  <span className="text-xs text-[var(--color-ink3)] font-medium pl-1">View as</span>
                  <select 
                    value={client.id}
                    onChange={handleClientChange}
                    className="h-7 border-none bg-transparent text-sm font-medium text-[var(--color-ink)] focus:ring-0 outline-none pr-1"
                  >
                    {allClients.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsActivityOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" /> Activity
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              {isAdmin ? "Exit demo" : (
                <><LogOut className="mr-2 h-4 w-4" /> Sign out</>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {isAdmin && (
          <div className="rounded-md bg-[#eaf4f0] px-4 py-3 text-sm text-[var(--color-accent)] border border-[#d1e8df] flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <p>You're viewing <strong>{client.name}</strong>'s workspace — only documents shared with {client.name} are visible here.</p>
          </div>
        )}
        <div className="fade-in space-y-8">
          {/* Security Banner */}
          <div className="rounded-lg border border-[var(--color-accent-line)] bg-[var(--color-accent-soft)] p-4 text-sm text-[var(--color-accent-d)] shadow-sm">
            You're viewing <strong>{client.name}</strong>'s workspace &mdash; only documents shared with {client.name} are visible here.
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink4)]" />
              <Input
                placeholder="Search documents..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("All")}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === "All"
                    ? "bg-[var(--color-ink)] text-white"
                    : "bg-[var(--color-surface2)] text-[var(--color-ink2)] hover:bg-[var(--color-line)]"
                )}
              >
                All
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    activeCategory === cat.id
                      ? "bg-[var(--color-ink)] text-white"
                      : "bg-[var(--color-surface2)] text-[var(--color-ink2)] hover:bg-[var(--color-line)]"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Document Library */}
          <div className="space-y-10">
            {Object.keys(docsByCategory).length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-line)]">
                <p className="text-[var(--color-ink3)]">No documents found.</p>
              </div>
            ) : (
              Object.entries(docsByCategory).map(([category, docs], index) => (
                <div key={category} className="space-y-4" style={{ animationDelay: `${index * 60}ms` }}>
                  <div className="flex items-center gap-4">
                    <h2 className="font-serif text-xl font-semibold text-[var(--color-ink)]">{category}</h2>
                    <div className="h-px flex-1 bg-[var(--color-line)]" />
                    <span className="text-sm text-[var(--color-ink3)]">{docs.length} docs</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {docs.map((doc: any) => (
                      <DocumentCard
                        key={doc.id}
                        id={doc.id}
                        title={doc.title}
                        version={doc.version}
                        fileType={doc.file_type}
                        status={doc.status}
                        updatedAt={doc.updated_at}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <ActivityPanel 
        clientId={client.id}
        clientName={client.name}
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />
    </div>
  )
}
