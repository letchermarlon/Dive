# Changelog

User-facing record of what has been added, changed, or fixed.

---

## [0.2.0] — 2026-04-19

### Added
- Figtree font (Google Fonts) applied globally
- shadcn-ready UI components: Button, Card, Input, Textarea, Badge, Progress
- Ocean design token system in globals.css (glass cards, border, muted colors)
- `frontend/` root folder with prototype reference and design notes

### Changed
- Replaced Supabase Auth with Clerk for authentication (Google OAuth)
- Sign-in and sign-up pages now use Clerk's embedded UI with Google OAuth button
- All DB operations now use the Supabase service role key; auth is enforced in middleware and API routes

### Fixed
- TypeScript errors in dashboard, team page, middleware (pre-existing)

---

## [0.1.0] — 2026-04-18

### Added
- Initial project scaffold (Next.js 15, TypeScript, Tailwind CSS)
- Ocean color palette and base styling
- Gemini 2.5 Flash-Lite integration for AI planning
- Supabase client setup
- Shared TypeScript data model types
