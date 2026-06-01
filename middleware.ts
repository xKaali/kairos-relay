import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Routes that don't require auth
const PUBLIC_PATHS = [
  '/api/v1/registry',
  '/api/v1/capabilities/discover',
  '/auth/callback',
  '/home',
  '/docs',
  '/registry',
  '/',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Dashboard routes — handled by Supabase session auth
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/capabilities') ||
      pathname.startsWith('/discover') || pathname.startsWith('/delegations') ||
      pathname.startsWith('/networks') || pathname.startsWith('/api-keys')) {
    const response = NextResponse.next()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return response
  }

  // API routes — validate kr_ API key from Authorization header
  if (pathname.startsWith('/api/v1/')) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer kr_')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid API key' },
        { status: 401 }
      )
    }

    const rawKey = authHeader.replace('Bearer ', '')
    const keyHash = await sha256Hex(rawKey)

    // Validate key against DB — this check happens in the route handlers
    // via validateApiKey() to keep middleware lean. We only pre-screen format here.
    const response = NextResponse.next()
    response.headers.set('x-relay-key-hash', keyHash)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
