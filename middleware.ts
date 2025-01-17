import { type NextRequest } from 'next/server'
import { updateSession } from '@/app/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const res = await updateSession(request)

  // fetch the pathname
  const pathname = request.nextUrl.pathname

  // these routes should redirect to dashboard if the user is authenticated
  const publicRoutes = ['/', '/login', '/signup']
  const authRoutes = ['/auth/callback']

  const isAuthenticated = res.headers.get('x-user-authenticated') === 'true'
  
  // Allow access to auth routes without redirection
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return res
  }

  // Allow access to public routes when not authenticated
  if (!isAuthenticated && publicRoutes.includes(pathname)) {
    return res
  }

  // if user authenticated, redirect to dashboard from public routes
  if (isAuthenticated && publicRoutes.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return Response.redirect(url)
  }

  // if not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return Response.redirect(url)
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/dashboard/:path*',
    '/auth/callback',
  ],
}