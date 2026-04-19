import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateIsland, expandIslandToCount } from '@/lib/ocean-grid'
import type { GridTile } from '@/types'

const INITIAL_TILES = 25
const SECONDS_PER_TILE = 300 // 5 minutes

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { projectId, seconds } = body as { projectId?: string; seconds?: number }
  if (!projectId || typeof seconds !== 'number' || seconds <= 0) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const userId = user.id

  const { data: floor } = await supabaseAdmin
    .from('seafloor_state')
    .select('timer_seconds, grid_tiles, health_score, progress_score, streak_days, last_activity_at')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single()

  const prevTimerSeconds: number = (floor?.timer_seconds as number | null) ?? 0
  const newTimerSeconds = prevTimerSeconds + Math.max(0, Math.floor(seconds))

  let gridTiles: GridTile[] = (floor?.grid_tiles as GridTile[] | null) ?? []
  if (gridTiles.length === 0) {
    gridTiles = generateIsland(userId, INITIAL_TILES)
  }

  const timerBonus = Math.floor(newTimerSeconds / SECONDS_PER_TILE)
  const targetCount = INITIAL_TILES + timerBonus
  if (gridTiles.length < targetCount) {
    gridTiles = expandIslandToCount(gridTiles, userId, targetCount)
  }

  await supabaseAdmin.from('seafloor_state').upsert({
    user_id: userId,
    project_id: projectId,
    health_score: (floor?.health_score as number | null) ?? 100,
    progress_score: (floor?.progress_score as number | null) ?? 0,
    streak_days: (floor?.streak_days as number | null) ?? 0,
    last_activity_at: new Date().toISOString(),
    timer_seconds: newTimerSeconds,
    grid_tiles: gridTiles,
  }, { onConflict: 'user_id,project_id' })

  return NextResponse.json({ data: { timerSeconds: newTimerSeconds, gridTiles } })
}
