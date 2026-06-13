import { createClient } from "@/lib/supabase/server"
import { AccessClient } from "./access-client"
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = "force-dynamic"

export default async function AdminAccess() {
  const supabase = await createClient()

  // We need to fetch profiles, clients, and maybe users from auth.users (though we can't access auth.users directly from public schema without a view or rpc usually, but we have the profiles table and we can join clients)
  // The requirements say "users table: Email, Client workspace, Role, Status"
  // Wait, email is not in profiles by default, but we added a trigger or we can fetch it via admin api.
  // Actually, wait, Supabase auth.users isn't queryable from anon/authenticated clients usually. But this is the server side using the anon key with user session.
  // The service role key is available! Let's create an admin client using the service role to fetch users from auth.users.
  
  // Or, we can just look at `profiles` and join `clients`. But how to get email? 
  // Let's create a Supabase admin client to get auth users.
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { data: { users }, error: authError },
    { data: profiles },
    { data: clients }
  ] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers(),
    supabase.from("profiles").select("*"),
    supabase.from("clients").select("id, name").eq("is_active", true).order("name")
  ])

  // Combine data
  const usersData = users.map((u: any) => {
    const profile = profiles?.find(p => p.id === u.id)
    const client = clients?.find(c => c.id === profile?.client_id)
    
    // Status can be based on last_sign_in_at
    const status = u.last_sign_in_at ? "Active" : "Invite pending"

    return {
      id: u.id,
      email: u.email,
      role: profile?.role || "member",
      client_id: profile?.client_id,
      clientName: client?.name || "N/A",
      status
    }
  })

  // Exclude the current user so they don't accidentally revoke their own access? 
  // Maybe just sort by email.
  usersData.sort((a, b) => a.email.localeCompare(b.email))

  return <AccessClient initialUsers={usersData} clients={clients || []} />
}
