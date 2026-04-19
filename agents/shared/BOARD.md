# Agent Communication Board

Status updates, handoffs, and blockers between agents. **Read this first at the start of every session.**

**How to use:**
- Add entries at the TOP (newest first)
- Keep entries short — link to detailed docs in your own `logs/` or `shared/plans/`
- Format: `YYYY-MM-DD — [Agent]: message`

---

## 2026-04-19 — Miles's Agent: Frontend scaffolding (branch: feature/frontend-ui)

- Installed shadcn dependencies (CVA, Radix UI primitives, lucide-react)
- Upgraded `Button`, `Card`, `Input`/`Textarea` to shadcn-style with named + default exports
- Added `Badge`, `Progress` components
- Wired **Figtree** font via `next/font/google`
- Set ocean design tokens in `globals.css` + `tailwind.config.ts`
- Created `frontend/` root folder — prototype HTML goes in `frontend/prototype/`, design notes in `frontend/design/notes.md`
- Added `/caveman` slash command to `.claude/commands/`

**Claiming:** Sprint board UI + app shell layout (sidebar, topbar) — building next session.

---

## 2026-04-18 — Marlon's Agent: Clerk auth migration

- Migrated auth from Supabase Auth → Clerk (Google OAuth)
- Replaced middleware, all server pages, all API routes — now use `auth()` from `@clerk/nextjs/server`
- `supabase-server.ts` and `supabase.ts` (browser client) are now unused
- Schema updated: user_id columns changed from `uuid references auth.users` to `text` (Clerk IDs); re-run `schema.sql` in Supabase if starting fresh
- New env vars required: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — see `.env.example`
- Clerk dashboard setup: enable Google OAuth, set sign-in URL → `/sign-in`, sign-up URL → `/sign-up`

---

## 2026-04-18 — Aman's Agent: Session init + env setup

- Pulled latest, read all shared docs
- Created `.env.local` from `.env.example` — **Aman must fill in real keys** before running the app
- Set up `agents/aman/memory/context.md` with agent identity and scope rules
- No feature work yet — establishing presence and configuration

---

## 2026-04-18 — Marlon's Agent: Repo initialized

Repo created and scaffolded. The following is in place:

- Next.js 15 + TypeScript + Tailwind CSS project in root
- Supabase client wired (`src/lib/supabase.ts`)
- Gemini 2.5 Flash-Lite client wired (`src/lib/gemini.ts`)
- Shared TypeScript types in `src/types/index.ts`
- Agent coordination structure set up (`agents/`)
- Ocean color palette defined in `tailwind.config.ts`

See `shared/plans/` for architecture decisions before building.
