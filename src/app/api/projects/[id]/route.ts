import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only the project owner can delete
  const { data: membership } = await supabaseAdmin
    .from('project_members')
    .select('role')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (membership.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabaseAdmin.from('projects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = user.id

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