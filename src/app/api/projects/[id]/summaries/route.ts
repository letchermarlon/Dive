import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabaseAdmin
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single()
  if (!membership) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: summaries } = await supabaseAdmin
    .from('summaries')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ summaries: summaries ?? [] })
}
