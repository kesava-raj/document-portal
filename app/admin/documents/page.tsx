import { createClient } from "@/lib/supabase/server"
import { DocumentsClient } from "./documents-client"

export const dynamic = "force-dynamic"

export default async function AdminDocuments() {
  const supabase = await createClient()

  const [
    { data: documents },
    { data: clients },
    { data: categories }
  ] = await Promise.all([
    supabase.from("documents").select(`
      *,
      clients(name),
      categories(name)
    `).order("updated_at", { ascending: false }),
    supabase.from("clients").select("id, name").eq("is_active", true).order("name"),
    supabase.from("categories").select("id, name").order("name")
  ])

  return (
    <DocumentsClient 
      initialDocuments={documents || []} 
      clients={clients || []} 
      categories={categories || []} 
    />
  )
}
