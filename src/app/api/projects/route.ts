import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { AIPlanOutput } from '@/types'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('project_members')
    .select('project_id, projects(id, name, description)')
    .eq('user_id', userId)

  return NextResponse.json({ projects: data })
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  if (body.completeSprintId && body.nextSprint) {
    await supabaseAdmin
      .from('sprints')
      .update({ status: 'complete', ended_at: new Date().toISOString() })
      .eq('id', body.completeSprintId)

    const { data: sprint } = await supabaseAdmin
      .from('sprints')
      .insert({ project_id: body.projectId, title: 'Next sprint', status: 'active' })
      .select('id')
      .single()

    if (sprint) {
      const tasks = (body.nextSprint as { title: string; description: string }[]).map(t => ({
        project_id: body.projectId,
        sprint_id: sprint.id,
        title: t.title,
        description: t.description,
        status: 'todo',
      }))
      await supabaseAdmin.from('tasks').insert(tasks)
    }

    return NextResponse.json({ ok: true })
  }

  const { name, goal, plan } = body as { name: string; goal: string; plan: AIPlanOutput }

  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .insert({ name, goal, description: plan.projectSummary, created_by: userId })
    .select('id')
    .single()

  if (error || !project) return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })

  const projectId = project.id

  await Promise.all([
    supabaseAdmin.from('project_members').insert({ project_id: projectId, user_id: userId, role: 'owner' }),
    supabaseAdmin.from('seafloor_state').insert({ user_id: userId, project_id: projectId }),
    supabaseAdmin.from('team_stats').insert({ user_id: userId, project_id: projectId }),
  ])

  const { data: sprint } = await supabaseAdmin
    .from('sprints')
    .insert({ project_id: projectId, title: 'Sprint 1', goal: plan.recommendedFirstStep, status: 'active' })
    .select('id')
    .single()

  if (sprint) {
    const sprintTasks = plan.currentSprint.map(t => ({
      project_id: projectId,
      sprint_id: sprint.id,
      title: t.title,
      description: t.description,
      status: 'todo',
    }))
    const backlogTasks = plan.backlog.map(t => ({
      project_id: projectId,
      title: t.title,
      description: t.description,
      status: 'backlog',
    }))
    await supabaseAdmin.from('tasks').insert([...sprintTasks, ...backlogTasks])
  }

  return NextResponse.json({ projectId })
}
