import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: session } = await supabaseAdmin
    .from('focus_sessions')
    .select('project_id, user_id')
    .eq('id', id)
    .single()

  if (!session || session.user_id !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await supabaseAdmin
    .from('focus_sessions')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', id)

  const { data: stats } = await supabaseAdmin
    .from('team_stats')
    .select('focus_sessions, completed_tasks')
    .eq('user_id', userId)
    .eq('project_id', session.project_id)
    .single()

  await supabaseAdmin.from('team_stats').upsert({
    user_id: userId,
    project_id: session.project_id,
    focus_sessions: (stats?.focus_sessions ?? 0) + 1,
    completed_tasks: stats?.completed_tasks ?? 0,
  })

  const { data: floor } = await supabaseAdmin
    .from('seafloor_state')
    .select('progress_score')
    .eq('user_id', userId)
    .eq('project_id', session.project_id)
    .single()

  await supabaseAdmin.from('seafloor_state').upsert({
    user_id: userId,
    project_id: session.project_id,
    progress_score: (floor?.progress_score ?? 0) + 1,
    health_score: 100,
    last_activity_at: new Date().toISOString(),
  }, { onConflict: 'user_id,project_id' })

  return NextResponse.json({ ok: true })
}
