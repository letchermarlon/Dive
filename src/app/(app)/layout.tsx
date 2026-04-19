import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  await supabaseAdmin.from('profiles').upsert({
    id: user.id,
    email: user.email ?? '',
    username: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? null,
  }, { onConflict: 'id' })

  return <>{children}</>
}
