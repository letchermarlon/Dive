import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const COLS = [
  { key: 'backlog', label: 'Backlog',     color: 'rgba(187,225,250,0.5)' },
  { key: 'todo',    label: 'To Do',       color: '#bbe1fa' },
  { key: 'doing',   label: 'In Progress', color: '#3282b8' },
  { key: 'blocked', label: 'Blocked',     color: '#f88' },
  { key: 'done',    label: 'Done',        color: '#7ef0a0' },
] as const

type Status = typeof COLS[number]['key']

export default async function SprintBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: tasksRaw }, { data: sprints }, { data: members }] = await Promise.all([
    supabaseAdmin.from('tasks').select('*').eq('project_id', id),
    supabaseAdmin.from('sprints').select('*').eq('project_id', id).eq('status', 'active').limit(1),
    supabaseAdmin.from('project_members').select('user_id, profiles(username, email)').eq('project_id', id),
  ])

  const sprint = sprints?.[0] ?? null

  const memberMap = Object.fromEntries(
    (members ?? []).map(m => {
      const profile = m.profiles as unknown as { username: string | null; email: string } | null
      const name = profile?.username ?? profile?.email?.split('@')[0] ?? 'Unknown'
      return [m.user_id, name]
    })
  )

  const tasks = (tasksRaw ?? []).map(t => ({
    id: t.id as string,
    title: t.title as string,
    status: t.status as Status,
    assignedTo: t.assigned_to as string | undefined,
    estimatedMinutes: t.estimated_minutes as number | undefined,
  }))

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
          <div className="font-semibold text-lg" style={{ color: '#bbe1fa' }}>Sprint Board</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(187,225,250,0.5)' }}>
            Shared team board · {Object.keys(memberMap).length} members
          </div>
        </div>
      </div>

      {/* AI chip */}
      <div className="px-7 pt-3.5 flex-shrink-0">
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]"
          style={{
            background: 'rgba(50,130,184,0.15)',
            border: '1px solid rgba(50,130,184,0.3)',
            color: '#bbe1fa',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#bbe1fa', animation: 'pulse 2s ease infinite' }}
          />
          {sprint ? `${sprint.title} · ${sprint.goal}` : 'No active sprint'}
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3.5 px-7 py-5 h-full">
          {COLS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key)
            return (
              <div
                key={col.key}
                className="flex flex-col rounded-xl flex-shrink-0"
                style={{
                  minWidth: 240,
                  maxWidth: 240,
                  background: 'rgba(10,20,30,0.4)',
                  border: '1px solid rgba(187,225,250,0.12)',
                  padding: 14,
                }}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className="text-[11px] font-bold uppercase tracking-[1px]"
                    style={{ color: col.color }}
                  >
                    {col.label}
                  </span>
                  <span
                    className="text-[10px] font-medium px-[7px] py-0.5 rounded-full"
                    style={{ background: 'rgba(15,76,117,0.25)', color: 'rgba(187,225,250,0.7)' }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                  {colTasks.map(t => {
                    const assigneeName = t.assignedTo ? memberMap[t.assignedTo] : null
                    return (
                      <div
                        key={t.id}
                        className="rounded-lg px-3 py-2.5 transition-all hover:-translate-y-px"
                        style={{
                          background: 'rgba(15,76,117,0.25)',
                          border: '1px solid rgba(187,225,250,0.12)',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                          cursor: 'default',
                        }}
                      >
                        <p className="text-xs font-medium leading-snug mb-1.5" style={{ color: '#bbe1fa' }}>
                          {t.title}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {assigneeName && (
                            <div
                              className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                              style={{ background: '#3282b8', color: '#bbe1fa' }}
                            >
                              {initials(assigneeName)}
                            </div>
                          )}
                          {assigneeName && (
                            <span className="text-[10px]" style={{ color: 'rgba(187,225,250,0.5)' }}>
                              {assigneeName}
                            </span>
                          )}
                          {t.estimatedMinutes && (
                            <span className="text-[10px] ml-auto" style={{ color: 'rgba(187,225,250,0.5)' }}>
                              {t.estimatedMinutes}m
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {colTasks.length === 0 && (
                    <div className="text-center py-5 text-xs" style={{ color: 'rgba(187,225,250,0.3)' }}>
                      empty
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </div>
  )
}
