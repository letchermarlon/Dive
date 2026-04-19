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

  const { data: membership } = await supabaseAdmin
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single()
  if (!membership) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: doneTasks } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'done')

  if (!doneTasks || doneTasks.length === 0) {
    return NextResponse.json({ error: 'No done tasks to submit' }, { status: 400 })
  }

  const tasksMissingMembers = doneTasks.filter(t => !t.members || (t.members as string[]).length === 0)
  if (tasksMissingMembers.length > 0) {
    return NextResponse.json({
      error: `${tasksMissingMembers.length} card(s) in Done have no team members assigned. Please add members before submitting.`,
      missingTasks: tasksMissingMembers.map(t => t.title),
    }, { status: 400 })
  }

  const now = new Date()
  const submittedAt = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const submittedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  // Build per-task detail for the prompt
  const taskLines = doneTasks.map(t => {
    const names = (t.members as string[]).map((uid: string) => memberNames[uid] ?? 'Unknown').join(', ')
    const desc = t.description ? `\n  Description: ${t.description}` : ''
    return `- "${t.title}" — completed by: ${names}${desc}`
  }).join('\n')

  // Build per-person breakdown for the prompt
  const personTasks: Record<string, string[]> = {}
  for (const t of doneTasks) {
    for (const uid of (t.members as string[])) {
      const name = memberNames[uid] ?? 'Unknown'
      if (!personTasks[name]) personTasks[name] = []
      personTasks[name].push(t.title)
    }
  }
  const personLines = Object.entries(personTasks)
    .map(([name, tasks]) => `- ${name}: ${tasks.join(', ')}`)
    .join('\n')

  const prompt = `You are writing a detailed, professional completion summary for a collaborative project board. The team just submitted their completed tasks. Write a comprehensive summary using EXACTLY the section structure below. Be warm, specific, and detailed. Write as if you are a thoughtful team lead reviewing the work.

Submission date: ${submittedAt} at ${submittedTime}
Total tasks completed: ${doneTasks.length}

Completed tasks:
${taskLines}

Team contributions:
${personLines}

Use EXACTLY this format with these EXACT section headers (uppercase, on their own line):

OVERVIEW
[Write 3-5 sentences of engaging narrative prose. Describe the nature of the work, what the team set out to do, the effort involved, and the overall impact of completing these tasks. Make it feel human and meaningful — not generic.]

WHAT WAS ACCOMPLISHED
[For each task, write a bullet starting with •. Include the task name in quotes, who completed it, and 1-2 sentences explaining what the completion of this task means for the project. Be specific.]

TEAM CONTRIBUTIONS
[For each person involved, write a bullet starting with •. State their name, list the tasks they worked on, and write 1 sentence about their contribution style or impact.]

HIGHLIGHTS
[Write 2-4 bullet points starting with • about what's most notable or worth celebrating from this batch of completions. Could be collaboration, quantity, quality, difficulty of tasks, etc.]

SUBMITTED
${submittedAt} at ${submittedTime} · ${doneTasks.length} task${doneTasks.length !== 1 ? 's' : ''} completed

Return plain text only. No markdown. Use exactly the section headers shown.`

  let summaryContent = ''
  try {
    const result = await model.generateContent(prompt)
    summaryContent = result.response.text().trim()
  } catch {
    // Structured fallback
    const allNames = [...new Set(doneTasks.flatMap(t => (t.members as string[]).map((uid: string) => memberNames[uid] ?? 'Unknown')))]
    summaryContent = `OVERVIEW\nThe team completed ${doneTasks.length} task${doneTasks.length !== 1 ? 's' : ''} on ${submittedAt}. Great collaborative effort from ${allNames.join(', ')}. Each task moved the project forward in a meaningful way.\n\nWHAT WAS ACCOMPLISHED\n` +
      doneTasks.map(t => {
        const names = (t.members as string[]).map((uid: string) => memberNames[uid] ?? 'Unknown').join(', ')
        return `• "${t.title}" — completed by ${names}.`
      }).join('\n') +
      `\n\nTEAM CONTRIBUTIONS\n` +
      Object.entries(personTasks).map(([name, tasks]) => `• ${name}: ${tasks.join(', ')}.`).join('\n') +
      `\n\nHIGHLIGHTS\n• ${doneTasks.length} task${doneTasks.length !== 1 ? 's' : ''} successfully completed and submitted.\n• Strong team effort from ${allNames.join(', ')}.\n\nSUBMITTED\n${submittedAt} at ${submittedTime} · ${doneTasks.length} task${doneTasks.length !== 1 ? 's' : ''} completed`
  }

  await supabaseAdmin.from('summaries').insert({
    project_id: projectId,
    content: summaryContent,
    task_count: doneTasks.length,
    created_by: user.id,
  })

  // Update ocean state — only for members on done tasks
  const memberTaskCounts: Record<string, number> = {}
  for (const task of doneTasks) {
    for (const uid of (task.members as string[])) {
      memberTaskCounts[uid] = (memberTaskCounts[uid] ?? 0) + 1
    }
  }

  await Promise.all([
    // Insert one completion record per member for the heatmap
    supabaseAdmin.from('task_completions').insert(
      Object.entries(memberTaskCounts).map(([uid, count]) => ({
        project_id: projectId,
        user_id: uid,
        count,
        completed_at: now.toISOString(),
      }))
    ),
    // Update team_stats and seafloor_state per member
    ...Object.entries(memberTaskCounts).map(async ([uid, count]) => {
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
    }),
  ])

  await supabaseAdmin.from('tasks').delete().eq('project_id', projectId).eq('status', 'done')

  return NextResponse.json({ ok: true, taskCount: doneTasks.length })
}
