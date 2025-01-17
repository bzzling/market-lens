import { createClient } from '@/app/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(
        new URL(`/login?error=auth-failed`, requestUrl.origin)
      )
    }
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}