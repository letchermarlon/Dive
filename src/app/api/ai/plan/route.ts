import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { generateJSON } from '@/lib/gemini'
import { projectPlanPrompt } from '@/lib/prompts'
import { AIPlanOutput } from '@/types'

const FALLBACK: AIPlanOutput = {
  projectSummary: 'A project broken into manageable steps.',
  backlog: [
    { title: 'Research and gather requirements', description: 'Understand the full scope of the project.' },
    { title: 'Create a rough outline', description: 'Draft the main structure or plan.' },
    { title: 'Gather any needed resources', description: 'Collect tools, materials, or information needed.' },
    { title: 'Review and iterate', description: 'Check your work and improve it.' },
  ],
  currentSprint: [
    { title: 'Define the goal clearly', description: 'Write down exactly what success looks like.' },
    { title: 'Break the goal into smaller steps', description: 'List the concrete actions needed.' },
    { title: 'Complete the first step', description: 'Take the smallest possible action to get started.' },
  ],
  subtasks: [],
  recommendedFirstStep: 'Start by writing down your goal in one clear sentence.',
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { goal, teamSize = 1 } = await request.json()
  if (!goal) return NextResponse.json({ error: 'Goal is required' }, { status: 400 })

  try {
    const plan = await generateJSON<AIPlanOutput>(projectPlanPrompt(goal, teamSize))
    return NextResponse.json({ plan })
  } catch {
    return NextResponse.json({ plan: FALLBACK })
  }
}
