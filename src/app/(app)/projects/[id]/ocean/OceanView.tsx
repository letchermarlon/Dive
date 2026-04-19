'use client'
import { useState } from 'react'
import IsoOcean from '@/components/reef/IsoOcean'
import FocusModal from '@/components/session/FocusModal'
import SprintBoardClient from '@/components/sprint/SprintBoardClient'

type Status = 'todo' | 'doing' | 'done'

interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: Status
  members: string[]
}

interface Member {
  id: string
  name: string
}

interface OceanViewProps {
  projectId: string
  projectName: string
  tasks: Task[]
  allTasks: Task[]
  members: Member[]
  memberNames: Record<string, string>
  currentUserId: string
  progressScore: number
  healthScore: number
  streakDays: number
}

export default function OceanView({
  projectId, projectName, tasks: initialTasks, allTasks,
  members, memberNames, currentUserId,
  progressScore: initialScore, healthScore, streakDays,
}: OceanViewProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [progressScore, setProgressScore] = useState(initialScore)
  const [focusTask, setFocusTask] = useState<Task | null>(null)
  const [toast, setToast] = useState<string | null>(null)


  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  function handleFocusComplete(taskId: string) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' } : t))
    setProgressScore(s => s + 1)
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(187,225,250,0.12) transparent' }}>

        {/* Ocean visual */}
        <IsoOcean progressScore={progressScore} healthScore={healthScore} streakDays={streakDays} />

        {/* Board section */}
        <div style={{ borderTop: '1px solid rgba(187,225,250,0.08)' }}>
          <div style={{ padding: '16px 28px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(187,225,250,0.5)' }}>
              Board
            </span>
          </div>
          <div style={{ height: 560 }}>
            <SprintBoardClient
              projectId={projectId}
              projectName={projectName}
              initialTasks={allTasks}
              currentUserId={currentUserId}
              members={members}
              memberNames={memberNames}
              hideHeader
              onProgressChange={delta => setProgressScore(s => s + delta)}
            />
          </div>
        </div>

      </div>

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
