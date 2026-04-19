import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  const { data: tasks } = await supabase.from('tasks').select('*').eq('project_id', id)
  const { data: sprints } = await supabase
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
