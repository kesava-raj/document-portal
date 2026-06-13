import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPortalRoute = path.startsWith('/portal')
  const isAdminRoute = path.startsWith('/admin')

  // Not authenticated
  if (!user && (isPortalRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // If authenticated and trying to access protected routes, check role
  if (user && (isAdminRoute || isPortalRoute)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'member'

    // Admin routes protection
    if (isAdminRoute && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/portal'
      return NextResponse.redirect(url)
    }

    // Portal routes: admins should probably be redirected to /admin if they just hit /portal by accident, 
    // but the requirements say "On role mismatch (client trying to access /admin) -> redirect to /portal."
    // They didn't explicitly restrict admins from viewing /portal, but it's good practice.
    // We will just let admins access /portal if they want, but restrict clients from /admin.
  }

  // Redirect away from login if already authenticated
  if (user && path === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    if (profile?.role === 'admin') {
      url.pathname = '/admin'
    } else {
      url.pathname = '/portal'
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
