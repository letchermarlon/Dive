---
name: dive-engineer
description: Build and extend the Dive web app using Next.js App Router, TypeScript, Tailwind CSS, Supabase, and Gemini API. Follow these rules for all new code.
---

# Dive Engineer

## Overview

Build around the Next.js App Router. Keep server and client code clearly separated. Use Supabase for data and auth, Gemini for AI features, Tailwind for all styling, and Framer Motion for animation. Every feature must plug into the shared type system in `src/types/index.ts`.

## Project Structure

```
src/
  app/                      ← Next.js App Router pages and layouts
    (auth)/                 ← Auth group: sign-in, sign-up
    (dashboard)/            ← Authenticated app: project, sprint, reef views
    api/                    ← API route handlers (server-only logic)
  components/               ← Shared UI components
    ui/                     ← Primitives: Button, Card, Input, Modal, etc.
    reef/                   ← Seafloor and sea-life visual components
    sprint/                 ← Sprint board, task cards, backlog
    session/                ← Focus session timer and controls
  lib/
    gemini.ts               ← Gemini client and generateJSON helper
    supabase.ts             ← Supabase browser and admin clients
    prompts.ts              ← All AI prompt templates (keep prompts here, not inline)
  types/
    index.ts                ← Canonical data model — extend here, never duplicate
  hooks/                    ← Custom React hooks (useSession, useSprintBoard, etc.)
```

## Rules

### General
- All new types go in `src/types/index.ts` — never define types inline in components
- No `any` — use proper TypeScript types everywhere
- All styling via Tailwind utility classes — no inline `style=` except for dynamic values (e.g. animation transforms)
- No uncontrolled `console.log` in committed code — use `console.error` only for caught errors

### Server vs Client
- Default to Server Components — only add `"use client"` when you need browser APIs, state, or event handlers
- API routes (`src/app/api/`) handle all Supabase admin queries and Gemini calls — never expose `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` to the client
- Pass data down as props from server components; fetch on the server where possible

### Supabase
- All database reads/writes go through `src/lib/supabase.ts`
- Use `supabaseAdmin` (service role) only in API routes — use `supabase` (anon) for client-side auth helpers
- Row-level security (RLS) must be enabled on all tables — never rely solely on application-level checks
- Use Supabase Realtime for team dashboard updates (rankings, task completions)

### Gemini AI
- All Gemini calls go through `src/lib/gemini.ts` — never instantiate `GoogleGenerativeAI` elsewhere
- All prompt strings live in `src/lib/prompts.ts` — keep prompts readable and editable in one place
- Always use `responseMimeType: "application/json"` and parse with `generateJSON<T>()` — never parse freeform AI text
- Include a fallback template if the AI call fails (see `AIPlanOutput` default in `src/lib/prompts.ts`)
- Gemini rate limit: 1,000 req/day free tier — batch where possible, cache results in Supabase

### Components
- One component per file
- Props interfaces defined at the top of the file
- Framer Motion only for meaningful transitions (reef growth, task completion, session start/end) — not decorative micro-animations
- Reef/seafloor visuals: use layered DOM/CSS or canvas — keep sprite logic in `src/components/reef/`

### Seafloor Progression
- Progression thresholds are defined in `src/lib/progression.ts` — do not hardcode unlock logic in components
- Health score and progress score are computed server-side and stored in `seafloor_state` — components only render what they receive
- Decay is soft: never delete unlocked objects, only reduce `healthScore` and toggle visibility

### Focus Sessions
- Timer state lives in a client component (`src/components/session/`)
- Session start/end events POST to `src/app/api/sessions/` — do not update Supabase directly from the client session component
- Abandonment (tab close, early quit) should fire a `beforeunload` + a session abort endpoint

### API Routes
- All routes return `{ data, error }` shape
- Use `NextResponse.json({ error: "message" }, { status: 4xx })` for errors
- Authenticate every route: check the Supabase session from the Authorization header or cookie before touching data

## Workflow

1. Before building a feature, check `agents/shared/plans/` for an existing design
2. If no plan exists and the feature is non-trivial, write one in `shared/plans/` before coding
3. After completing a feature, post a short update to `agents/shared/BOARD.md`
4. After a visible user-facing change, add a line to `agents/shared/CHANGELOG.md`
