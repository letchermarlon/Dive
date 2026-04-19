import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function getTaskAndVerifyMembership(taskId: string, userId: string) {
  const { data: task } = await supabaseAdmin.from('tasks').select('project_id, status').eq('id', taskId).single()
  if (!task) return null
  const { data: membership } = await supabaseAdmin
    .from('project_members')
    .select('id')
    .eq('project_id', task.project_id)
    .eq('user_id', userId)
    .single()
  if (!membership) return null
  return task
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await getTaskAndVerifyMembership(id, user.id)
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (body.status !== undefined) {
    const VALID = ['todo', 'doing', 'done'] as const
    if (!VALID.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    updates.status = body.status
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0 || body.title.length > 300) {
      return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
    }
    updates.title = body.title.trim()
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string' || body.description.length > 2000) {
      return NextResponse.json({ error: 'Description too long' }, { status: 400 })
    }
    updates.description = body.description
  }

  if (body.members !== undefined) {
    if (!Array.isArray(body.members)) return NextResponse.json({ error: 'Invalid members' }, { status: 400 })
    updates.members = body.members
  }

  await supabaseAdmin.from('tasks').update(updates).eq('id', id)

  return NextResponse.json({ ok: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await getTaskAndVerifyMembership(id, user.id)
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabaseAdmin.from('tasks').delete().eq('id', id)

  return NextResponse.json({ ok: true })
}
