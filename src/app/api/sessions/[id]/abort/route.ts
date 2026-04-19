import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: session } = await supabaseAdmin
    .from('focus_sessions')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await supabaseAdmin
    .from('focus_sessions')
    .update({ status: 'aborted', ended_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ ok: true })
}
