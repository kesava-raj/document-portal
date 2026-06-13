import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, action } = body

    if (!documentId || !action || !['view', 'download'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // 1. Fetch the document (RLS will automatically restrict if user shouldn't see it)
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, title, storage_path, client_id, clients(name)')
      .eq('id', documentId)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 })
    }

    // 2. Generate signed URL (valid for 60 minutes)
    const expiresIn = 60 * 60 // 3600 seconds
    const { data: signedUrlData, error: signError } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, expiresIn, {
        download: action === 'download' ? doc.title : false,
      })

    if (signError || !signedUrlData) {
      return NextResponse.json({ error: 'Failed to generate access URL' }, { status: 500 })
    }

    // 3. Log the access event
    // We can insert with the authenticated user because we have RLS policy allowing it
    const clientName = Array.isArray(doc.clients) ? doc.clients[0]?.name : (doc.clients as any)?.name || 'Unknown'
    
    // Get IP and user agent
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    const { error: auditError } = await supabase
      .from('access_events')
      .insert({
        user_id: user.id,
        document_id: doc.id,
        client_id: doc.client_id,
        action,
        user_email: user.email,
        document_title: doc.title,
        client_name: clientName,
        ip_address: ip,
        user_agent: userAgent,
      })

    if (auditError) {
      console.error('Failed to log access event:', auditError)
      // Continue anyway so the user gets the file, but log the error
    }

    return NextResponse.json({
      signedUrl: signedUrlData.signedUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
    })
  } catch (error) {
    console.error('Sign URL error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
