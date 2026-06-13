import { createClient } from "@/lib/supabase/server"
import { ClientsClient } from "./clients-client"

export const dynamic = "force-dynamic"

export default async function AdminClients() {
  const supabase = await createClient()

  // Fetch clients
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true })

  // Fetch document counts
  const { data: documents } = await supabase
    .from("documents")
    .select("client_id, status")

  // Fetch login status
  const { data: profiles } = await supabase
    .from("profiles")
    .select("client_id")

  // Combine data
  const clientsData = clients?.map(client => {
    const clientDocs = documents?.filter(d => d.client_id === client.id) || []
    const readyDocs = clientDocs.filter(d => d.status === "Ready")
    const clientProfiles = profiles?.filter(p => p.client_id === client.id) || []

    return {
      ...client,
      docsCount: clientDocs.length,
      readyCount: readyDocs.length,
      hasLogin: clientProfiles.length > 0
    }
  }) || []

  return <ClientsClient initialClients={clientsData} />
}
