# AI Text Rewriter

A web application that uses AI to rewrite text in different styles and formats. Built with Next.js, Supabase, and OpenAI.

## Features

- Text rewriting in multiple styles:
  - Summarization
  - Bullet points
  - Casual tone
  - Formal tone
- User authentication
- History of rewrites
- Copy to clipboard functionality
- Responsive design

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd rewriter-course
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   OPENAI_API_KEY=your-openai-api-key
   ```

4. Set up your Supabase database:
   - Create a new Supabase project
   - Run the SQL migrations in `supabase/migrations/`
   - Enable Email auth in Authentication settings

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application can be deployed to Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add the environment variables
4. Deploy

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend and authentication
- [OpenAI](https://openai.com/) - AI text generation
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT
