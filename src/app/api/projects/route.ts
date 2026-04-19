import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = user.id

  const { data } = await supabaseAdmin
    .from('project_members')
    .select('project_id, projects(id, name, description)')
    .eq('user_id', userId)

  return NextResponse.json({ projects: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = user.id

  const { name, goal } = await request.json()
  if (!name || typeof name !== 'string' || name.length > 200) {
    return NextResponse.json({ error: 'Invalid project name' }, { status: 400 })
  }

  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .insert({ name, goal: goal ?? '', description: goal ?? '', created_by: userId })
    .select('id')
    .single()

  if (error || !project) return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })

  const projectId = project.id

  await Promise.all([
    supabaseAdmin.from('project_members').insert({ project_id: projectId, user_id: userId, role: 'owner' }),
    supabaseAdmin.from('seafloor_state').insert({ user_id: userId, project_id: projectId }),
    supabaseAdmin.from('team_stats').insert({ user_id: userId, project_id: projectId }),
  ])

  return NextResponse.json({ projectId })
}
