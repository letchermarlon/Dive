'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

interface SidebarProps {
  projectId: string
  projectName: string
  userName: string
  userInitials: string
  userRole: string
}

const NAV = [
  { id: 'ocean',     label: 'My Ocean',  icon: '🌊' },
  { id: 'summaries', label: 'Summaries', icon: '📝' },
  { id: 'team',      label: 'Team',      icon: '👥' },
]

export default function Sidebar({ projectId, projectName, userName, userInitials, userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const activeSection = pathname.split('/').at(-1) ?? 'ocean'

  function isActive(id: string) {
    if (id === 'ocean') return activeSection === 'ocean' || activeSection === projectId
    if (id === 'sprint') return activeSection === 'sprint'
    return activeSection === id
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <div
      className="flex flex-col w-[220px] min-w-[220px] z-10"
      style={{
        background: 'linear-gradient(180deg, #0d1f26 0%, #0f2d38 100%)',
        borderRight: '1px solid rgba(187,225,250,0.12)',
      }}
    >
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-7">
        <Image
          src="/logo.png"
          alt="Dive logo"
          width={32}
          height={32}
          className="rounded-lg flex-shrink-0"
        />
        <span className="font-bold text-base truncate" style={{ color: '#bbe1fa', letterSpacing: '-0.3px' }}>
          Dive
        </span>
      </div>

      <div className="px-5 mb-3">
        <div className="text-xs font-medium truncate" style={{ color: 'rgba(187,225,250,0.4)' }}>
          {projectName}
        </div>
      </div>

      <nav className="flex-1 px-3">
        <div className="text-[10px] font-semibold uppercase tracking-[1.2px] px-2 pb-2 mt-1" style={{ color: 'rgba(187,225,250,0.5)' }}>
          Workspace
        </div>
        {NAV.map(n => (
          <Link
            key={n.id}
            href={`/projects/${projectId}/${n.id}`}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium mb-0.5 transition-all"
            style={isActive(n.id)
              ? { background: 'rgba(50,130,184,0.25)', color: '#bbe1fa' }
              : { color: 'rgba(187,225,250,0.5)' }
            }
          >
            <span className="w-5 text-center text-base">{n.icon}</span>
            {n.label}
          </Link>
        ))}

        <div className="text-[10px] font-semibold uppercase tracking-[1.2px] px-2 pb-2 mt-4" style={{ color: 'rgba(187,225,250,0.5)' }}>
          Project
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium mb-0.5 transition-all"
          style={{ color: 'rgba(187,225,250,0.35)' }}
        >
          <span className="w-5 text-center text-base">🏠</span>
          All projects
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium w-full text-left transition-all"
          style={{ color: 'rgba(187,225,250,0.35)' }}
        >
          <span className="w-5 text-center text-base">🚪</span>
          Sign out
        </button>
      </nav>

      <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(187,225,250,0.12)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0f4c75, #3282b8)', color: '#bbe1fa' }}
          >
            {userInitials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: '#bbe1fa' }}>{userName}</div>
            <div className="text-[11px] truncate" style={{ color: 'rgba(187,225,250,0.5)' }}>{userRole}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
