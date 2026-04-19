import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import SeaFloor from '@/components/reef/SeaFloor'
import Card from '@/components/ui/Card'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: memberships } = await supabaseAdmin
    .from('project_members')
    .select('project_id, role, projects(id, name, description, goal)')
    .eq('user_id', userId)

  const projectIds = memberships?.map(m => m.project_id) ?? []

  const { data: seafloors } = projectIds.length > 0
    ? await supabaseAdmin
        .from('seafloor_state')
        .select('*')
        .eq('user_id', userId)
        .in('project_id', projectIds)
    : { data: [] }

  const projects = memberships?.map(m => {
    const project = m.projects as unknown as { id: string; name: string; description: string; goal: string }
    const floor = seafloors?.find(s => s.project_id === project.id)
    return { ...project, role: m.role, floor }
  }) ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ocean-100">Your Ocean</h1>
          <p className="text-ocean-400 text-sm mt-1">Each project has its own reef. Keep diving.</p>
        </div>
        <Link
          href="/projects/new"
          className="px-4 py-2 bg-ocean-500 hover:bg-ocean-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + New project
        </Link>
      </div>

      {projects.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">🌊</div>
          <p className="text-ocean-300 font-medium">Your ocean is empty</p>
          <p className="text-ocean-500 text-sm mt-1">Create your first project to start growing your reef.</p>
          <Link
            href="/projects/new"
            className="inline-block mt-4 px-4 py-2 bg-ocean-500 hover:bg-ocean-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Create project
          </Link>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map(project => (
          <Card key={project.id} className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-ocean-100 font-semibold">{project.name}</h2>
                {project.description && (
                  <p className="text-ocean-400 text-sm mt-0.5 line-clamp-2">{project.description}</p>
                )}
              </div>
              {project.role === 'owner' && (
                <span className="text-xs bg-ocean-700 text-ocean-300 px-2 py-0.5 rounded-full">Owner</span>
              )}
            </div>

            <SeaFloor
              progressScore={project.floor?.progress_score ?? 0}
              healthScore={project.floor?.health_score ?? 100}
            />

            <div className="flex gap-2">
              <Link
                href={`/projects/${project.id}`}
                className="flex-1 text-center py-2 bg-ocean-700 hover:bg-ocean-600 text-ocean-200 rounded-lg text-sm font-medium transition-colors"
              >
                Sprint board
              </Link>
              <Link
                href={`/projects/${project.id}/team`}
                className="flex-1 text-center py-2 bg-ocean-800 hover:bg-ocean-700 text-ocean-300 rounded-lg text-sm font-medium transition-colors"
              >
                Team
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
