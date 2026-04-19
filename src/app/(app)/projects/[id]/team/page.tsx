import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import SeaFloor from '@/components/reef/SeaFloor'
import ActivityGrid from '@/components/team/ActivityGrid'
import InviteSection from '@/components/team/InviteSection'
import { getProgressLabel } from '@/lib/progression'

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [
    { data: members },
    { data: stats },
    { data: seafloors },
    { data: tasks },
  ] = await Promise.all([
    supabaseAdmin
      .from('project_members')
      .select('user_id, role')
      .eq('project_id', id),
    supabaseAdmin
      .from('team_stats')
      .select('*')
      .eq('project_id', id),
    supabaseAdmin
      .from('seafloor_state')
      .select('*')
      .eq('project_id', id),
    supabaseAdmin
      .from('task_completions')
      .select('completed_at, count')
      .eq('project_id', id),
  ])

  // Fetch profiles separately (no FK defined between project_members.user_id and profiles.id)
  const userIds = (members ?? []).map(m => m.user_id as string)
  const { data: profiles } = userIds.length > 0
    ? await supabaseAdmin.from('profiles').select('id, username, email').in('id', userIds)
    : { data: [] }

  // Enrich members with stats + ocean data
  const enriched = (members ?? []).map(m => {
    const profile = (profiles ?? []).find(p => p.id === m.user_id)
    const stat = (stats ?? []).find(s => s.user_id === m.user_id)
    const floor = (seafloors ?? []).find(f => f.user_id === m.user_id)
    return {
      userId: m.user_id,
      role: m.role as 'owner' | 'member',
      name: profile?.username ?? profile?.email?.split('@')[0] ?? 'Unknown',
      completedTasks: stat?.completed_tasks ?? 0,
      focusSessions: stat?.focus_sessions ?? 0,
      consistencyScore: stat?.consistency_score ?? 0,
      progressScore: floor?.progress_score ?? 0,
      healthScore: floor?.health_score ?? 100,
      streakDays: floor?.streak_days ?? 0,
      isCurrentUser: m.user_id === user.id,
    }
  })

  // Rank by completed tasks
  const ranked = [...enriched].sort((a, b) => b.completedTasks - a.completedTasks)

  // Top 3 by ocean progress score
  const oceanTop3 = [...enriched]
    .sort((a, b) => b.progressScore - a.progressScore)
    .slice(0, 3)

  // Activity heatmap data from task_completions history
  const activityMap: Record<string, number> = {}
  for (const row of tasks ?? []) {
    if (row.completed_at) {
      const date = (row.completed_at as string).split('T')[0]
      activityMap[date] = (activityMap[date] ?? 0) + (row.count as number)
    }
  }
  const activityDays = Object.entries(activityMap).map(([date, count]) => ({ date, count }))

  // Insights aggregation
  const totalTasks = enriched.reduce((a, m) => a + m.completedTasks, 0)
  const totalSessions = enriched.reduce((a, m) => a + m.focusSessions, 0)
  const totalHours = Math.round((totalSessions * 25) / 60 * 10) / 10
  const avgConsistency = enriched.length > 0
    ? Math.round(enriched.reduce((a, m) => a + m.consistencyScore, 0) / enriched.length)
    : 0

  const mostActiveEntry = [...activityDays].sort((a, b) => b.count - a.count)[0]
  const mostActiveDayLabel = mostActiveEntry
    ? new Date(mostActiveEntry.date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
      })
    : '—'

  const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32']
  const medalLabels = ['1st', '2nd', '3rd']

  function initials(name: string) {
    return name.slice(0, 2).toUpperCase()
  }

  const insightStats = [
    { label: 'TOTAL HOURS', value: totalHours.toFixed(1), unit: 'h' },
    { label: 'SESSIONS', value: String(totalSessions), unit: '' },
    { label: 'AVG SESSION', value: '25', unit: 'm' },
    { label: 'CONSISTENCY', value: String(avgConsistency), unit: '%' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topbar */}
      <div
        className="flex items-center gap-3 px-7 py-4 flex-shrink-0"
        style={{
          borderBottom: '1px solid rgba(187,225,250,0.12)',
          background: 'rgba(13,31,38,0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div>
          <div className="font-semibold text-lg" style={{ color: '#bbe1fa' }}>Team</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(187,225,250,0.5)' }}>
            {enriched.length} member{enriched.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto px-7 py-5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(187,225,250,0.12) transparent' }}
      >
        <div className="flex flex-col gap-5">

          {/* Row 1: Members list + Ocean leaderboard */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>

            {/* Members */}
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}
            >
              <div
                className="text-[10px] font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'rgba(187,225,250,0.45)' }}
              >
                Members
              </div>
              <div className="flex flex-col gap-2.5">
                {ranked.map((member, i) => (
                  <div key={member.userId} className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0f4c75, #3282b8)', color: '#bbe1fa' }}
                    >
                      {initials(member.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-medium" style={{ color: '#bbe1fa' }}>
                          {member.name}
                        </span>
                        {member.isCurrentUser && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(50,130,184,0.2)', color: 'rgba(187,225,250,0.55)' }}
                          >
                            you
                          </span>
                        )}
                        {member.role === 'owner' && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,215,0,0.1)', color: 'rgba(255,215,0,0.65)' }}
                          >
                            owner
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'rgba(187,225,250,0.4)' }}>
                        {member.completedTasks} done · {member.focusSessions} dives · {member.streakDays}d streak
                      </div>
                    </div>

                    {/* Rank */}
                    <div
                      className="text-xs font-bold flex-shrink-0 w-8 text-center"
                      style={{ color: i < 3 ? medalColors[i] : 'rgba(187,225,250,0.25)' }}
                    >
                      #{i + 1}
                    </div>
                  </div>
                ))}

                {enriched.length === 0 && (
                  <p className="text-sm py-4 text-center" style={{ color: 'rgba(187,225,250,0.35)' }}>
                    No members yet
                  </p>
                )}
              </div>
            </div>

            {/* Ocean leaderboard */}
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}
            >
              <div
                className="text-[10px] font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'rgba(187,225,250,0.45)' }}
              >
                Ocean leaderboard
              </div>

              <div className="flex flex-col gap-4">
                {oceanTop3.map((member, i) => (
                  <div key={member.userId}>
                    {/* Member header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold" style={{ color: medalColors[i] }}>
                        {medalLabels[i]}
                      </span>
                      <span className="text-xs font-medium" style={{ color: '#bbe1fa' }}>
                        {member.name}
                        {member.isCurrentUser && (
                          <span className="ml-1" style={{ color: 'rgba(187,225,250,0.45)', fontWeight: 400 }}>(you)</span>
                        )}
                      </span>
                      <span className="text-[10px] ml-auto" style={{ color: 'rgba(187,225,250,0.4)' }}>
                        {getProgressLabel(member.progressScore)}
                      </span>
                    </div>

                    {/* Mini SeaFloor — clips bottom 90px showing the reef floor */}
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{ height: '90px', position: 'relative' }}
                    >
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        <SeaFloor
                          progressScore={member.progressScore}
                          healthScore={member.healthScore}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {oceanTop3.length === 0 && (
                  <p className="text-sm py-4 text-center" style={{ color: 'rgba(187,225,250,0.35)' }}>
                    No ocean data yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Team activity heatmap */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'rgba(187,225,250,0.45)' }}
              >
                Team activity
              </div>
              <div className="text-xs" style={{ color: 'rgba(187,225,250,0.35)' }}>
                {totalTasks} tasks completed total
              </div>
            </div>
            <ActivityGrid days={activityDays} totalTasks={totalTasks} />
          </div>

          {/* Row 3: Insights */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}
          >
            <div
              className="text-[10px] font-semibold uppercase tracking-wider mb-4"
              style={{ color: 'rgba(187,225,250,0.45)' }}
            >
              Insights
            </div>
            <div className="grid grid-cols-4 gap-3">
              {insightStats.map(stat => (
                <div
                  key={stat.label}
                  className="rounded-lg p-3 text-center"
                  style={{ background: 'rgba(13,31,38,0.6)', border: '1px solid rgba(187,225,250,0.08)' }}
                >
                  <div
                    className="font-bold leading-none mb-1.5"
                    style={{ color: '#e74c3c', fontSize: '1.4rem', fontFamily: 'var(--font-figtree)' }}
                  >
                    {stat.value}{stat.unit}
                  </div>
                  <div
                    className="font-semibold uppercase"
                    style={{ fontSize: '9px', letterSpacing: '0.08em', color: 'rgba(187,225,250,0.4)' }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Most active day callout */}
            {mostActiveEntry && (
              <div
                className="mt-3 rounded-lg px-4 py-2.5 flex items-center gap-3"
                style={{ background: 'rgba(13,31,38,0.6)', border: '1px solid rgba(187,225,250,0.08)' }}
              >
                <span style={{ fontSize: '1.1rem' }}>🔥</span>
                <div>
                  <span className="text-xs font-semibold" style={{ color: '#bbe1fa' }}>Most active day: </span>
                  <span className="text-xs" style={{ color: 'rgba(187,225,250,0.6)' }}>
                    {mostActiveDayLabel} — {mostActiveEntry.count} task{mostActiveEntry.count !== 1 ? 's' : ''} completed
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Recent sessions — placeholder for Aman's agent */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'rgba(187,225,250,0.45)' }}
              >
                Recent sessions
              </div>
              {/*
                TODO [Aman's agent]: Add a "Start session" button here once the FocusModal
                is wired up and session tracking is complete.
              */}
            </div>

            {/*
              TODO [Aman's agent]: Implement the session list in this section.

              HANDOFF NOTES:
              ─────────────────────────────────────────────────────────────────
              Goal: Show the team's most recent focus sessions (last ~10),
              each clickable to reveal an AI-generated summary.

              DATA QUERY (add to the Promise.all at the top of this page):
                supabaseAdmin
                  .from('focus_sessions')
                  .select('id, user_id, task_id, duration_minutes, status, started_at, ended_at')
                  .eq('project_id', id)
                  .eq('status', 'completed')
                  .order('started_at', { ascending: false })
                  .limit(10)

              Join with tasks to get the task title, and with profiles to get the username.

              EACH SESSION ROW should display:
                - Member avatar (initials) + username
                - Task name (from tasks table via task_id)
                - Duration in minutes
                - Relative timestamp ("2h ago", "yesterday", etc.)

              ON CLICK → open a modal showing an AI summary including:
                - Session focus rating (if tab-focus tracking exists, use focus_pct)
                - Number of tasks the user moved to Done during this session
                - Session duration
                - Any insights (was this a focused deep work session? lots of interruptions?)

              AI SUMMARY:
                - Generate on-demand when the modal is opened (cache result in Supabase)
                - Use generateJSON<T>() from src/lib/gemini.ts
                - Keep the prompt in src/lib/prompts.ts (add a SESSION_SUMMARY prompt)
                - Schema suggestion: { focusRating: number, tasksCompleted: number, summary: string, highlights: string[] }

              SCHEMA NOTE:
                The focus_sessions table (supabase/schema.sql) currently has:
                  id, user_id, task_id, project_id, duration_minutes, status, started_at, ended_at
                You may need to add: tasks_completed (int), focus_pct (float) columns if tracking those.

              COMPONENT: Create src/components/team/RecentSessions.tsx (client component)
                         and import it here.
              ─────────────────────────────────────────────────────────────────
            */}

            <div className="flex flex-col items-center justify-center py-8 gap-2.5">
              <div style={{ fontSize: '2rem' }}>⏱</div>
              <p className="text-sm font-medium" style={{ color: 'rgba(187,225,250,0.4)' }}>
                Session tracking coming soon
              </p>
              <p className="text-xs text-center max-w-xs" style={{ color: 'rgba(187,225,250,0.25)' }}>
                Focus sessions will appear here with AI summaries once the timer feature is complete.
              </p>
            </div>
          </div>

          {/* Row 5: Invite */}
          <InviteSection projectId={id} />

        </div>
      </div>
    </div>
  )
}
