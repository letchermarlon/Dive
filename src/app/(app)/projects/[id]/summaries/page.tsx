import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import SummariesClient from './SummariesClient'

export default async function SummariesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: membership } = await supabaseAdmin
    .from('project_members').select('id').eq('project_id', id).eq('user_id', user.id).single()
  if (!membership) redirect('/dashboard')

  const { data: summaries } = await supabaseAdmin
    .from('summaries')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const list = (summaries ?? []).map(s => ({
    id: s.id as string,
    content: s.content as string,
    taskCount: s.task_count as number,
    createdAt: s.created_at as string,
  }))

  return <SummariesClient summaries={list} />
}
