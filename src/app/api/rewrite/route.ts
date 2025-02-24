import { createClient } from '@/lib/supabase/server'
import { openai, getPromptForMode, type RewriteMode } from '@/lib/openai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { originalText, rewriteMode } = await request.json()

    if (!originalText || !rewriteMode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const prompt = getPromptForMode(rewriteMode as RewriteMode, originalText)

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that rewrites text based on the given instructions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    })

    const rewrittenText = completion.choices[0]?.message?.content || ''

    // Return just the rewritten text - saving will be handled by the Save button
    return NextResponse.json({
      rewrittenText,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in rewrite API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 