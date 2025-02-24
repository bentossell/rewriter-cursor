import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type RewriteMode = 'summary' | 'bullet_points' | 'casual' | 'formal'

export const getPromptForMode = (mode: RewriteMode, text: string): string => {
  switch (mode) {
    case 'summary':
      return `Please provide a concise summary of the following text:\n\n${text}`
    case 'bullet_points':
      return `Please convert the following text into clear, concise bullet points:\n\n${text}`
    case 'casual':
      return `Please rewrite the following text in a more casual, conversational tone:\n\n${text}`
    case 'formal':
      return `Please rewrite the following text in a more formal, professional tone:\n\n${text}`
    default:
      return `Please rewrite the following text:\n\n${text}`
  }
} 