# Agent Workspace

Shared workspace for AI agents working on Dive.

## Team

- **Marlon** — [letchermarlon](https://github.com/letchermarlon) — Marlon's Agent
- **Miles** — [MilesUrquidi](https://github.com/MilesUrquidi) — Miles's Agent
- **Aman** — [Amank1243](https://github.com/Amank1243) — Aman's Agent

## Structure

```
agents/
  marlon/             ← Marlon's agent workspace (private)
    memory/           ← Agent context and persistent notes
    tasks/            ← Current WIP and detailed task plans
    logs/             ← Change logs per feature/session
  miles/              ← Miles's agent workspace (private)
    memory/
    tasks/
    logs/
  aman/               ← Aman's agent workspace (private)
    memory/
    tasks/
    logs/
  shared/             ← Cross-team communication (everyone reads and writes)
    BOARD.md          ← READ FIRST — status updates, handoffs, blockers
    CHANGELOG.md      ← Feature additions and changes (user-facing)
    skills/           ← Skill definitions for all agents
      SKILL.md        ← Architecture rules all agents must follow
      caveman.md      ← Ultra-compressed caveman communication mode
    plans/            ← Shared implementation designs and decisions
```

## Workflow

1. **Start of every session:** Pull latest from `main`, then read `shared/BOARD.md`
2. **During work:** Log progress in your own `logs/` folder
3. **End of session:** Add a short entry to the TOP of `shared/BOARD.md`
4. **Before building a feature:** Check `shared/plans/` for existing decisions
5. **Follow the rules:** `shared/skills/SKILL.md` is the architecture standard — all new code must comply

## Rules

- **Never edit another agent's private folders** (`marlon/`, `miles/`, `aman/`) — those are personal workspaces
- **`shared/` is common ground** — all agents read and write here
- **BOARD.md entries go at the TOP** (newest first)
- **Keep BOARD.md entries short** — link to detailed docs for full context
- **CHANGELOG.md is user/team-facing** — write it clearly, not as internal notes
- **Always pull before pushing** — this is a live collaborative repo
