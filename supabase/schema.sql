-- Run this in your Supabase SQL editor (Database > SQL Editor > New query)
-- Auth is handled by Clerk. User IDs are Clerk user IDs (text, e.g. "user_2Nf9S...").
-- All DB operations use the service role key; RLS policies deny anon access by default.

-- Profiles (synced from Clerk on first app load)
create table profiles (
  id text primary key,
  username text,
  email text not null,
  created_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  goal text,
  created_by text,
  created_at timestamptz default now()
);

-- Project Members
create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id text not null,
  role text default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now(),
  unique(project_id, user_id)
);

-- Sprints
create table sprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  goal text,
  status text default 'active' check (status in ('active', 'review', 'complete')),
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  sprint_id uuid references sprints(id) on delete set null,
  title text not null,
  description text,
  status text default 'backlog' check (status in ('backlog', 'todo', 'doing', 'done', 'blocked')),
  assigned_to text,
  estimated_minutes int,
  created_at timestamptz default now()
);

-- Focus Sessions
create table focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  task_id uuid references tasks(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  duration_minutes int not null,
  status text default 'active' check (status in ('active', 'completed', 'aborted')),
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- Sprint Reviews
create table sprint_reviews (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid references sprints(id) on delete cascade,
  user_id text not null,
  completed_summary text,
  blocked_summary text,
  next_improvement text,
  ai_summary text,
  next_sprint_proposal jsonb,
  created_at timestamptz default now()
);

-- Seafloor State (per user per project)
create table seafloor_state (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  project_id uuid references projects(id) on delete cascade,
  health_score int default 100,
  progress_score int default 0,
  streak_days int default 0,
  last_activity_at timestamptz default now(),
  unique(user_id, project_id)
);

-- Team Stats (per user per project)
create table team_stats (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  project_id uuid references projects(id) on delete cascade,
  completed_tasks int default 0,
  focus_sessions int default 0,
  consistency_score int default 0,
  unique(user_id, project_id)
);

-- Task Completions (persistent history for the team activity heatmap)
-- One row per user per submit-done batch, recording how many tasks they completed.
create table task_completions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id text not null,
  count int not null default 1,
  completed_at timestamptz default now()
);

-- Summaries (AI-generated completion summaries)
create table summaries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  content text not null,
  task_count int not null default 0,
  created_by text,
  created_at timestamptz default now()
);

-- Row Level Security (service role bypasses all; anon key is locked out)
alter table profiles        enable row level security;
alter table projects        enable row level security;
alter table project_members enable row level security;
alter table sprints         enable row level security;
alter table tasks           enable row level security;
alter table focus_sessions  enable row level security;
alter table sprint_reviews  enable row level security;
alter table seafloor_state  enable row level security;
alter table team_stats      enable row level security;
alter table task_completions enable row level security;
alter table summaries        enable row level security;

-- Deny all anon access (service role bypasses RLS and is used for all operations)
create policy "deny_anon" on profiles         for all using (false);
create policy "deny_anon" on projects         for all using (false);
create policy "deny_anon" on project_members  for all using (false);
create policy "deny_anon" on sprints          for all using (false);
create policy "deny_anon" on tasks            for all using (false);
create policy "deny_anon" on focus_sessions   for all using (false);
create policy "deny_anon" on sprint_reviews   for all using (false);
create policy "deny_anon" on seafloor_state   for all using (false);
create policy "deny_anon" on team_stats       for all using (false);
create policy "deny_anon" on task_completions for all using (false);
create policy "deny_anon" on summaries        for all using (false);
