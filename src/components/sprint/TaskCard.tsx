'use client'
import { useState } from 'react'
import { Task } from '@/types'

interface TaskCardProps {
  task: Task
  projectId?: string
  onStatusChange: (taskId: string, status: Task['status']) => void
}

const STATUS_COLORS: Record<Task['status'], string> = {
  todo:  'border-ocean-600 bg-ocean-900',
  doing: 'border-ocean-400 bg-ocean-800',
  done:  'border-emerald-700 bg-emerald-950',
}

const NEXT_STATUS: Partial<Record<Task['status'], Task['status']>> = {
  todo:  'doing',
  doing: 'done',
}

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
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
        {nextStatus && (
          <button
            onClick={() => updateStatus(nextStatus)}
            disabled={loading}
            className="text-xs bg-ocean-700 hover:bg-ocean-600 text-ocean-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
          >
            {nextStatus === 'done' ? '✓ Done' : 'Start'}
          </button>
        )}
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
          task.status === 'done'  ? 'bg-emerald-900 text-emerald-300' :
          task.status === 'doing' ? 'bg-ocean-700 text-ocean-200' :
          'bg-ocean-800 text-ocean-400'
        }`}>
          {task.status === 'doing' ? 'in progress' : task.status}
        </span>
      </div>
    </div>
  )
}

