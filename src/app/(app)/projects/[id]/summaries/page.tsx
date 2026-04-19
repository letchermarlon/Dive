import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function SummariesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: membership } = await supabaseAdmin
    .from('project_members').select('id').eq('project_id', id).eq('user_id', user.id).single()
  if (!membership) redirect('/dashboard')

  const { data: summaries } = await supabaseAdmin
    .from('summaries')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const list = (summaries ?? []) as {
    id: string; content: string; task_count: number; created_at: string
  }[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{
        borderBottom: '1px solid rgba(187,225,250,0.12)',
        background: 'rgba(13,31,38,0.7)',
        backdropFilter: 'blur(8px)',
        padding: '14px 28px',
        flexShrink: 0,
      }}>
        <div style={{ fontWeight: 600, fontSize: 17, color: '#bbe1fa' }}>Summaries</div>
        <div style={{ fontSize: 12, color: 'rgba(187,225,250,0.5)', marginTop: 2 }}>
          AI-generated completion records for this project
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {list.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            color: 'rgba(187,225,250,0.3)', fontSize: 14,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌊</div>
            <p>No summaries yet.</p>
            <p style={{ fontSize: 12, marginTop: 6 }}>Submit your Done cards on the Board to generate one.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
            {list.map(s => {
              const date = new Date(s.created_at).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })
              return (
                <div
                  key={s.id}
                  style={{
                    background: 'rgba(15,76,117,0.25)',
                    border: '1px solid rgba(187,225,250,0.12)',
                    borderRadius: 12,
                    padding: '18px 20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#7ef0a0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        ✓ {s.task_count} task{s.task_count !== 1 ? 's' : ''} completed
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(187,225,250,0.4)', whiteSpace: 'nowrap' }}>{date}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(187,225,250,0.85)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {s.content}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
