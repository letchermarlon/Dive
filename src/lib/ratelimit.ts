import { supabaseAdmin } from '@/lib/supabase-admin'

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 20

/**
 * Checks AI request rate limit using the sprint_reviews + ai_plan insert history.
 * Uses a simple Supabase-backed count over a sliding window.
 * Returns true if the request should be allowed, false if rate limited.
 */
export async function checkAIRateLimit(userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()

  const { count } = await supabaseAdmin
    .from('ai_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', windowStart)

  if ((count ?? 0) >= MAX_REQUESTS) return false

  await supabaseAdmin.from('ai_rate_limits').insert({ user_id: userId })
  return true
}
