'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface FocusTimerProps {
  sessionId: string
  taskTitle: string
  projectId: string
  durationMinutes: number
}

export default function FocusTimer({ sessionId, taskTitle, projectId, durationMinutes }: FocusTimerProps) {
  const router = useRouter()
  const totalSeconds = durationMinutes * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [done, setDone] = useState(false)

  const complete = useCallback(async () => {
    await fetch(`/api/sessions/${sessionId}/complete`, { method: 'POST' })
    setDone(true)
    router.push(`/projects/${projectId}?completed=1`)
  }, [sessionId, projectId, router])

  const abort = useCallback(async () => {
    await fetch(`/api/sessions/${sessionId}/abort`, { method: 'POST' })
    router.push(`/projects/${projectId}`)
  }, [sessionId, projectId, router])

  useEffect(() => {
    if (done) return
    if (secondsLeft <= 0) {
      complete()
      return
    }
    const timer = setInterval(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearInterval(timer)
  }, [secondsLeft, done, complete])

  // Warn before leaving
  useEffect(() => {
    function handleUnload() {
      navigator.sendBeacon(`/api/sessions/${sessionId}/abort`)
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [sessionId])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100

  const oxygenColor = progress < 50 ? 'bg-ocean-400' : progress < 80 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <p className="text-ocean-400 text-sm mb-1">Current dive</p>
        <h2 className="text-ocean-100 text-xl font-semibold">{taskTitle}</h2>
      </div>

      {/* Oxygen gauge */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-xs text-ocean-400 mb-1">
          <span>Oxygen</span>
          <span>{Math.round(100 - progress)}%</span>
        </div>
        <div className="h-3 bg-ocean-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${oxygenColor}`}
            style={{ width: `${100 - progress}%` }}
          />
        </div>
      </div>

      {/* Timer */}
      <div className="text-center">
        <div className="text-7xl font-mono font-bold text-ocean-100 tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <p className="text-ocean-500 text-sm mt-2">Stay focused — your reef is growing 🪸</p>
      </div>

      {/* Depth indicator */}
      <div className="flex gap-2 text-ocean-400 text-sm">
        <span>🌊 Depth:</span>
        <span>{Math.round(progress * 0.5)}m</span>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={complete}
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
        >
          ✓ Surface (complete)
        </button>
        <button
          onClick={abort}
          className="px-6 py-3 bg-ocean-800 hover:bg-ocean-700 text-ocean-300 rounded-xl font-medium transition-colors"
        >
          Abort dive
        </button>
      </div>
    </div>
  )
}
