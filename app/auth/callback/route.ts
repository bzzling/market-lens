import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  try {
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')
    
    console.log('Auth callback received:', { 
      url: request.url, 
      code,
      error,
      error_description
    })
    
    if (error || error_description) {
      console.error('Auth error from provider:', { error, error_description })
      return NextResponse.redirect(new URL(`/login?error=${error || 'auth-failed'}&description=${error_description}`, requestUrl.origin))
    }
    
    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Exchange code result:', { 
        hasSession: !!session, 
        error: authError?.message 
      })

      if (authError) {
        console.error('Auth callback error:', authError)
        return NextResponse.redirect(new URL(`/login?error=auth-failed&description=${authError.message}`, requestUrl.origin))
      }

      if (session) {
        await supabase.auth.getSession()
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      }
    }

    console.log('No code found in callback')
    return NextResponse.redirect(new URL('/login?error=no-code', requestUrl.origin))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL(`/login?error=unknown&description=${error instanceof Error ? error.message : 'Unknown error'}`, requestUrl.origin))
  }
} 