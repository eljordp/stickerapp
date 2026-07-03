import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

async function getSupabaseClient() {
  return (await import('@/lib/supabase')).supabase
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    let unsubscribe: (() => void) | undefined

    void getSupabaseClient()
      .then((supabase) => {
        if (!active) return
        // Check existing session
        void supabase.auth.getUser().then(({ data: { user: u } }) => {
          if (!active) return
          setUser(u)
          setLoading(false)
        }).catch(() => {
          if (active) setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (active) setUser(session?.user ?? null)
        })
        unsubscribe = () => subscription.unsubscribe()
      })
      .catch(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  const signUp = async (email: string, password: string, name: string, phone?: string): Promise<{ error?: string }> => {
    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, phone: phone || '' },
          emailRedirectTo: `${window.location.origin}/account`,
        },
      })
      if (error) return { error: error.message }

      // Also create/update customer record in CRM
      try {
        const parts = name.trim().split(' ')
        const firstName = parts[0] || ''
        const lastName = parts.slice(1).join(' ') || ''
        await supabase.rpc('get_or_create_customer', {
          _email: email.trim(),
          _first_name: firstName,
          _last_name: lastName,
          _phone: phone?.trim() || '',
          _source: 'account_signup',
        })
      } catch { /* non-blocking */ }

      return {}
    } catch {
      return { error: 'Something went wrong. Please try again.' }
    }
  }

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      return {}
    } catch {
      return { error: 'Cannot connect to server. Check your connection.' }
    }
  }

  const signOut = async () => {
    const supabase = await getSupabaseClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
