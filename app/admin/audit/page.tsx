import { createClient } from "@/lib/supabase/server"
import { AuditClient } from "./audit-client"

export const dynamic = "force-dynamic"

export default async function AdminAudit() {
  const supabase = await createClient()

  // Fetch initial audit logs (maybe just top 100 for initial render)
  const { data: auditEvents } = await supabase
    .from("access_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  return <AuditClient initialEvents={auditEvents || []} />
}
