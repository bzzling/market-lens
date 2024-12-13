import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('Middleware - Current path:', req.nextUrl.pathname)
  console.log('Middleware - Session exists:', !!session)

  // If no session and trying to access protected route
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('Middleware - Redirecting to login: No session')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If session exists and trying to access auth pages
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    console.log('Middleware - Redirecting to dashboard: Session exists')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
} 