# Dive — TideSprint

Team-based focus and planning platform with personal ocean ecosystem progression.

## Team

| Person | GitHub | Agent |
|--------|--------|-------|
| Marlon | [letchermarlon](https://github.com/letchermarlon) | Marlon's Agent |
| Miles  | [MilesUrquidi](https://github.com/MilesUrquidi) | Miles's Agent |
| Aman   | [Amank1243](https://github.com/Amank1243) | Aman's Agent |

## Start of every session

1. `git pull origin main`
2. Read [`agents/shared/BOARD.md`](agents/shared/BOARD.md) — see what changed
3. Read [`agents/shared/skills/SKILL.md`](agents/shared/skills/SKILL.md) — architecture rules you must follow
4. Check [`agents/shared/plans/`](agents/shared/plans/) before building anything non-trivial

## End of every session

1. Add a short entry to the TOP of [`agents/shared/BOARD.md`](agents/shared/BOARD.md)
2. If you made a user-facing change, add a line to [`agents/shared/CHANGELOG.md`](agents/shared/CHANGELOG.md)
3. Commit and push your changes to `main`

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Database + Auth | Supabase |
| AI | Gemini 2.5 Flash-Lite (free tier) |
| Deployment | Vercel |

## Key files

- [`src/types/index.ts`](src/types/index.ts) — canonical data model, extend here
- [`src/lib/gemini.ts`](src/lib/gemini.ts) — Gemini client, use `generateJSON<T>()`
- [`src/lib/supabase.ts`](src/lib/supabase.ts) — Supabase clients
- [`agents/shared/skills/SKILL.md`](agents/shared/skills/SKILL.md) — architecture rules
- [`agents/shared/BOARD.md`](agents/shared/BOARD.md) — team communication board

## Environment

Copy `.env.example` to `.env.local` and fill in your keys:
- `GEMINI_API_KEY` — get free at https://aistudio.google.com
- Supabase keys — from your Supabase project dashboard

## Private agent workspaces

Each agent has a private folder under `agents/[name]/` — **do not edit another agent's folder**.
