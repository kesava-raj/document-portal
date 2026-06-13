import { createClient } from "@/lib/supabase/server"
import { SupportClient } from "./support-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function SupportPage() {
  const supabase = await createClient()

  // Ensure admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/portal")

  // Fetch all active clients
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, short_code, logo_url, sector")
    .eq("is_active", true)
    .order("name")

  return <SupportClient clients={clients || []} />
}
