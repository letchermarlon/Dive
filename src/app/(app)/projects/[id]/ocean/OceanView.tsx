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
  totalTasks: number
  doneTasks: number
  focusSessions: number
}

const BADGE_STYLE: Record<Status, string> = {
  doing: 'rgba(50,130,184,0.25)',
  todo:  'rgba(187,225,250,0.1)',
  done:  'rgba(50,180,100,0.2)',
}
const BADGE_COLOR: Record<Status, string> = {
  doing: '#bbe1fa',
  todo:  'rgba(187,225,250,0.5)',
  done:  '#7ef0a0',
}

export default function OceanView({
  projectId, tasks: initialTasks, progressScore: initialScore,
  healthScore, streakDays, totalTasks, doneTasks: initialDone, focusSessions,
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

  async function handleToggle(taskId: string) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const nextStatus: Status = task.status === 'done' ? 'todo' : 'done'
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t))
    if (nextStatus === 'done') {
      setProgressScore(s => s + 1)
      setDoneTasks(d => d + 1)
      showToast('🪸 Task complete! Your ocean grew.')
    } else {
      setProgressScore(s => Math.max(0, s - 1))
      setDoneTasks(d => Math.max(0, d - 1))
    }
  }

  function handleFocusComplete(taskId: string) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' } : t))
    setProgressScore(s => s + 1)
    setDoneTasks(d => d + 1)
    showToast('🎉 Focus session complete! Ocean is growing.')
  }

  const myDone = tasks.filter(t => t.status === 'done').length
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(187,225,250,0.12) transparent' }}>
        <div className="p-7">
          <div className="grid grid-cols-2 gap-4">
            {/* My tasks */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold" style={{ color: '#bbe1fa' }}>My tasks</span>
                <span className="text-[11px]" style={{ color: 'rgba(187,225,250,0.5)' }}>{myDone}/{tasks.length} done</span>
              </div>
              {tasks.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: 'rgba(187,225,250,0.4)' }}>No tasks assigned yet</p>
              )}
              {tasks.map(t => (
                <div
                  key={t.id}
                  className="flex items-center gap-2.5 py-2"
                  style={{ borderBottom: '1px solid rgba(187,225,250,0.06)' }}
                >
                  <button
                    onClick={() => handleToggle(t.id)}
                    className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      border: '2px solid #3282b8',
                      background: t.status === 'done' ? '#3282b8' : 'transparent',
                    }}
                  >
                    {t.status === 'done' && <span style={{ color: 'white', fontSize: 10 }}>✓</span>}
                  </button>
                  <span
                    className="flex-1 text-sm"
                    style={{
                      color: t.status === 'done' ? 'rgba(187,225,250,0.5)' : '#bbe1fa',
                      textDecoration: t.status === 'done' ? 'line-through' : 'none',
                    }}
                  >
                    {t.title}
                  </span>
                  <span
                    className="text-[10px] px-[7px] py-0.5 rounded-full font-semibold"
                    style={{ background: BADGE_STYLE[t.status], color: BADGE_COLOR[t.status] }}
                  >
                    {t.status === 'doing' ? 'in progress' : t.status}
                  </span>
                  {t.status !== 'done' && (
                    <button
                      onClick={() => setFocusTask(t)}
                      className="text-xs rounded px-1.5 py-0.5 transition-all"
                      style={{
                        background: 'rgba(15,76,117,0.25)',
                        border: '1px solid rgba(187,225,250,0.12)',
                        color: 'rgba(187,225,250,0.7)',
                      }}
                    >
                      ▶
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Project stats */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}>
              <div className="text-sm font-semibold mb-3" style={{ color: '#bbe1fa' }}>Project progress</div>
              <div className="flex justify-between mb-1">
                <span className="text-xs" style={{ color: 'rgba(187,225,250,0.5)' }}>Tasks completed</span>
                <span className="text-xs font-semibold" style={{ color: '#bbe1fa' }}>{doneTasks} / {totalTasks}</span>
              </div>
              <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(187,225,250,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: totalTasks > 0 ? `${(doneTasks / totalTasks) * 100}%` : '0%',
                    background: 'linear-gradient(90deg, #3282b8, #bbe1fa)',
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Focus sessions', val: focusSessions, icon: '⏱' },
                  { label: 'Streak',         val: `${streakDays}d`, icon: '🔥' },
                  { label: 'My done',        val: myDone, icon: '✅' },
                  { label: 'Ocean score',    val: progressScore, icon: '🌊' },
                ].map(s => (
                  <div key={s.label} className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div className="text-base mb-0.5">{s.icon}</div>
                    <div className="font-bold text-xl leading-none" style={{ color: '#bbe1fa', fontFamily: 'var(--font-figtree)' }}>{s.val}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'rgba(187,225,250,0.5)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
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
