'use client'
import Link from 'next/link'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function Nav() {
  const { signOut } = useClerk()
  const router = useRouter()

  return (
    <nav className="border-b border-ocean-800 bg-ocean-950 px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="text-ocean-200 font-bold text-lg tracking-wide">
        🌊 Dive
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-ocean-400 hover:text-ocean-200 text-sm transition-colors">
          Dashboard
        </Link>
        <button
          onClick={() => signOut(() => router.push('/sign-in'))}
          className="text-ocean-400 hover:text-ocean-200 text-sm transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
