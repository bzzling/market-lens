import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AuthError } from '@supabase/supabase-js'

export function useAuth() {
  const router = useRouter()

  const signInWithEmail = async (email: string, password: string) => {
    if (email === 'demo@marketlens.com' && password === 'demopass123') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@marketlens.com',
        password:'demopassword123'
      })
      if (error) throw error
      return data
    }

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