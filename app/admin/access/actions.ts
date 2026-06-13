"use server"

import { createClient } from "@supabase/supabase-js"

export async function inviteUserAction(email: string, clientId: string, role: string, password?: string) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let userId: string;

    if (password) {
      // 1. Create the user directly with password
      const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (createError) {
        if (createError.message.includes("already registered") || createError.message.includes("already exists")) {
          return { error: "A user with this email is already registered." }
        }
        throw createError
      }
      userId = data.user.id
    } else {
      // 1. Invite the user
      // The redirect URL should be the portal root
      const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/portal`
      })

      if (inviteError) {
        if (inviteError.message.includes("already registered") || inviteError.message.includes("already exists")) {
          return { error: "A user with this email is already invited or active." }
        }
        throw inviteError
      }
      userId = data.user.id
    }

    // 2. Create the profile
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      client_id: clientId || null,
      role: role
    })

    if (profileError) throw profileError

    return { success: true }
  } catch (e: any) {
    console.error(e)
    return { error: e.message || "An error occurred." }
  }
}
