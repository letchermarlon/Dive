'use client'

import { useState } from 'react'

interface InviteSectionProps {
  projectId: string
}

export default function InviteSection({ projectId }: InviteSectionProps) {
  const [copiedId, setCopiedId] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  function copyId() {
    navigator.clipboard.writeText(projectId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  function copyLink() {
    const url = `${window.location.origin}/join/${projectId}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-semibold" style={{ color: '#bbe1fa' }}>Invite teammates</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(187,225,250,0.5)' }}>
            Share a link or project ID — anyone with it can join this team.
          </div>
        </div>
        <div className="text-xl ml-3">🔗</div>
      </div>

      {/* Join link */}
      <div className="mb-3">
        <div
          className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: 'rgba(187,225,250,0.4)' }}
        >
          Join link
        </div>
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2.5"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(187,225,250,0.1)' }}
        >
          <span className="flex-1 text-xs truncate" style={{ color: 'rgba(187,225,250,0.65)' }}>
            {typeof window !== 'undefined' ? window.location.origin : ''}/join/{projectId}
          </span>
          <button
            onClick={copyLink}
            className="flex-shrink-0 text-xs font-medium px-3 py-1 rounded-md transition-all"
            style={{
              background: copiedLink ? 'rgba(34,197,94,0.15)' : 'rgba(50,130,184,0.2)',
              border: `1px solid ${copiedLink ? 'rgba(34,197,94,0.35)' : 'rgba(50,130,184,0.35)'}`,
              color: copiedLink ? '#86efac' : '#bbe1fa',
            }}
          >
            {copiedLink ? '✓ Copied' : 'Copy link'}
          </button>
        </div>
      </div>

      {/* Project ID */}
      <div>
        <div
          className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: 'rgba(187,225,250,0.4)' }}
        >
          Project ID
        </div>
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2.5"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(187,225,250,0.1)' }}
        >
          <code className="flex-1 text-xs truncate font-mono" style={{ color: 'rgba(187,225,250,0.65)' }}>
            {projectId}
          </code>
          <button
            onClick={copyId}
            className="flex-shrink-0 text-xs font-medium px-3 py-1 rounded-md transition-all"
            style={{
              background: copiedId ? 'rgba(34,197,94,0.15)' : 'rgba(50,130,184,0.2)',
              border: `1px solid ${copiedId ? 'rgba(34,197,94,0.35)' : 'rgba(50,130,184,0.35)'}`,
              color: copiedId ? '#86efac' : '#bbe1fa',
            }}
          >
            {copiedId ? '✓ Copied' : 'Copy ID'}
          </button>
        </div>
      </div>

      <p className="text-[11px] mt-3" style={{ color: 'rgba(187,225,250,0.3)' }}>
        Teammates join at <span style={{ color: 'rgba(187,225,250,0.5)' }}>/join/&#123;id&#125;</span> using their account.
      </p>
    </div>
  )
}
