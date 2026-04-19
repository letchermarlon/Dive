'use client'
import { useState, useEffect, useRef } from 'react'
import IsoOcean from '@/components/reef/IsoOcean'
import FocusModal from '@/components/session/FocusModal'
import SprintBoardClient from '@/components/sprint/SprintBoardClient'
import { useFocusMonitor } from '@/camera/useFocusMonitor'

type Status = 'todo' | 'doing' | 'done'
type DivePhase = 'setup' | 'running' | 'paused' | 'done'

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

const PRESETS = [
  { label: '15m', seconds: 15 * 60 },
  { label: '25m', seconds: 25 * 60 },
  { label: '45m', seconds: 45 * 60 },
  { label: '60m', seconds: 60 * 60 },
]

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
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

  // Camera monitoring
  const { status: focusStatus, videoRef, startCamera, stopCamera } = useFocusMonitor()
  const isDistracted = focusStatus === 'looking-away' || focusStatus === 'phone-detected' || focusStatus === 'no-face'

  // Dive timer
  const [showDive, setShowDive] = useState(false)
  const [divePhase, setDivePhase] = useState<DivePhase>('setup')
  const [diveTotal, setDiveTotal] = useState(25 * 60)
  const [diveRemaining, setDiveRemaining] = useState(25 * 60)
  const [customMinutes, setCustomMinutes] = useState('25')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const focusStatusRef = useRef(focusStatus)
  const endTimeRef = useRef<number>(0)       // 0 = not yet initialized; set on first tick
  const diveTotalRef = useRef<number>(25 * 60)
  const noFaceSinceRef = useRef<number>(0)   // when no-face pause began (0 = not paused)
  useEffect(() => { focusStatusRef.current = focusStatus }, [focusStatus])

  useEffect(() => {
    if (divePhase !== 'running') {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      if (focusStatusRef.current === 'no-face') {
        if (noFaceSinceRef.current === 0) noFaceSinceRef.current = Date.now()
        return
      }
      // Resume after no-face pause: extend end time by pause duration
      if (noFaceSinceRef.current > 0) {
        if (endTimeRef.current > 0) endTimeRef.current += Date.now() - noFaceSinceRef.current
        noFaceSinceRef.current = 0
      }
      // Initialize end time on first live tick (avoids fast-forward from WASM load hang)
      if (endTimeRef.current === 0) {
        endTimeRef.current = Date.now() + diveTotalRef.current * 1000
        return
      }
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      setDiveRemaining(remaining)
      if (remaining === 0) setDivePhase('done')
    }, 250)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [divePhase])

  function startDive(seconds: number) {
    endTimeRef.current = 0  // will be set on first tick, after any blocking load
    diveTotalRef.current = seconds
    noFaceSinceRef.current = 0
    setDiveTotal(seconds)
    setDiveRemaining(seconds)
    setDivePhase('running')
    startCamera()
  }

  function handleCustomStart() {
    const mins = Math.max(1, Math.min(180, parseInt(customMinutes) || 25))
    startDive(mins * 60)
  }

  function resetDive() {
    endTimeRef.current = 0
    diveTotalRef.current = 25 * 60
    noFaceSinceRef.current = 0
    setDivePhase('setup')
    setDiveTotal(25 * 60)
    setDiveRemaining(25 * 60)
    setCustomMinutes('25')
    stopCamera()
  }

  // Stop camera when timer naturally finishes
  useEffect(() => {
    if (divePhase === 'done') stopCamera()
  }, [divePhase])

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

  // SVG ring for timer

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
        <div style={{ display: 'flex', gap: 8 }}>
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
          {divePhase === 'running' && (
            <button
              onClick={() => setShowDive(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: 'rgba(50,130,184,0.35)',
                border: '1px solid rgba(50,130,184,0.6)',
                color: '#bbe1fa',
              }}
            >
              🤿 {fmt(diveRemaining)}
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(187,225,250,0.12) transparent' }}>

        {/* Ocean visual */}
        <IsoOcean progressScore={progressScore} healthScore={healthScore} streakDays={streakDays} />

        {/* Dive button */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 28px' }}>
          <button
            onClick={() => setShowDive(true)}
            style={{
              padding: '14px 48px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(15,76,117,0.5), rgba(50,130,184,0.35))',
              border: '1px solid rgba(50,130,184,0.4)',
              color: '#bbe1fa',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.3px',
              transition: 'all 0.15s',
            }}
          >
            🤿 Start Dive
          </button>
        </div>

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

      {/* Dive timer modal */}
      {showDive && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 32,
          }}
          onClick={() => setShowDive(false)}
        >
          <div
            style={{
              background: 'linear-gradient(160deg, #0d1f26 0%, #0f2d38 100%)',
              border: isDistracted && divePhase === 'running'
                ? '2px solid rgba(220,60,60,0.8)'
                : '1px solid rgba(187,225,250,0.15)',
              borderRadius: 24,
              width: '100%',
              maxWidth: 520,
              padding: '48px 48px 44px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 36,
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'rgba(187,225,250,0.5)', marginBottom: 6 }}>
                🤿 Dive Timer
              </div>
              <div style={{ fontSize: 14, color: 'rgba(187,225,250,0.35)' }}>
                {divePhase === 'setup' ? 'Set your focus duration' : divePhase === 'done' ? 'Dive complete!' : divePhase === 'paused' ? 'Paused' : 'Stay focused'}
              </div>
            </div>

            {/* Large countdown display */}
            {divePhase !== 'setup' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: divePhase === 'done' ? 80 : 96,
                  fontWeight: 700,
                  color: divePhase === 'done' ? '#7ef0a0' : divePhase === 'paused' ? 'rgba(187,225,250,0.5)' : '#bbe1fa',
                  fontFamily: 'var(--font-figtree)',
                  letterSpacing: '-4px',
                  lineHeight: 1,
                  transition: 'color 0.3s',
                }}>
                  {divePhase === 'done' ? '✓' : fmt(diveRemaining)}
                </div>
                {divePhase !== 'done' && (
                  <div style={{ fontSize: 13, color: 'rgba(187,225,250,0.35)', marginTop: 10, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    remaining
                  </div>
                )}
                {divePhase === 'running' && focusStatus !== 'camera-off' && (
                  <div style={{
                    marginTop: 16,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 99,
                    background: isDistracted ? 'rgba(220,60,60,0.15)' : 'rgba(50,180,100,0.15)',
                    border: `1px solid ${isDistracted ? 'rgba(220,60,60,0.4)' : 'rgba(50,180,100,0.4)'}`,
                    fontSize: 12,
                    fontWeight: 600,
                    color: isDistracted ? 'rgba(255,120,120,0.9)' : '#7ef0a0',
                    transition: 'all 0.3s',
                  }}>
                    <span style={{ fontSize: 10 }}>
                      {focusStatus === 'looking-away' ? '👀' : focusStatus === 'phone-detected' ? '📱' : focusStatus === 'no-face' ? '❓' : '🎯'}
                    </span>
                    {focusStatus === 'looking-away' ? 'Look at screen' : focusStatus === 'phone-detected' ? 'Phone detected' : focusStatus === 'no-face' ? 'No face detected' : 'Focused'}
                  </div>
                )}
              </div>
            )}

            {/* Setup: presets + custom */}
            {divePhase === 'setup' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => { setCustomMinutes(String(p.seconds / 60)); startDive(p.seconds) }}
                      style={{
                        padding: '18px 0',
                        borderRadius: 12,
                        background: 'rgba(15,76,117,0.3)',
                        border: '1px solid rgba(187,225,250,0.12)',
                        color: '#bbe1fa',
                        fontSize: 18,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customMinutes}
                    onChange={e => setCustomMinutes(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCustomStart()}
                    style={{
                      flex: 1,
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(187,225,250,0.2)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      color: '#bbe1fa',
                      fontSize: 16,
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                    placeholder="Custom minutes"
                  />
                  <button
                    onClick={handleCustomStart}
                    style={{
                      padding: '14px 32px',
                      borderRadius: 12,
                      background: '#3282b8',
                      border: 'none',
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Start
                  </button>
                </div>
              </div>
            )}

            {/* Controls: running / paused */}
            {(divePhase === 'running' || divePhase === 'paused') && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setDivePhase(divePhase === 'running' ? 'paused' : 'running')}
                  style={{
                    padding: '14px 44px',
                    borderRadius: 12,
                    background: 'rgba(50,130,184,0.25)',
                    border: '1px solid rgba(50,130,184,0.4)',
                    color: '#bbe1fa',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {divePhase === 'running' ? '⏸ Pause' : '▶ Resume'}
                </button>
                <button
                  onClick={resetDive}
                  style={{
                    padding: '14px 32px',
                    borderRadius: 12,
                    background: 'rgba(180,80,80,0.15)',
                    border: '1px solid rgba(180,80,80,0.3)',
                    color: 'rgba(248,136,136,0.8)',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Stop
                </button>
              </div>
            )}

            {/* Done state */}
            {divePhase === 'done' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <p style={{ fontSize: 16, color: 'rgba(187,225,250,0.6)', textAlign: 'center' }}>
                  You dove for {fmt(diveTotal)} 🌊
                </p>
                <button
                  onClick={resetDive}
                  style={{
                    padding: '14px 44px',
                    borderRadius: 12,
                    background: '#3282b8',
                    border: 'none',
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Dive again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden camera feed — must stay mounted for detection hooks */}
      <video ref={videoRef} style={{ display: 'none' }} muted playsInline />

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
