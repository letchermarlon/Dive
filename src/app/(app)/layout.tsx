import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Nav from '@/components/Nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  await supabaseAdmin.from('profiles').upsert({
    id: user.id,
    email: user.email ?? '',
    username: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? null,
  }, { onConflict: 'id' })

  return (
    <div className="min-h-screen bg-ocean-950 flex flex-col">
      <Nav />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
