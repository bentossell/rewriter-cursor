import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks'
import { RewriteMode } from '@/lib/openai'

interface Rewrite {
  id: string
  original_text: string
  rewritten_text: string
  rewrite_mode: RewriteMode
  created_at: string
}

interface RewriteSavedEvent extends Event {
  detail?: {
    rewrite: Rewrite
  }
}

export default function SavedOutputs() {
  const [rewrites, setRewrites] = useState<Rewrite[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedText, setEditedText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const supabase = createClient()
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      loadRewrites()
    }
  }, [user])

  // Listen for new saves
  useEffect(() => {
    const handleRewritesSaved = (event: Event) => {
      const customEvent = event as RewriteSavedEvent
      if (customEvent.detail?.rewrite) {
        // Add the new rewrite to the start of the list
        setRewrites(prev => [customEvent.detail!.rewrite, ...prev])
      }
    }

    window.addEventListener('rewritesSaved', handleRewritesSaved)
    return () => {
      window.removeEventListener('rewritesSaved', handleRewritesSaved)
    }
  }, [])

  const loadRewrites = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('rewrites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setRewrites(data || [])
    } catch (err) {
      setError('Failed to load rewrites')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (rewrite: Rewrite) => {
    setEditingId(rewrite.id)
    setEditedText(rewrite.rewritten_text)
  }

  const saveEdit = async (rewrite: Rewrite) => {
    if (!user) {
      setError('Please sign in to edit rewrites')
      return
    }

    try {
      console.log('Attempting to update rewrite:', {
        id: rewrite.id,
        user_id: user.id,
        editedText: editedText.slice(0, 50) + '...' // Log first 50 chars for debugging
      })

      // First update in Supabase
      const { data, error: updateError } = await supabase
        .from('rewrites')
        .update({ 
          rewritten_text: editedText
        })
        .eq('id', rewrite.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Supabase update error:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        })
        setError(`Failed to save edit: ${updateError.message || 'Unknown error'}`)
        return
      }

      if (!data) {
        console.error('No data returned from update - rewrite might not exist')
        setError('Failed to update rewrite: Rewrite not found')
        return
      }

      console.log('Successfully updated rewrite:', {
        id: data.id,
        updated: true
      })

      // Update local state with the data from Supabase
      setRewrites(prev => prev.map(r => 
        r.id === rewrite.id ? data : r
      ))
      setEditingId(null)
      setEditedText('')
      setError('') // Clear any previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Save edit error:', {
        error: err,
        message: errorMessage,
        rewriteId: rewrite.id
      })
      setError(`Failed to save edit: ${errorMessage}`)
    }
  }

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback(id)
      setTimeout(() => setCopyFeedback(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditedText('')
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>
  }

  if (error) {
    return <div className="text-red-600 py-4">{error}</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Saved Rewrites</h2>
      {rewrites.length === 0 ? (
        <p className="text-gray-500">No saved rewrites yet.</p>
      ) : (
        <div className="space-y-4">
          {rewrites.map((rewrite) => (
            <div key={rewrite.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500 capitalize">
                  {rewrite.rewrite_mode.replace('_', ' ')}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(rewrite.rewritten_text, rewrite.id)}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      copyFeedback === rewrite.id
                        ? 'bg-green-100 text-green-800'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    {copyFeedback === rewrite.id ? 'Copied!' : 'Copy'}
                  </button>
                  {editingId !== rewrite.id ? (
                    <button
                      onClick={() => startEditing(rewrite)}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveEdit(rewrite)}
                        className="px-3 py-1 text-green-600 hover:text-green-800 rounded-md transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 text-red-600 hover:text-red-800 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Original</h3>
                <p className="text-gray-600 text-sm">{rewrite.original_text}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Rewritten</h3>
                {editingId === rewrite.id ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-600">{rewrite.rewritten_text}</p>
                )}
              </div>

              <div className="text-xs text-gray-400 mt-2">
                {new Date(rewrite.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 