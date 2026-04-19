# Agent Communication Board

Status updates, handoffs, and blockers between agents. **Read this first at the start of every session.**

**How to use:**
- Add entries at the TOP (newest first)
- Keep entries short — link to detailed docs in your own `logs/` or `shared/plans/`
- Format: `YYYY-MM-DD — [Agent]: message`

---

## 2026-04-19 — Aman's Agent: Team activity heatmap — wire up task_completions table

- Added `task_completions` table to `supabase/schema.sql` (also added `summaries` which was missing from schema)
- `submit-done` route now inserts one row per member per submission into `task_completions` (with `count` and `completed_at`)
- Team page heatmap now queries `task_completions` instead of `tasks` — tasks are deleted on submit so the old query always returned empty
- **⚠️ Marlon + Miles: run this SQL in Supabase before testing the team heatmap:**

```sql
create table task_completions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id text not null,
  count int not null default 1,
  completed_at timestamptz default now()
);
alter table task_completions enable row level security;
create policy "deny_anon" on task_completions for all using (false);
```

---

## 2026-04-19 — Aman's Agent: Fix board Submit Done progress score bug

- `SprintBoardClient` was never destructuring `currentUserId` from props — fixed
- `confirmSubmit` was calling `onProgressChange(totalDoneCount)` — now correctly passes only tasks where `currentUserId` is in `task.members`
- Server-side (`submit-done/route.ts`) was already correct; bug was purely client-side ocean score update

---

## 2026-04-19 — Miles's Agent: Dashboard UI overhaul + SeaFloor SVG upgrade

- **Dashboard** (`/dashboard`): full visual overhaul to match landing page theme
  - `OceanBackground` WebGL shader added as dashboard backdrop
  - Project cards: solid `#0d1f2e` background, `Card`/`Badge` shadcn components, consistent header height with/without description
  - Buttons: white "My Ocean" (primary), dark "Board" (secondary) with proper hover states; Delete also has hover
  - Nav: minimal floating nav, no Dashboard link, content constrained to `max-w-5xl`
  - Empty state: shadcn `Empty` component (icon, title, description, CTA)
- **SeaFloor** (`src/components/reef/SeaFloor.tsx`): full emoji → SVG upgrade
  - All sea objects now inline SVG: Shell, Seaweed (sway animation), Coral x3, Crab, Turtle, Octopus, Dolphin, Whale
  - Fish actually swim across the reef with CSS `translateX` animation
  - Sand: `feTurbulence` grain texture + wavy SVG edge
  - Water: light shafts now fade in/out independently (5 rays, staggered durations 7–13s)
  - Bubble circles, top glow, subtle ripple lines

**⚠️ Aman + Marlon**: SeaFloor is used on the dashboard cards — no breaking changes to props (`progressScore`, `healthScore`). The `Empty` component was added via `npx shadcn@latest add empty` (new file: `src/components/ui/empty.tsx`).

---

## 2026-04-19 — Marlon's Agent: Team page overhaul + sprint language removal

- **Team page** (`/projects/[id]/team`): full redesign
  - Clean member list (all members, ranked by tasks done, with streak + role badges)
  - **Ocean leaderboard**: top 3 by progress score, each with a mini SeaFloor reef preview
  - **Activity heatmap**: GitHub-style 52-week × 7-day grid of team task completions (`completed_at` field)
  - **Insights**: 4 stat cards (total hours, sessions, avg session, consistency %) + most-active-day callout
  - **Recent sessions**: placeholder with full handoff notes for Aman (see TODO comments in the file)
  - **Invite section**: revamped with copy-to-clipboard for both the join link and project ID
- Removed "Sprint Board" button label from dashboard → now just "Board"
- New components: `src/components/team/ActivityGrid.tsx`, `src/components/team/InviteSection.tsx`

**⚠️ Aman**: See the `Recent sessions` section in `src/app/(app)/projects/[id]/team/page.tsx` — detailed handoff notes are in the TODO comments there for you to implement the session list + AI summary modal.

---

## 2026-04-19 — Marlon's Agent: Sprint board overhaul → Trello-style Board + Summaries

- **Board** (`/projects/[id]/sprint`): 3 columns (To Do, In Progress, Done) with drag-and-drop (`@hello-pangea/dnd`)
- Cards: click to open detail modal (edit title, description, assign members with avatar initials)
- "+ Add task" button in To Do column; delete card with confirmation
- **Submit Done** button on Done column: validates all cards have ≥1 member, confirms, calls Gemini to write AI summary, updates ocean state (only for members on done cards), deletes done cards
- **Summaries** tab replaces Review — persistent AI completion records per project, visible to all members
- Supabase Realtime wired for live board sync across all members
- Removed all "sprint" language from UI — no more backlog/blocked columns
- Project creation now creates a blank project (no AI autofill)
- **DB changes needed**: Run SQL in BOARD.md section below (add `members text[]`, `completed_at`, create `summaries` table, delete backlog/blocked tasks, enable realtime on tasks + summaries)
- Stash: dropped (superseded by pull)

**⚠️ Miles + Aman**: Run the SQL from Marlon's session before testing. Also `npm install` (added `@hello-pangea/dnd`).

---

## 2026-04-19 — Miles's Agent: Full UI implementation from design file

Implemented the full Dive dashboard UI from the Anthropic Design handoff file.

**New pages & routes:**
- `/projects/[id]/ocean` — My Ocean (default route, replaces `/projects/[id]`)
- `/projects/[id]/sprint` — Sprint Board (5-column kanban)
- Team + Review pages fully restyled to match design
- `POST /api/sessions` — new route to start focus sessions

**New components:**
- `IsoOcean` — isometric animated SVG seafloor (rocks, seaweed, coral, fish, jellyfish)
- `FocusModal` — 25-min Pomodoro modal with circular ring timer
- `Sidebar` — project-scoped sidebar nav (replaces top nav for project pages)
- `TopNav` — retained for dashboard + new project pages

**Layout change:** `/projects/[id]/layout.tsx` added — full-height sidebar layout. `(app)/layout.tsx` stripped to bare auth wrapper. **Marlon + Aman: no `npm install` needed, but do `git pull`.**

---

## 2026-04-19 — Miles's Agent: Frontend scaffolding merged to main

**⚠️ Marlon + Aman: please `git pull origin main` and `npm install`**

Merged `feature/frontend-ui` → `main`. New packages added (CVA, Radix UI, lucide-react, clsx, tailwind-merge). Run `npm install` before your next session or the build will fail.

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
