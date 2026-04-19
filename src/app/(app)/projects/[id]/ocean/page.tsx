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

  const [{ data: tasksRaw }, { data: floor }] = await Promise.all([
    supabaseAdmin.from('tasks').select('*').eq('project_id', id).in('status', ['todo', 'doing', 'done']),
    supabaseAdmin.from('seafloor_state').select('*').eq('project_id', id).eq('user_id', userId).single(),
  ])

  const tasks = (tasksRaw ?? []).map(t => ({
    id: t.id as string,
    projectId: t.project_id as string,
    title: t.title as string,
    description: (t.description ?? '') as string,
    status: t.status as 'todo' | 'doing' | 'done',
    members: (t.members ?? []) as string[],
  }))

  const myTasks = tasks.filter(t => t.members?.includes(userId))
  const doneTasks = tasks.filter(t => t.status === 'done').length

  return (
    <OceanView
      projectId={id}
      tasks={myTasks}
      progressScore={floor?.progress_score ?? 0}
      healthScore={floor?.health_score ?? 100}
      streakDays={floor?.streak_days ?? 0}
      doneTasks={doneTasks}
    />
  )
}
