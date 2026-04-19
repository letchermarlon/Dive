import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateIsland, expandIslandToCount } from '@/lib/ocean-grid'
import type { GridTile } from '@/types'
import OceanView from './OceanView'

const INITIAL_TILES = 25
const SECONDS_PER_TILE = 300

export default async function OceanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const userId = user.id

  const [{ data: tasksRaw }, { data: floor }, { data: memberRows }, { data: projectRow }] = await Promise.all([
    supabaseAdmin.from('tasks').select('*').eq('project_id', id).in('status', ['todo', 'doing', 'done']),
    supabaseAdmin.from('seafloor_state').select('*').eq('project_id', id).eq('user_id', userId).single(),
    supabaseAdmin.from('project_members').select('user_id').eq('project_id', id),
    supabaseAdmin.from('projects').select('name').eq('id', id).single(),
  ])

  const memberIds = (memberRows ?? []).map(m => m.user_id as string)
  const memberNameEntries = await Promise.all(
    memberIds.map(async uid => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(uid)
      const name = data?.user?.user_metadata?.full_name
        ?? data?.user?.email?.split('@')[0]
        ?? 'Unknown'
      return [uid, name] as [string, string]
    })
  )
  const memberNames: Record<string, string> = Object.fromEntries(memberNameEntries)
  const members = memberIds.map(uid => ({ id: uid, name: memberNames[uid] }))

  const tasks = (tasksRaw ?? []).map(t => ({
    id: t.id as string,
    projectId: t.project_id as string,
    title: t.title as string,
    description: (t.description ?? '') as string,
    status: t.status as 'todo' | 'doing' | 'done',
    members: (t.members ?? []) as string[],
  }))

  const myTasks = tasks.filter(t => t.members?.includes(userId))

  // Resolve grid tiles — initialize on first visit or if column didn't exist before migration
  const timerSeconds: number = (floor?.timer_seconds as number | null) ?? 0
  let gridTiles: GridTile[] = (floor?.grid_tiles as GridTile[] | null) ?? []

  if (gridTiles.length === 0) {
    gridTiles = generateIsland(userId, INITIAL_TILES)
    const timerBonus = Math.floor(timerSeconds / SECONDS_PER_TILE)
    const targetCount = INITIAL_TILES + timerBonus
    if (targetCount > INITIAL_TILES) {
      gridTiles = expandIslandToCount(gridTiles, userId, targetCount)
    }
    // Persist the generated island
    await supabaseAdmin.from('seafloor_state').upsert({
      user_id: userId,
      project_id: id,
      health_score: (floor?.health_score as number | null) ?? 100,
      progress_score: (floor?.progress_score as number | null) ?? 0,
      streak_days: (floor?.streak_days as number | null) ?? 0,
      last_activity_at: (floor?.last_activity_at as string | null) ?? new Date().toISOString(),
      timer_seconds: timerSeconds,
      grid_tiles: gridTiles,
    }, { onConflict: 'user_id,project_id' })
  }

  return (
    <OceanView
      projectId={id}
      projectName={projectRow?.name ?? 'Project'}
      tasks={myTasks}
      allTasks={tasks}
      members={members}
      memberNames={memberNames}
      currentUserId={userId}
      progressScore={floor?.progress_score ?? 0}
      healthScore={floor?.health_score ?? 100}
      streakDays={floor?.streak_days ?? 0}
      initialGridTiles={gridTiles}
    />
  )
}
