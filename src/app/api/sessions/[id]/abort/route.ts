import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await supabaseAdmin
    .from('focus_sessions')
    .update({ status: 'aborted', ended_at: new Date().toISOString() })
    .eq('id', id)
  return NextResponse.json({ ok: true })
}
