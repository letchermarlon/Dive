import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, title } = await request.json()
  if (!projectId || !title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'projectId and title are required' }, { status: 400 })
  }
  if (title.length > 300) {
    return NextResponse.json({ error: 'Title too long' }, { status: 400 })
  }

  const { data: membership } = await supabaseAdmin
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!membership) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: task, error } = await supabaseAdmin
    .from('tasks')
    .insert({ project_id: projectId, title: title.trim(), status: 'todo', members: [] })
    .select('*')
    .single()

  if (error || !task) return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })

  return NextResponse.json({ task })
}
