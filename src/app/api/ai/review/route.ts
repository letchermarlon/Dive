import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateJSON } from '@/lib/gemini'
import { sprintReviewPrompt } from '@/lib/prompts'
import { AIReviewOutput } from '@/types'

const FALLBACK: AIReviewOutput = {
  reviewSummary: 'The sprint made good progress. Keep the momentum going.',
  nextSprintProposal: [
    { title: 'Continue remaining work', description: 'Pick up where you left off.' },
    { title: 'Review what was completed', description: 'Ensure quality of completed tasks.' },
    { title: 'Plan the next milestone', description: 'Identify the next major goal.' },
  ],
  carryOver: [],
  improvements: ['Keep tasks smaller', 'Review progress daily'],
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sprintId, projectId, completed, blocked, improvement } = await request.json()

  const { data: backlogTasks } = await supabaseAdmin
    .from('tasks')
    .select('title')
    .eq('project_id', projectId)
    .eq('status', 'backlog')

  const remainingTitles = backlogTasks?.map(t => t.title) ?? []

  let review: AIReviewOutput
  try {
    review = await generateJSON<AIReviewOutput>(
      sprintReviewPrompt(completed, blocked ?? '', improvement ?? '', remainingTitles)
    )
  } catch {
    review = FALLBACK
  }

  await supabaseAdmin.from('sprint_reviews').insert({
    sprint_id: sprintId,
    user_id: user.id,
    completed_summary: completed,
    blocked_summary: blocked,
    next_improvement: improvement,
    ai_summary: review.reviewSummary,
    next_sprint_proposal: review.nextSprintProposal,
  })

  return NextResponse.json({ review })
}
