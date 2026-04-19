import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await request.json()

  const VALID_STATUSES = ['backlog', 'todo', 'doing', 'done', 'blocked'] as const
  type TaskStatus = typeof VALID_STATUSES[number]
  if (!VALID_STATUSES.includes(status as TaskStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { data: task } = await supabaseAdmin.from('tasks').select('project_id, status').eq('id', id).single()
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: membership } = await supabaseAdmin
    .from('project_members')
    .select('id')
    .eq('project_id', task.project_id)
    .eq('user_id', userId)
    .single()

  if (!membership) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabaseAdmin.from('tasks').update({ status }).eq('id', id)

  if (status === 'done' && task.status !== 'done') {
    const { data: stat } = await supabaseAdmin
      .from('team_stats')
      .select('completed_tasks')
      .eq('user_id', userId)
      .eq('project_id', task.project_id)
      .single()

    const newCount = (stat?.completed_tasks ?? 0) + 1

    await supabaseAdmin
      .from('team_stats')
      .upsert({ user_id: userId, project_id: task.project_id, completed_tasks: newCount })

    await supabaseAdmin
      .from('seafloor_state')
      .upsert({
        user_id: userId,
        project_id: task.project_id,
        progress_score: newCount,
        last_activity_at: new Date().toISOString(),
      }, { onConflict: 'user_id,project_id' })
  }

  return NextResponse.json({ ok: true })
}
