import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function JoinProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/sign-in?next=/join/${id}`)

  const { data: existing } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    await supabaseAdmin.from('project_members').insert({ project_id: id, user_id: user.id, role: 'member' })
    await supabaseAdmin.from('seafloor_state').insert({ user_id: user.id, project_id: id })
    await supabaseAdmin.from('team_stats').insert({ user_id: user.id, project_id: id })
  }

  redirect(`/projects/${id}`)
}
