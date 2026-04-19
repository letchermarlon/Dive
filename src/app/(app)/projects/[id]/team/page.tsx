import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: members } = await supabaseAdmin
    .from('project_members')
    .select('user_id, role, profiles(username, email)')
    .eq('project_id', id)

  const userIds = members?.map(m => m.user_id) ?? []

  const [{ data: stats }, { data: sprints }] = await Promise.all([
    userIds.length > 0
      ? supabaseAdmin.from('team_stats').select('*').eq('project_id', id).in('user_id', userIds)
      : Promise.resolve({ data: [] }),
    supabaseAdmin.from('sprints').select('*').eq('project_id', id).eq('status', 'active').limit(1),
  ])

  const sprint = sprints?.[0] ?? null
  const startedAt = sprint?.started_at ? new Date(sprint.started_at) : new Date()
  const daysLeft = Math.max(0, 14 - Math.floor((Date.now() - startedAt.getTime()) / (1000 * 60 * 60 * 24)))

  const ranked = (members ?? [])
    .map(m => {
      const profile = m.profiles as unknown as { username: string; email: string }
      const stat = (stats ?? []).find(s => s.user_id === m.user_id)
      return {
        userId: m.user_id,
        role: m.role,
        name: profile?.username ?? profile?.email?.split('@')[0] ?? 'Unknown',
        completedTasks: stat?.completed_tasks ?? 0,
        focusSessions: stat?.focus_sessions ?? 0,
        consistencyScore: stat?.consistency_score ?? 0,
        isCurrentUser: m.user_id === user.id,
      }
    })
    .sort((a, b) => b.completedTasks - a.completedTasks)

  const medals = ['🥇', '🥈', '🥉']
  const medalColor = ['#ffd700', '#c0c0c0', '#cd7f32']

  function initials(name: string) {
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topbar */}
      <div
        className="flex items-center justify-between px-7 py-4 flex-shrink-0"
        style={{
          borderBottom: '1px solid rgba(187,225,250,0.12)',
          background: 'rgba(13,31,38,0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div>
          <div className="font-semibold text-lg" style={{ color: '#bbe1fa' }}>Team Rankings</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(187,225,250,0.5)' }}>
            Who&apos;s leading the sprint?
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(187,225,250,0.12) transparent' }}>
        <div className="px-7 py-5">
          {/* AI chip */}
          <div className="mb-5">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]"
              style={{
                background: 'rgba(50,130,184,0.15)',
                border: '1px solid rgba(50,130,184,0.3)',
                color: '#bbe1fa',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#bbe1fa', animation: 'pulse 2s ease infinite' }} />
              {ranked.length} team members · {sprint?.title ?? 'Sprint'} ends in {daysLeft} days
            </div>
          </div>

          {/* Rankings */}
          <div className="flex flex-col gap-2 mb-5">
            {ranked.map((member, i) => (
              <div
                key={member.userId}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all"
                style={{
                  background: member.isCurrentUser ? 'rgba(50,130,184,0.15)' : 'rgba(15,76,117,0.25)',
                  border: `1px solid ${member.isCurrentUser ? 'rgba(50,130,184,0.3)' : 'rgba(187,225,250,0.12)'}`,
                }}
              >
                <div
                  className="font-bold text-xl w-8 text-center flex-shrink-0"
                  style={{ color: i < 3 ? medalColor[i] : 'rgba(187,225,250,0.5)', fontFamily: 'var(--font-figtree)' }}
                >
                  {i < 3 ? medals[i] : `${i + 1}`}
                </div>
                <div
                  className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #0f4c75, #3282b8)', color: '#bbe1fa' }}
                >
                  {initials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: '#bbe1fa' }}>
                    {member.name}
                    {member.isCurrentUser && <span className="text-xs ml-2" style={{ color: 'rgba(187,225,250,0.5)' }}>(you)</span>}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(187,225,250,0.5)' }}>
                    {member.focusSessions} focus sessions · {member.consistencyScore}% consistency
                  </div>
                  <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: 'rgba(187,225,250,0.1)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${member.consistencyScore}%`, background: 'linear-gradient(90deg, #3282b8, #bbe1fa)' }}
                    />
                  </div>
                </div>
                <div className="flex gap-5 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-lg leading-none" style={{ color: '#bbe1fa', fontFamily: 'var(--font-figtree)' }}>
                      {member.completedTasks}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'rgba(187,225,250,0.5)' }}>tasks done</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg leading-none" style={{ color: '#bbe1fa', fontFamily: 'var(--font-figtree)' }}>
                      {member.focusSessions}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'rgba(187,225,250,0.5)' }}>focus dives</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Team ocean health */}
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}
          >
            <div className="text-sm font-semibold mb-3.5" style={{ color: '#bbe1fa' }}>Team ocean health</div>
            <div className="grid gap-3.5" style={{ gridTemplateColumns: `repeat(${Math.min(ranked.length, 3)}, 1fr)` }}>
              {ranked.map(member => (
                <div key={member.userId} className="text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2"
                    style={{ background: 'linear-gradient(135deg, #0f4c75, #3282b8)', color: '#bbe1fa' }}
                  >
                    {initials(member.name)}
                  </div>
                  <div className="text-xs font-semibold mb-1" style={{ color: '#bbe1fa' }}>{member.name}</div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(187,225,250,0.1)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${member.consistencyScore}%`, background: 'linear-gradient(90deg, #3282b8, #bbe1fa)' }}
                    />
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: 'rgba(187,225,250,0.5)' }}>
                    {member.consistencyScore}% healthy
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}
          >
            <div className="text-sm font-semibold mb-2" style={{ color: '#bbe1fa' }}>Invite teammates</div>
            <p className="text-xs mb-2" style={{ color: 'rgba(187,225,250,0.5)' }}>
              Share this project ID — teammates can join at <span style={{ color: '#bbe1fa' }}>/join/{id}</span>
            </p>
            <code
              className="block rounded-lg px-3 py-2 text-xs break-all"
              style={{ background: 'rgba(0,0,0,0.3)', color: '#bbe1fa', border: '1px solid rgba(187,225,250,0.12)' }}
            >
              {id}
            </code>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </div>
  )
}
