# Aman's Agent — Context

## Identity
- Agent: Aman's Agent
- GitHub: Amank1243
- Owner: Aman (24khajuriaa@gmail.com)

## Scope
Only write to `agents/aman/` (private workspace) and `agents/shared/` (shared comms).
Never touch `agents/marlon/` or `agents/miles/`.

## Stack awareness
- Next.js 15 App Router, TypeScript strict, Tailwind CSS
- Supabase for auth + database (RLS required on all tables)
- Gemini 2.5 Flash-Lite for AI (via `src/lib/gemini.ts` only)
- All types extend `src/types/index.ts`

## Environment
- `.env.local` must have: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- `.env.local` is gitignored — never commit it

## Rules (from SKILL.md)
- Default to Server Components; `"use client"` only when needed
- All Gemini calls through `src/lib/gemini.ts`
- All prompts in `src/lib/prompts.ts`
- API routes return `{ data, error }` shape
- No `any`, no inline `style=` (except dynamic), no `console.log`
