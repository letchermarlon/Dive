'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Task } from '@/types'

interface TaskCardProps {
  task: Task
  projectId: string
  onStatusChange: (taskId: string, status: Task['status']) => void
}

const STATUS_COLORS: Record<Task['status'], string> = {
  backlog:  'border-ocean-700 bg-ocean-900',
  todo:     'border-ocean-600 bg-ocean-900',
  doing:    'border-ocean-400 bg-ocean-800',
  done:     'border-emerald-700 bg-emerald-950',
  blocked:  'border-red-700 bg-red-950/30',
}

const NEXT_STATUS: Partial<Record<Task['status'], Task['status']>> = {
  todo:    'doing',
  doing:   'done',
  blocked: 'todo',
}

export default function TaskCard({ task, projectId, onStatusChange }: TaskCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateStatus(newStatus: Task['status']) {
    setLoading(true)
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    onStatusChange(task.id, newStatus)
    setLoading(false)
  }

  const nextStatus = NEXT_STATUS[task.status]

  return (
    <div className={`rounded-lg border p-3 transition-colors ${STATUS_COLORS[task.status]}`}>
      <p className="text-ocean-100 text-sm font-medium">{task.title}</p>
      {task.description && (
        <p className="text-ocean-400 text-xs mt-1">{task.description}</p>
      )}
      <div className="flex items-center gap-2 mt-3">
        {task.status === 'doing' && (
          <button
            onClick={() => router.push(`/projects/${projectId}/session/${task.id}`)}
            className="text-xs bg-ocean-500 hover:bg-ocean-400 text-white px-2 py-1 rounded transition-colors"
          >
            🤿 Dive in
          </button>
        )}
        {task.status === 'todo' && (
          <button
            onClick={() => updateStatus('doing')}
            disabled={loading}
            className="text-xs bg-ocean-700 hover:bg-ocean-600 text-ocean-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
          >
            Start
          </button>
        )}
        {nextStatus && task.status !== 'todo' && (
          <button
            onClick={() => updateStatus(nextStatus)}
            disabled={loading}
            className="text-xs bg-ocean-700 hover:bg-ocean-600 text-ocean-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
          >
            {nextStatus === 'done' ? '✓ Done' : nextStatus === 'todo' ? 'Unblock' : 'Next'}
          </button>
        )}
        {task.status !== 'blocked' && task.status !== 'done' && (
          <button
            onClick={() => updateStatus('blocked')}
            disabled={loading}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors disabled:opacity-50"
          >
            Block
          </button>
        )}
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
          task.status === 'done' ? 'bg-emerald-900 text-emerald-300' :
          task.status === 'blocked' ? 'bg-red-900 text-red-300' :
          task.status === 'doing' ? 'bg-ocean-700 text-ocean-200' :
          'bg-ocean-800 text-ocean-400'
        }`}>
          {task.status}
        </span>
      </div>
    </div>
  )
}
