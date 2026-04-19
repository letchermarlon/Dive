'use client'
import { useState, useEffect, useRef } from 'react'

interface FocusTask {
  id: string
  title: string
}

interface FocusModalProps {
  task: FocusTask
  projectId: string
  onClose: () => void
  onComplete: (taskId: string) => void
}

const DURATION = 25 * 60

export default function FocusModal({ task, projectId, onClose, onComplete }: FocusModalProps) {
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [running, setRunning] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const completedRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id, projectId }),
    })
      .then(r => r.json())
      .then(d => setSessionId(d.sessionId))
      .catch(() => {})
  }, [task.id, projectId])

  useEffect(() => {
    return () => {
      if (!completedRef.current && sessionId) {
        navigator.sendBeacon(`/api/sessions/${sessionId}/abort`)
      }
    }
  }, [sessionId])

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, timeLeft])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const circumference = 2 * Math.PI * 82
  const offset = circumference * (1 - timeLeft / DURATION)

  async function handleMarkDone() {
    completedRef.current = true
    if (sessionId) {
      await fetch(`/api/sessions/${sessionId}/complete`, { method: 'POST' })
    }
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    })
    onComplete(task.id)
    onClose()
  }

  function handleClose() {
    if (sessionId && !completedRef.current) {
      fetch(`/api/sessions/${sessionId}/abort`, { method: 'POST' }).catch(() => {})
    }
    completedRef.current = true
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(10,20,30,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-[420px] text-center rounded-2xl p-10"
        style={{
          background: 'linear-gradient(145deg, #0d2233, #0f3650)',
          border: '1px solid rgba(187,225,250,0.18)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div className="text-sm mb-1" style={{ color: 'rgba(187,225,250,0.5)' }}>Focusing on</div>
        <div className="font-semibold text-xl mb-7" style={{ color: '#bbe1fa' }}>{task.title}</div>

        <div className="relative w-[180px] h-[180px] mx-auto mb-7">
          <svg className="rotate-[-90deg]" width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="focusRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3282b8" />
                <stop offset="100%" stopColor="#bbe1fa" />
              </linearGradient>
            </defs>
            <circle cx="90" cy="90" r="82" fill="none" stroke="rgba(187,225,250,0.08)" strokeWidth="8" />
            <circle
              cx="90" cy="90" r="82" fill="none"
              stroke="url(#focusRingGrad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div
            className="absolute inset-0 flex items-center justify-center text-[38px] font-bold"
            style={{ color: '#bbe1fa' }}
          >
            {mins}:{secs}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setRunning(r => !r)}
            className="px-7 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #3282b8, #5ba8d8)' }}
          >
            {running ? '⏸ Pause' : timeLeft === DURATION ? '▶ Start' : '▶ Resume'}
          </button>
          <button
            onClick={handleMarkDone}
            className="px-7 py-3 rounded-full font-semibold transition-colors"
            style={{ background: 'rgba(180,80,80,0.3)', color: '#f88', border: '1px solid rgba(180,80,80,0.3)' }}
          >
            ✓ Mark Done
          </button>
        </div>

        <div className="mt-5 text-xs" style={{ color: 'rgba(187,225,250,0.5)' }}>
          Pomodoro · 25 min session
        </div>
      </div>
    </div>
  )
}
