-- Run this in your Supabase SQL editor (Database > SQL Editor > New query)

-- Profiles (synced from auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
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
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Project Members
create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
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
  assigned_to uuid references auth.users(id) on delete set null,
  estimated_minutes int,
  created_at timestamptz default now()
);

-- Focus Sessions
create table focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
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
  user_id uuid references auth.users(id) on delete cascade,
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
  user_id uuid references auth.users(id) on delete cascade,
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
  user_id uuid references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  completed_tasks int default 0,
  focus_sessions int default 0,
  consistency_score int default 0,
  unique(user_id, project_id)
);

-- Auto-create profile on sign up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Row Level Security
alter table profiles        enable row level security;
alter table projects        enable row level security;
alter table project_members enable row level security;
alter table sprints         enable row level security;
alter table tasks           enable row level security;
alter table focus_sessions  enable row level security;
alter table sprint_reviews  enable row level security;
alter table seafloor_state  enable row level security;
alter table team_stats      enable row level security;

-- Profiles: users can read all, update their own
create policy "profiles_read"   on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Projects: members can read, anyone authenticated can create
create policy "projects_read"   on projects for select using (
  exists (select 1 from project_members where project_id = projects.id and user_id = auth.uid())
);
create policy "projects_insert" on projects for insert with check (auth.uid() = created_by);
create policy "projects_update" on projects for update using (auth.uid() = created_by);

-- Project Members: members can read, service role inserts
create policy "members_read"   on project_members for select using (
  exists (select 1 from project_members pm where pm.project_id = project_members.project_id and pm.user_id = auth.uid())
);
create policy "members_insert" on project_members for insert with check (auth.uid() = user_id);

-- Sprints: project members can read/update
create policy "sprints_read"   on sprints for select using (
  exists (select 1 from project_members where project_id = sprints.project_id and user_id = auth.uid())
);
create policy "sprints_insert" on sprints for insert with check (
  exists (select 1 from project_members where project_id = sprints.project_id and user_id = auth.uid())
);
create policy "sprints_update" on sprints for update using (
  exists (select 1 from project_members where project_id = sprints.project_id and user_id = auth.uid())
);

-- Tasks: project members can read/update
create policy "tasks_read"   on tasks for select using (
  exists (select 1 from project_members where project_id = tasks.project_id and user_id = auth.uid())
);
create policy "tasks_insert" on tasks for insert with check (
  exists (select 1 from project_members where project_id = tasks.project_id and user_id = auth.uid())
);
create policy "tasks_update" on tasks for update using (
  exists (select 1 from project_members where project_id = tasks.project_id and user_id = auth.uid())
);

-- Focus Sessions: own sessions only
create policy "sessions_read"   on focus_sessions for select using (auth.uid() = user_id);
create policy "sessions_insert" on focus_sessions for insert with check (auth.uid() = user_id);
create policy "sessions_update" on focus_sessions for update using (auth.uid() = user_id);

-- Sprint Reviews: project members can read, users insert their own
create policy "reviews_read"   on sprint_reviews for select using (
  exists (select 1 from sprints s join project_members pm on pm.project_id = s.project_id where s.id = sprint_reviews.sprint_id and pm.user_id = auth.uid())
);
create policy "reviews_insert" on sprint_reviews for insert with check (auth.uid() = user_id);

-- Seafloor: own state only
create policy "seafloor_read"   on seafloor_state for select using (auth.uid() = user_id);
create policy "seafloor_insert" on seafloor_state for insert with check (auth.uid() = user_id);
create policy "seafloor_update" on seafloor_state for update using (auth.uid() = user_id);

-- Team Stats: project members can read all, own insert/update
create policy "stats_read"   on team_stats for select using (
  exists (select 1 from project_members where project_id = team_stats.project_id and user_id = auth.uid())
);
create policy "stats_insert" on team_stats for insert with check (auth.uid() = user_id);
create policy "stats_update" on team_stats for update using (auth.uid() = user_id);
