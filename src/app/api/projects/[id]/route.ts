import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabaseAdmin
    .from('project_members')
    .select('id')
    .eq('project_id', id)
    .eq('user_id', userId)
    .single()

  if (!membership) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: project } = await supabaseAdmin.from('projects').select('*').eq('id', id).single()
  const { data: tasks } = await supabaseAdmin.from('tasks').select('*').eq('project_id', id)
  const { data: sprints } = await supabaseAdmin
    .from('sprints')
    .select('*')
    .eq('project_id', id)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)

  return NextResponse.json({
    project,
    tasks: tasks ?? [],
    activeSprint: sprints?.[0] ?? null,
  })
}
