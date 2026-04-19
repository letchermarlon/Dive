import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, projectId } = await request.json()
  if (!taskId || !projectId) {
    return NextResponse.json({ error: 'Missing taskId or projectId' }, { status: 400 })
  }

  const { data: session } = await supabaseAdmin
    .from('focus_sessions')
    .insert({
      user_id: user.id,
      task_id: taskId,
      project_id: projectId,
      duration_minutes: 25,
      status: 'active',
    })
    .select('id')
    .single()

  if (!session) return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })

  return NextResponse.json({ sessionId: session.id })
}
