'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Task } from '@/types'
import TaskCard from '@/components/sprint/TaskCard'
import Card from '@/components/ui/Card'

type Column = 'backlog' | 'todo' | 'doing' | 'done' | 'blocked'

const SPRINT_COLUMNS: Column[] = ['todo', 'doing', 'done', 'blocked']

export default function SprintBoardPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const justCompleted = searchParams.get('completed') === '1'

  const [tasks, setTasks] = useState<Task[]>([])
  const [projectName, setProjectName] = useState('')
  const [sprintId, setSprintId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => {
        setTasks(data.tasks ?? [])
        setProjectName(data.project?.name ?? '')
        setSprintId(data.activeSprint?.id ?? '')
        setLoading(false)
      })
  }, [id])

  function handleStatusChange(taskId: string, status: Task['status']) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
  }

  const byStatus = (status: Column) => tasks.filter(t => t.status === status)
  const sprintTasks = tasks.filter(t => t.status !== 'backlog')
  const backlogTasks = tasks.filter(t => t.status === 'backlog')

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-ocean-400">Loading sprint board...</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {justCompleted && (
        <div className="bg-emerald-900/40 border border-emerald-700 rounded-xl px-4 py-3 text-emerald-300 text-sm">
          🪸 Dive complete! Your reef has grown.
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ocean-100">{projectName}</h1>
          <p className="text-ocean-400 text-sm mt-0.5">Sprint board</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/projects/${id}/team`}
            className="px-3 py-2 bg-ocean-800 hover:bg-ocean-700 text-ocean-300 rounded-lg text-sm transition-colors"
          >
            Team
          </Link>
          {sprintId && (
            <Link
              href={`/projects/${id}/review`}
              className="px-3 py-2 bg-ocean-700 hover:bg-ocean-600 text-ocean-200 rounded-lg text-sm transition-colors"
            >
              Sprint review
            </Link>
          )}
        </div>
      </div>

      {/* Sprint columns */}
      <div>
        <h2 className="text-ocean-300 text-sm font-medium mb-3 uppercase tracking-wide">Current sprint</h2>
        {sprintTasks.length === 0 && (
          <Card className="text-center py-8 text-ocean-500 text-sm">No tasks in sprint yet.</Card>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SPRINT_COLUMNS.map(col => (
            <div key={col}>
              <p className="text-ocean-400 text-xs uppercase tracking-wide mb-2">{col}</p>
              <div className="flex flex-col gap-2">
                {byStatus(col).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projectId={id}
                    onStatusChange={handleStatusChange}
                  />
                ))}
                {byStatus(col).length === 0 && (
                  <div className="border border-dashed border-ocean-800 rounded-lg p-3 text-ocean-700 text-xs text-center">
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backlog */}
      <div>
        <h2 className="text-ocean-300 text-sm font-medium mb-3 uppercase tracking-wide">
          Backlog ({backlogTasks.length})
        </h2>
        <div className="flex flex-col gap-2">
          {backlogTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              projectId={id}
              onStatusChange={handleStatusChange}
            />
          ))}
          {backlogTasks.length === 0 && (
            <Card className="text-center py-6 text-ocean-500 text-sm">Backlog is clear.</Card>
          )}
        </div>
      </div>
    </div>
  )
}
