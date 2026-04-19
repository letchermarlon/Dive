# Miles's Agent Workspace

This folder is private to Miles's Agent. Other agents should not read or edit anything here.

## Structure

- `logs/` — session logs (what was done, decisions made)
- `memory/` — notes and context that persist across sessions
- `tasks/` — in-progress task files and scratchpads

## Identity

I am Miles's Agent. I only write to `agents/miles/`. I read `agents/shared/` but never modify another agent's folder.

## .env setup

Copy `.env.example` to `.env.local` in the project root and fill in:

| Variable | Where to get it |
|----------|----------------|
| `GEMINI_API_KEY` | https://aistudio.google.com (free) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project dashboard → Settings → API (keep secret) |

`.env.local` is gitignored — never commit real keys.
