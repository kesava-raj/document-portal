import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

export default async function AdminOverview() {
  const supabase = await createClient()

  // Fetch stats concurrently
  const [
    { count: clientsCount },
    { data: profiles },
    { data: documents },
    { data: recentActivity }
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("id, client_id"),
    supabase.from("documents").select("id, status, client_id"),
    supabase.from("access_events").select("*").order("created_at", { ascending: false }).limit(5)
  ])

  // Process stats
  const activeLogins = profiles?.filter(p => p.client_id).length || 0
  const totalDocs = documents?.length || 0
  const draftDocs = documents?.filter(d => d.status === "Draft").length || 0

  // Manual completion progress per client
  // We need client names to show this properly, let's fetch clients
  const { data: clients } = await supabase.from("clients").select("id, name, is_active").eq("is_active", true)

  const clientProgress = clients?.map(client => {
    const clientDocs = documents?.filter(d => d.client_id === client.id) || []
    const total = clientDocs.length
    const ready = clientDocs.filter(d => d.status === "Ready").length
    return {
      id: client.id,
      name: client.name,
      ready,
      total,
      percentage: total > 0 ? (ready / total) * 100 : 0
    }
  }) || []

  return (
    <div className="fade-in space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Workspaces" value={clientsCount || 0} accent />
        <StatCard title="Active Logins" value={activeLogins} />
        <StatCard title="Total Documents" value={totalDocs} />
        <StatCard title="Drafts Pending" value={draftDocs} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Progress Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Manual Completion Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {clientProgress.length === 0 ? (
              <p className="text-sm text-[var(--color-ink3)]">No active clients found.</p>
            ) : (
              clientProgress.map(client => (
                <div key={client.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[var(--color-ink)]">{client.name}</span>
                    <span className="text-[var(--color-ink2)] font-mono">{client.ready} / {client.total} ready</span>
                  </div>
                  <ProgressBar value={client.ready} max={client.total || 1} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {(!recentActivity || recentActivity.length === 0) ? (
              <p className="text-sm text-[var(--color-ink3)]">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                    <div className="text-sm">
                      <p className="text-[var(--color-ink)]">
                        <span className="font-medium">{activity.user_email}</span> {activity.action}ed <span className="font-medium">{activity.document_title}</span>
                      </p>
                      <p className="text-xs text-[var(--color-ink3)] mt-0.5">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
