import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Sidebar from '@/components/project/Sidebar'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'You'
  const userInitials = name.slice(0, 2).toUpperCase()

  const [{ data: project }, { data: membership }] = await Promise.all([
    supabaseAdmin.from('projects').select('name').eq('id', id).single(),
    supabaseAdmin
      .from('project_members')
      .select('role')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .single(),
  ])

  const userRole = membership?.role === 'owner' ? 'Project Owner' : 'Member'

  return (
    <div className="flex overflow-hidden" style={{ height: '100vh', background: '#0d1f26' }}>
      <Sidebar
        projectId={id}
        projectName={project?.name ?? 'Project'}
        userName={name}
        userInitials={userInitials}
        userRole={userRole}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
