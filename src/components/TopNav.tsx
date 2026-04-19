'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function TopNav() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <nav className="px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-gradient-to-br from-[#3282b8] to-[#bbe1fa]">
            🌊
          </div>
          <span className="font-bold text-base tracking-tight text-white">Dive</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="text-sm font-medium text-white/60 hover:text-white/90 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
