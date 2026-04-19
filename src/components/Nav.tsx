'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function Nav() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <nav className="border-b border-ocean-800 bg-ocean-950 px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2 text-ocean-200 font-bold text-lg tracking-wide">
        <Image src="/logo.png" alt="Dive logo" width={28} height={28} className="rounded-lg" />
        Dive
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-ocean-400 hover:text-ocean-200 text-sm transition-colors">
          Dashboard
        </Link>
        <button
          onClick={handleSignOut}
          className="text-ocean-400 hover:text-ocean-200 text-sm transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
