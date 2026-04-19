import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: session } = await supabaseAdmin
    .from('focus_sessions')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!session || session.user_id !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await supabaseAdmin
    .from('focus_sessions')
    .update({ status: 'aborted', ended_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ ok: true })
}
