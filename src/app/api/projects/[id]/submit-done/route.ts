import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { memberNames } = await request.json() as { memberNames: Record<string, string> }

  // Verify membership
  const { data: membership } = await supabaseAdmin
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single()
  if (!membership) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get all done tasks
  const { data: doneTasks } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'done')

  if (!doneTasks || doneTasks.length === 0) {
    return NextResponse.json({ error: 'No done tasks to submit' }, { status: 400 })
  }

  // Validate all done tasks have at least one member
  const tasksMissingMembers = doneTasks.filter(t => !t.members || (t.members as string[]).length === 0)
  if (tasksMissingMembers.length > 0) {
    return NextResponse.json({
      error: `${tasksMissingMembers.length} card(s) in Done have no team members assigned. Please add members before submitting.`,
      missingTasks: tasksMissingMembers.map(t => t.title),
    }, { status: 400 })
  }

  const now = new Date()
  const submittedAt = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Build summary prompt
  const taskLines = doneTasks.map(t => {
    const names = (t.members as string[]).map((uid: string) => memberNames[uid] ?? 'Unknown').join(', ')
    return `- "${t.title}" — completed by: ${names}`
  }).join('\n')

  const prompt = `You are writing a completion summary for a team project board. Write a concise, encouraging paragraph (3-5 sentences) summarizing what the team accomplished. Then list who completed what. Be specific and human. Do not use bullet points in the paragraph — write it as flowing prose.

Date: ${submittedAt}
Completed tasks:
${taskLines}

Return plain text only. No markdown headers. Start with the prose paragraph, then a line break, then a brief attribution list like "• Task name — Person Name".`

  let summaryContent = ''
  try {
    const result = await model.generateContent(prompt)
    summaryContent = result.response.text().trim()
  } catch {
    // Fallback summary
    const names = [...new Set(doneTasks.flatMap(t => (t.members as string[]).map((uid: string) => memberNames[uid] ?? 'Unknown')))]
    summaryContent = `The team completed ${doneTasks.length} task${doneTasks.length !== 1 ? 's' : ''} on ${submittedAt}. Great work by ${names.join(', ')}.\n\n` +
      doneTasks.map(t => {
        const names = (t.members as string[]).map((uid: string) => memberNames[uid] ?? 'Unknown').join(', ')
        return `• ${t.title} — ${names}`
      }).join('\n')
  }

  // Save summary
  await supabaseAdmin.from('summaries').insert({
    project_id: projectId,
    content: summaryContent,
    task_count: doneTasks.length,
    created_by: user.id,
  })

  // Update ocean state for members who are on done tasks (only those members)
  const memberTaskCounts: Record<string, number> = {}
  for (const task of doneTasks) {
    for (const uid of (task.members as string[])) {
      memberTaskCounts[uid] = (memberTaskCounts[uid] ?? 0) + 1
    }
  }

  await Promise.all(
    Object.entries(memberTaskCounts).map(async ([uid, count]) => {
      const { data: stat } = await supabaseAdmin
        .from('team_stats')
        .select('completed_tasks')
        .eq('user_id', uid)
        .eq('project_id', projectId)
        .single()

      const newCount = (stat?.completed_tasks ?? 0) + count

      await Promise.all([
        supabaseAdmin.from('team_stats').upsert(
          { user_id: uid, project_id: projectId, completed_tasks: newCount },
          { onConflict: 'user_id,project_id' }
        ),
        supabaseAdmin.from('seafloor_state').upsert(
          { user_id: uid, project_id: projectId, progress_score: newCount, last_activity_at: now.toISOString() },
          { onConflict: 'user_id,project_id' }
        ),
      ])
    })
  )

  // Delete all done tasks
  await supabaseAdmin.from('tasks').delete().eq('project_id', projectId).eq('status', 'done')

  return NextResponse.json({ ok: true, taskCount: doneTasks.length })
}
