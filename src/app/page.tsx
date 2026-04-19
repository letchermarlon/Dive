import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import OceanBackground from '@/components/OceanBackground'

export default async function RootPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OceanBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
          Dive
        </h1>
        <p className="text-xl text-cyan-100/80 mb-10 max-w-md">
          Team-based focus and planning with a personal ocean ecosystem.
        </p>
        <div className="flex gap-4">
          <Link
            href="/sign-up"
            className="px-6 py-3 bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/40 text-cyan-100 rounded-xl backdrop-blur-sm transition-all"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="px-6 py-3 text-cyan-200/70 hover:text-cyan-100 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
