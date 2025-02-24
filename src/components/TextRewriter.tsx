'use client'

import { useState } from 'react'
import { RewriteMode } from '@/lib/openai'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks'
import SavedOutputs from './SavedOutputs'

// Create a custom event type to include the rewrite data
interface RewriteSavedEvent extends Event {
  detail?: {
    rewrite: {
      id: string
      user_id: string
      original_text: string
      rewritten_text: string
      rewrite_mode: RewriteMode
      created_at: string
    }
  }
}

const rewriteModes: { value: RewriteMode; label: string }[] = [
  { value: 'summary', label: 'Summarize' },
  { value: 'bullet_points', label: 'Bullet Points' },
  { value: 'casual', label: 'Casual Tone' },
  { value: 'formal', label: 'Formal Tone' },
]

export default function TextRewriter() {
  const [originalText, setOriginalText] = useState('')
  const [rewriteMode, setRewriteMode] = useState<RewriteMode>('summary')
  const [rewrittenText, setRewrittenText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const supabase = createClient()
  const { user } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setRewrittenText('')
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText,
          rewriteMode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rewrite text')
      }

      setRewrittenText(data.rewrittenText)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rewrittenText)
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleSave = async () => {
    if (!user) {
      setError('Please sign in to save rewrites')
      return
    }

    try {
      const { data, error: insertError } = await supabase
        .from('rewrites')
        .insert({
          user_id: user.id,
          original_text: originalText,
          rewritten_text: rewrittenText,
          rewrite_mode: rewriteMode,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Create custom event with the new rewrite data
      const event = new CustomEvent('rewritesSaved', {
        detail: {
          rewrite: data
        }
      }) as RewriteSavedEvent

      // Dispatch event with the new rewrite data
      window.dispatchEvent(event)

      // Show success feedback
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)

      // Show history and clear any errors
      setShowHistory(true)
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Failed to save rewrite: ${errorMessage}`)
      console.error('Save error:', errorMessage)
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="originalText"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Original Text
            </label>
            <textarea
              id="originalText"
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your text here..."
              required
            />
          </div>

          <div>
            <label
              htmlFor="rewriteMode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Rewrite Mode
            </label>
            <select
              id="rewriteMode"
              value={rewriteMode}
              onChange={(e) => setRewriteMode(e.target.value as RewriteMode)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {rewriteModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Rewriting...' : 'Rewrite Text'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {rewrittenText && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                Rewritten Text
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    copyFeedback
                      ? 'bg-green-100 text-green-800'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {copyFeedback ? 'Copied!' : 'Copy to clipboard'}
                </button>
                {user && (
                  <button
                    onClick={handleSave}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      saveSuccess
                        ? 'bg-green-100 text-green-800'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    {saveSuccess ? 'Saved!' : 'Save'}
                  </button>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-md p-4 whitespace-pre-wrap">
              {rewrittenText}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">History</h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showHistory ? 'Hide' : 'Show'}
          </button>
        </div>
        {showHistory && <SavedOutputs />}
      </div>
    </div>
  )
} 