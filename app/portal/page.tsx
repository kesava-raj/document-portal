import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PortalClient } from "./portal-client"

export const dynamic = "force-dynamic"

export default async function PortalPage({ searchParams }: { searchParams: { clientId?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  // Get user profile to determine role and client workspace
  const { data: profile } = await supabase
    .from("profiles")
    .select("client_id, role")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/")
  }

  const isAdmin = profile.role === "admin"
  let targetClientId = profile.client_id
  let allClients: any[] = []

  if (isAdmin) {
    // Admins can see all clients
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, logo_url")
      .eq("is_active", true)
      .order("name")
    
    allClients = clients || []

    // Use requested client, or default to the first one
    if (searchParams.clientId) {
      targetClientId = searchParams.clientId
    } else if (allClients.length > 0) {
      targetClientId = allClients[0].id
    }
  } else if (!targetClientId) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-surface2)]">
        <p className="text-[var(--color-ink2)]">No client workspace assigned to this account.</p>
      </div>
    )
  }

  if (!targetClientId && isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-surface2)]">
        <p className="text-[var(--color-ink2)]">No clients exist yet. Add one in the Admin Dashboard.</p>
      </div>
    )
  }

  // Fetch the target client details
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", targetClientId)
    .single()

  if (!client) {
    return <div className="flex h-screen items-center justify-center bg-[var(--color-surface2)]">Workspace not found</div>
  }

  // Fetch categories that have at least one Ready document for this client
  const { data: documents } = await supabase
    .from("documents")
    .select(`
      id,
      title,
      version,
      file_type,
      updated_at,
      status,
      category_id,
      categories(name)
    `)
    .eq("client_id", targetClientId)
    .eq("status", "Ready")
    .order("updated_at", { ascending: false })

  const docs = documents || []

  // Fetch all categories from the database so the pills always show up
  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, name")
    .order("id")

  const availableCategories = allCategories || []

  return (
    <PortalClient 
      client={client} 
      initialDocuments={docs} 
      categories={availableCategories}
      isAdmin={isAdmin}
      allClients={allClients}
    />
  )
}
