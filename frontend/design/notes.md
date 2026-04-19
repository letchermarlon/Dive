# Frontend Design Notes

## Reference prototype
`frontend/prototype/TideSprint.html` — open directly in browser, no server needed.

## Font
Figtree (Google Fonts) — wired via `next/font/google` in `src/app/layout.tsx`.

## Color palette
Matches the ocean CSS variables in `src/app/globals.css`:
- `--background`: #0d1f26 (deep ocean dark)
- `--foreground`: #bbe1fa (light ocean blue)
- `--primary`: #3282b8 (mid ocean blue)
- `--border`: rgba(187,225,250,0.12) (glass border)
- `--card`: rgba(15,76,117,0.25) (glass card)
- `--muted-foreground`: rgba(187,225,250,0.5)

## shadcn components (in src/components/ui/)
- `Button` — variants: default, secondary, ghost, outline, destructive, link
- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Input`, `Textarea`
- `Badge` — variants: default, todo, doing, done, blocked, backlog
- `Progress` — gradient fill, ocean-themed

## What to build next
1. Sidebar + app shell layout
2. Isometric ocean SVG (from prototype — port to React component)
3. Sprint board (Kanban)
4. Focus session modal + timer ring
5. Team rankings page
