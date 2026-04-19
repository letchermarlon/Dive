import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import OceanView from './OceanView'

export default async function OceanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const userId = user.id

  const [
    { data: tasksRaw },
    { data: floor },
    { data: sprints },
    { data: stats },
  ] = await Promise.all([
    supabaseAdmin.from('tasks').select('*').eq('project_id', id),
    supabaseAdmin.from('seafloor_state').select('*').eq('project_id', id).eq('user_id', userId).single(),
    supabaseAdmin.from('sprints').select('*').eq('project_id', id).eq('status', 'active').order('started_at', { ascending: false }).limit(1),
    supabaseAdmin.from('team_stats').select('*').eq('project_id', id).eq('user_id', userId).single(),
  ])

  const tasks = (tasksRaw ?? []).map(t => ({
    id: t.id as string,
    projectId: t.project_id as string,
    title: t.title as string,
    description: (t.description ?? '') as string,
    status: t.status as 'backlog' | 'todo' | 'doing' | 'done' | 'blocked',
    assignedTo: t.assigned_to as string | undefined,
    estimatedMinutes: t.estimated_minutes as number | undefined,
    sprintId: t.sprint_id as string | undefined,
  }))

  const myTasks = tasks.filter(t => t.assignedTo === userId)
  const sprint = sprints?.[0] ?? null

  const sprintName = sprint?.title ?? 'Sprint 1'
  const sprintGoal = sprint?.goal ?? 'Build the core prototype'

  const startedAt = sprint?.started_at ? new Date(sprint.started_at) : new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const daysLeft = Math.max(0, 14 - Math.floor((Date.now() - startedAt.getTime()) / msPerDay))

  const sprintTasks = tasks.filter(t => t.sprintId === sprint?.id)
  const doneTasks = sprintTasks.filter(t => t.status === 'done').length

  return (
    <OceanView
      projectId={id}
      tasks={myTasks}
      progressScore={floor?.progress_score ?? 0}
      healthScore={floor?.health_score ?? 100}
      streakDays={floor?.streak_days ?? 0}
      sprintGoal={sprintGoal}
      sprintName={sprintName}
      daysLeft={daysLeft}
      totalSprintTasks={sprintTasks.length}
      doneTasks={doneTasks}
      focusSessions={stats?.focus_sessions ?? 0}
      blockedCount={tasks.filter(t => t.status === 'blocked').length}
      backlogCount={tasks.filter(t => t.status === 'backlog').length}
    />
  )
}
