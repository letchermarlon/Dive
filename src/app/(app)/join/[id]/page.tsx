import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function JoinProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect(`/sign-in?next=/join/${id}`)

  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('id')
    .eq('id', id)
    .single()

  if (!project) redirect('/dashboard')

  const { data: existing } = await supabaseAdmin
    .from('project_members')
    .select('id')
    .eq('project_id', id)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    await supabaseAdmin.from('project_members').insert({ project_id: id, user_id: userId, role: 'member' })
    await supabaseAdmin.from('seafloor_state').insert({ user_id: userId, project_id: id })
    await supabaseAdmin.from('team_stats').insert({ user_id: userId, project_id: id })
  }

  redirect(`/projects/${id}`)
}
