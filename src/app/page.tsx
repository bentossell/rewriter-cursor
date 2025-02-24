'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TextRewriter from '@/components/TextRewriter'
import Auth from '@/components/Auth'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Text Rewriter
          </h1>
          <p className="text-lg text-gray-600">
            Transform your text into different styles and formats using AI
          </p>
        </div>

        {user ? (
          <>
            <div className="mb-8 flex justify-end">
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
            <TextRewriter />
          </>
        ) : (
          <Auth />
        )}
      </div>
    </main>
  )
}
