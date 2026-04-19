import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import SeaFloor from '@/components/reef/SeaFloor'

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .single()

  const { data: members } = await supabase
    .from('project_members')
    .select('user_id, role, profiles(username, email)')
    .eq('project_id', id)

  const userIds = members?.map(m => m.user_id) ?? []

  const { data: stats } = userIds.length > 0
    ? await supabase
        .from('team_stats')
        .select('*')
        .eq('project_id', id)
        .in('user_id', userIds)
    : { data: [] }

  const { data: floors } = userIds.length > 0
    ? await supabase
        .from('seafloor_state')
        .select('*')
        .eq('project_id', id)
        .in('user_id', userIds)
    : { data: [] }

  const ranked = (members ?? [])
    .map(m => {
      const profile = m.profiles as { username: string; email: string }
      const stat = stats?.find(s => s.user_id === m.user_id)
      const floor = floors?.find(f => f.user_id === m.user_id)
      return {
        userId: m.user_id,
        role: m.role,
        name: profile?.username || profile?.email || 'Unknown',
        completedTasks: stat?.completed_tasks ?? 0,
        focusSessions: stat?.focus_sessions ?? 0,
        progressScore: floor?.progress_score ?? 0,
        healthScore: floor?.health_score ?? 100,
        isCurrentUser: m.user_id === user.id,
      }
    })
    .sort((a, b) => b.completedTasks - a.completedTasks)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/projects/${id}`} className="text-ocean-500 text-sm hover:text-ocean-300 transition-colors">
            ← Sprint board
          </Link>
          <h1 className="text-2xl font-bold text-ocean-100 mt-1">{project?.name} — Team</h1>
        </div>
      </div>

      {/* Rankings */}
      <Card title="🏆 Rankings">
        <div className="flex flex-col gap-3">
          {ranked.map((member, i) => (
            <div
              key={member.userId}
              className={`flex items-center gap-4 p-3 rounded-lg ${member.isCurrentUser ? 'bg-ocean-700/50 border border-ocean-600' : 'bg-ocean-800'}`}
            >
              <span className="text-ocean-400 font-mono text-sm w-6 text-center">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <div className="flex-1">
                <p className="text-ocean-100 text-sm font-medium">
                  {member.name}
                  {member.isCurrentUser && <span className="text-ocean-400 text-xs ml-2">(you)</span>}
                  {member.role === 'owner' && <span className="text-ocean-500 text-xs ml-2">owner</span>}
                </p>
              </div>
              <div className="flex gap-4 text-xs text-ocean-400">
                <span>✓ {member.completedTasks} tasks</span>
                <span>🤿 {member.focusSessions} dives</span>
                <span>🪸 Score {member.progressScore}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Individual reefs */}
      <div>
        <h2 className="text-ocean-300 text-sm font-medium mb-3 uppercase tracking-wide">Individual reefs</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {ranked.map(member => (
            <Card key={member.userId}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-ocean-200 font-medium text-sm">{member.name}</p>
                <span className="text-xs text-ocean-500">Score {member.progressScore}</span>
              </div>
              <SeaFloor progressScore={member.progressScore} healthScore={member.healthScore} />
            </Card>
          ))}
        </div>
      </div>

      {/* Share link */}
      <Card title="Invite teammates">
        <p className="text-ocean-400 text-sm mb-2">Share this project ID with your team so they can join:</p>
        <code className="block bg-ocean-800 rounded px-3 py-2 text-ocean-300 text-sm break-all">{id}</code>
        <p className="text-ocean-500 text-xs mt-2">
          Teammates can join at <span className="text-ocean-400">/join/{id}</span> after signing up.
        </p>
      </Card>
    </div>
  )
}
