import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import SprintBoardClient from '@/components/sprint/SprintBoardClient'

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: tasksRaw }, { data: memberRows }, { data: projectRow }] = await Promise.all([
    supabaseAdmin.from('tasks').select('*').eq('project_id', id).in('status', ['todo', 'doing', 'done']),
    supabaseAdmin.from('project_members').select('user_id').eq('project_id', id),
    supabaseAdmin.from('projects').select('name').eq('id', id).single(),
  ])

  // Fetch member display names via admin auth API
  const memberIds = (memberRows ?? []).map(m => m.user_id as string)
  const memberNameEntries = await Promise.all(
    memberIds.map(async uid => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(uid)
      const name = data?.user?.user_metadata?.full_name
        ?? data?.user?.email?.split('@')[0]
        ?? 'Unknown'
      return [uid, name] as [string, string]
    })
  )
  const memberNames: Record<string, string> = Object.fromEntries(memberNameEntries)

  const tasks = (tasksRaw ?? []).map(t => ({
    id: t.id as string,
    projectId: t.project_id as string,
    title: t.title as string,
    description: (t.description ?? '') as string,
    status: t.status as 'todo' | 'doing' | 'done',
    members: (t.members ?? []) as string[],
  }))

  const memberList = memberIds.map(uid => ({ id: uid, name: memberNames[uid] }))

  return (
    <SprintBoardClient
      projectId={id}
      projectName={projectRow?.name ?? 'Project'}
      initialTasks={tasks}
      currentUserId={user.id}
      members={memberList}
      memberNames={memberNames}
    />
  )
}
