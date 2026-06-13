"use server"

import { createClient } from "@/lib/supabase/server"

export async function getSupportMessagesAction(clientId: string) {
  try {
    const supabase = await createClient()
    const { data: messages, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true })

    if (error) throw error
    return { success: true, messages }
  } catch (e: any) {
    console.error("Error fetching support messages:", e)
    return { error: e.message || "Failed to fetch messages" }
  }
}

export async function sendSupportMessageAction(clientId: string, content: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) throw new Error("Not authenticated")

    // Get the sender's profile to get role and display name
    // If display_name is not set, we use email
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, display_name")
      .eq("id", user.id)
      .single()

    const role = profile?.role || "client"
    let senderName = profile?.display_name

    if (!senderName) {
      if (role === "admin") {
        senderName = "Support Agent"
      } else {
        // We could fetch the client name or just use user email prefix
        senderName = user.email ? user.email.split("@")[0] : "Client User"
      }
    }

    const { data: message, error } = await supabase
      .from("support_messages")
      .insert({
        client_id: clientId,
        sender_id: user.id,
        sender_role: role,
        sender_name: senderName,
        content: content
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, message }
  } catch (e: any) {
    console.error("Error sending support message:", e)
    return { error: e.message || "Failed to send message" }
  }
}
