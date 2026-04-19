import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import SeaFloor from '@/components/reef/SeaFloor'
import TopNav from '@/components/TopNav'
import { DeleteProjectButton } from '@/components/DeleteProjectButton'
import OceanBackground from '@/components/OceanBackground'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: memberships } = await supabaseAdmin
    .from('project_members')
    .select('project_id, role, projects(id, name, description, goal)')
    .eq('user_id', user.id)

  const projectIds = memberships?.map(m => m.project_id) ?? []

  const { data: seafloors } = projectIds.length > 0
    ? await supabaseAdmin.from('seafloor_state').select('*').eq('user_id', user.id).in('project_id', projectIds)
    : { data: [] }

  const projects = memberships?.map(m => {
    const project = m.projects as unknown as { id: string; name: string; description: string; goal: string }
    const floor = seafloors?.find(s => s.project_id === project.id)
    return { ...project, role: m.role, floor }
  }) ?? []

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OceanBackground />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(164,255,245,0.12),transparent_24%),linear-gradient(180deg,rgba(4,12,19,0.14),rgba(4,12,19,0.78))]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <TopNav />
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Your Ocean</h1>
                <p className="text-sm mt-1 text-white/50">Each project has its own reef. Keep diving.</p>
              </div>
              <Link
                href="/projects/new"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-black bg-white hover:bg-white/90 transition-colors"
              >
                + New project
              </Link>
            </div>

            {projects.length === 0 && (
              <div className="rounded-[1.75rem] p-12 text-center" style={{ background: '#0d1f2e' }}>
                <div className="text-5xl mb-4">🌊</div>
                <p className="font-semibold text-white">Your ocean is empty</p>
                <p className="text-sm mt-1 text-white/50">Create your first project to start growing your reef.</p>
                <Link
                  href="/projects/new"
                  className="inline-block mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-black bg-white hover:bg-white/90 transition-colors"
                >
                  Create project
                </Link>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {projects.map(project => (
                <Card key={project.id} className="flex flex-col gap-4 rounded-[1.75rem] border-0" style={{ background: '#0d1f2e' }}>
                  <CardHeader className="flex-row items-start justify-between mb-0">
                    <div>
                      <CardTitle className="text-base text-white">{project.name}</CardTitle>
                      {project.description && (
                        <p className="text-sm mt-0.5 line-clamp-2 text-white/50">{project.description}</p>
                      )}
                    </div>
                    {project.role === 'owner' && <Badge>Owner</Badge>}
                  </CardHeader>
                  <CardContent>
                    <SeaFloor
                      progressScore={project.floor?.progress_score ?? 0}
                      healthScore={project.floor?.health_score ?? 100}
                    />
                  </CardContent>
                  <CardContent className="flex gap-2">
                    <Link
                      href={`/projects/${project.id}/ocean`}
                      className="flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-colors"
                      style={{ background: 'white', color: '#0d1f2e' }}
                    >
                      My Ocean
                    </Link>
                    <Link
                      href={`/projects/${project.id}/sprint`}
                      className="flex-1 text-center py-2 rounded-lg text-sm font-semibold border border-white/15 transition-colors text-white/70 hover:bg-white/8"
                    >
                      Board
                    </Link>
                  </CardContent>
                  {project.role === 'owner' && (
                    <CardContent>
                      <DeleteProjectButton projectId={project.id} />
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
