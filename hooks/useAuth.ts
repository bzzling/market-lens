import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AuthError } from '@supabase/supabase-js'

export function useAuth() {
  const router = useRouter()
  const INACTIVE_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
  let inactivityTimer: NodeJS.Timeout

  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    inactivityTimer = setTimeout(async () => {
      await signOut()
    }, INACTIVE_TIMEOUT)
  }

  useEffect(() => {
    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    const handleUserActivity = () => {
      resetInactivityTimer()
    }

    const handleTabClose = async () => {
      await signOut()
    }

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity)
    })

    // Add tab/window close listener
    window.addEventListener('beforeunload', handleTabClose)

    // Initial timer
    resetInactivityTimer()

    // Cleanup
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer)
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
      window.removeEventListener('beforeunload', handleTabClose)
    }
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    
    if (!data?.session) {
      throw new Error('No session created')
    }
    
    return data
  }

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })

      console.log('Sign up response:', { data, error })

      if (data?.user?.identities?.length === 0) {
        throw new Error('An account with this email already exists. Please log in instead.')
      }

      if (error) throw error
      return data
    } catch (err) {
      console.log('Signup error:', err instanceof AuthError ? err.message : err)
      throw err
    }
  }

  const signInWithGithub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read:user user:email',
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('GitHub sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push('/login')
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    if (error) throw error
    return data
  }

  return {
    signInWithEmail,
    signUpWithEmail,
    signInWithGithub,
    resetPassword,
    signOut,
  }
} 