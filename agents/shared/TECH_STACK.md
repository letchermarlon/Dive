# Dive — Tech Stack

> Keep this file up to date. Whenever a new service, library, or integration is added to the project, add it here.

## Core

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 15 (App Router) | Server Components by default |
| Language | TypeScript (strict) | No `any` |
| Styling | Tailwind CSS | No inline `style=` except dynamic values |
| Animation | Framer Motion | Meaningful transitions only |
| Deployment | Vercel | Auto-deploys from `main` |

## Database & Auth

| Service | Purpose | Client |
|---------|---------|--------|
| Supabase | Postgres database, auth, realtime | `src/lib/supabase.ts` |
| Clerk | Authentication & Google OAuth | Middleware + `@clerk/nextjs` |

## AI

| Service | Model | Usage |
|---------|-------|-------|
| Google Gemini | `gemini-2.5-flash-lite` (free tier) | Sprint planning, AI suggestions via `src/lib/gemini.ts` |

## Key Libraries

| Package | Purpose |
|---------|---------|
| `@clerk/nextjs` | Auth provider and session management |
| `@supabase/supabase-js` | Supabase JS client |
| `@google/generative-ai` | Gemini SDK |
| `framer-motion` | Animations |
| `tailwindcss` | Utility-first CSS |

## Environment Variables

| Variable | Where to get it |
|----------|----------------|
| `GEMINI_API_KEY` | https://aistudio.google.com |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project dashboard (server-only) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard |
| `CLERK_SECRET_KEY` | Clerk dashboard (server-only) |
