import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from './supabase/client'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const supabaseAuth = supabase.auth
    // Get initial session
    const initUser = async () => {
      const { data: { session } } = await supabaseAuth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)

      // Listen for auth changes
      const { data: { subscription } } = supabaseAuth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    initUser()
  }, [supabase.auth])

  return { user, loading }
} 