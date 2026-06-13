"use server"

import { createClient } from "@supabase/supabase-js"

export async function createClientWithUserAction(clientData: {
  name: string
  platform: string
  sector: string
  short_code: string
  logo_url: string | null
  phone: string
}, userData: {
  email: string
  password?: string
}) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Create the client
    const { data: client, error: clientError } = await supabaseAdmin.from("clients").insert({
      name: clientData.name,
      platform: clientData.platform,
      sector: clientData.sector,
      short_code: clientData.short_code,
      logo_url: clientData.logo_url,
      phone: clientData.phone,
      is_active: true
    }).select().single()

    if (clientError) throw clientError

    // 2. Create the user
    let userId: string

    if (userData.password) {
      const { data, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      })
      if (userError) throw userError
      userId = data.user.id
    } else {
      const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(userData.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/portal`
      })
      if (inviteError) throw inviteError
      userId = data.user.id
    }

    // 3. Create the profile mapped to the new client
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      client_id: client.id,
      role: 'owner' // Assign owner role to the initial client user
    })

    if (profileError) throw profileError

    return { success: true, client }
  } catch (e: any) {
    console.error(e)
    return { error: e.message || "An error occurred creating the client and user." }
  }
}

export async function updateClientAction(clientId: string, clientData: {
  name: string
  platform: string
  sector: string
  short_code: string
  logo_url?: string | null
  phone: string
}) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Build update payload
    const payload: any = {
      name: clientData.name,
      platform: clientData.platform,
      sector: clientData.sector,
      short_code: clientData.short_code,
      phone: clientData.phone,
    }

    if (clientData.logo_url !== undefined) {
      payload.logo_url = clientData.logo_url
    }

    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .update(payload)
      .eq("id", clientId)
      .select()
      .single()

    if (error) throw error

    return { success: true, client }
  } catch (e: any) {
    console.error(e)
    return { error: e.message || "An error occurred updating the client." }
  }
}
