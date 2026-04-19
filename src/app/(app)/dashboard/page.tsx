import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import SeaFloor from '@/components/reef/SeaFloor'
import TopNav from '@/components/TopNav'
import { DeleteProjectButton } from '@/components/DeleteProjectButton'

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
    <div className="min-h-screen flex flex-col" style={{ background: '#0d1f26' }}>
      <TopNav />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#bbe1fa' }}>Your Ocean</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(187,225,250,0.5)' }}>Each project has its own reef. Keep diving.</p>
            </div>
            <Link
              href="/projects/new"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: '#3282b8', color: 'white' }}
            >
              + New project
            </Link>
          </div>

          {projects.length === 0 && (
            <div
              className="rounded-xl p-12 text-center"
              style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}
            >
              <div className="text-5xl mb-4">🌊</div>
              <p className="font-medium" style={{ color: '#bbe1fa' }}>Your ocean is empty</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(187,225,250,0.5)' }}>Create your first project to start growing your reef.</p>
              <Link
                href="/projects/new"
                className="inline-block mt-4 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: '#3282b8', color: 'white' }}
              >
                Create project
              </Link>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {projects.map(project => (
              <div
                key={project.id}
                className="rounded-xl p-4 flex flex-col gap-4"
                style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold" style={{ color: '#bbe1fa' }}>{project.name}</h2>
                    {project.description && (
                      <p className="text-sm mt-0.5 line-clamp-2" style={{ color: 'rgba(187,225,250,0.5)' }}>{project.description}</p>
                    )}
                  </div>
                  {project.role === 'owner' && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(50,130,184,0.25)', color: '#bbe1fa' }}
                    >
                      Owner
                    </span>
                  )}
                </div>
                <SeaFloor
                  progressScore={project.floor?.progress_score ?? 0}
                  healthScore={project.floor?.health_score ?? 100}
                />
                <div className="flex gap-2">
                  <Link
                    href={`/projects/${project.id}/ocean`}
                    className="flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: '#3282b8', color: 'white' }}
                  >
                    My Ocean
                  </Link>
                </div>
                {project.role === 'owner' && (
                  <DeleteProjectButton projectId={project.id} />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
