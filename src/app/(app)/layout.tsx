import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Nav from '@/components/Nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  if (user) {
    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email: user.emailAddresses[0]?.emailAddress ?? '',
      username: user.username ?? user.firstName ?? null,
    }, { onConflict: 'id' })
  }

  return (
    <div className="min-h-screen bg-ocean-950 flex flex-col">
      <Nav />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
