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
    <nav
      className="flex items-center justify-between px-6 py-3"
      style={{ borderBottom: '1px solid rgba(187,225,250,0.12)', background: 'rgba(13,31,38,0.9)' }}
    >
      <Link href="/dashboard" className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'linear-gradient(135deg, #3282b8, #bbe1fa)' }}
        >
          🌊
        </div>
        <span className="font-bold text-base" style={{ color: '#bbe1fa', letterSpacing: '-0.3px' }}>Dive</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-sm transition-colors" style={{ color: 'rgba(187,225,250,0.5)' }}>
          Dashboard
        </Link>
        <button
          onClick={handleSignOut}
          className="text-sm transition-colors"
          style={{ color: 'rgba(187,225,250,0.5)' }}
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
