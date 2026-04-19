import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import FocusTimer from '@/components/session/FocusTimer'
import Card from '@/components/ui/Card'

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>
}) {
  const { id, taskId } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: task } = await supabaseAdmin
    .from('tasks')
    .select('id, title, project_id, status')
    .eq('id', taskId)
    .single()

  if (!task || task.project_id !== id) redirect(`/projects/${id}`)

  const { data: session } = await supabaseAdmin
    .from('focus_sessions')
    .insert({
      user_id: userId,
      task_id: taskId,
      project_id: id,
      duration_minutes: 25,
      status: 'active',
    })
    .select('id')
    .single()

  if (!session) redirect(`/projects/${id}`)

  return (
    <div className="max-w-lg mx-auto">
      <Card className="text-center">
        <div className="mb-2">
          <span className="text-ocean-400 text-xs uppercase tracking-wide">Dive in progress</span>
        </div>
        <FocusTimer
          sessionId={session.id}
          taskTitle={task.title}
          projectId={id}
          durationMinutes={25}
        />
      </Card>
    </div>
  )
}
