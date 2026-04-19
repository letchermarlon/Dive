'use client'
import { useState } from 'react'
import IsoOcean from '@/components/reef/IsoOcean'
import FocusModal from '@/components/session/FocusModal'

type Status = 'todo' | 'doing' | 'done'

interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: Status
  members: string[]
}

interface OceanViewProps {
  projectId: string
  tasks: Task[]
  progressScore: number
  healthScore: number
  streakDays: number
  doneTasks: number
}


export default function OceanView({
  projectId, tasks: initialTasks, progressScore: initialScore,
  healthScore, streakDays, doneTasks: initialDone,
}: OceanViewProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [progressScore, setProgressScore] = useState(initialScore)
  const [doneTasks, setDoneTasks] = useState(initialDone)
  const [focusTask, setFocusTask] = useState<Task | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

function handleFocusComplete(taskId: string) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' } : t))
    setProgressScore(s => s + 1)
    setDoneTasks(d => d + 1)
    showToast('🎉 Focus session complete! Ocean is growing.')
  }

  const firstDoingTask = tasks.find(t => t.status === 'doing')

  return (
    <div className="flex flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      {/* Topbar */}
      <div
        className="flex items-center justify-between px-7 py-4 flex-shrink-0"
        style={{
          borderBottom: '1px solid rgba(187,225,250,0.12)',
          background: 'rgba(13,31,38,0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div>
          <div className="font-semibold text-lg" style={{ color: '#bbe1fa' }}>My Ocean</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(187,225,250,0.5)' }}>
            Your personal progress view
          </div>
        </div>
        {firstDoingTask && (
          <button
            onClick={() => setFocusTask(firstDoingTask)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: 'rgba(15,76,117,0.25)',
              border: '1px solid rgba(187,225,250,0.12)',
              color: '#bbe1fa',
            }}
          >
            ⏱ Focus session
          </button>
        )}
      </div>

      {/* Ocean visual */}
      <IsoOcean progressScore={progressScore} healthScore={healthScore} streakDays={streakDays} />


      {/* Focus modal */}
      {focusTask && (
        <FocusModal
          task={focusTask}
          projectId={projectId}
          onClose={() => setFocusTask(null)}
          onComplete={handleFocusComplete}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-xl px-[18px] py-3 text-sm max-w-[280px]"
          style={{
            background: 'linear-gradient(135deg, #0f3a55, #0f4c75)',
            border: '1px solid rgba(187,225,250,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'slideIn 0.3s ease',
          }}
        >
          <div className="font-medium" style={{ color: '#bbe1fa' }}>{toast}</div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
