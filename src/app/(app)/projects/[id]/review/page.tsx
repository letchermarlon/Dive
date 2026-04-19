'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AIReviewOutput } from '@/types'

type Step = 'form' | 'summary'

const inputStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(187,225,250,0.12)',
  borderRadius: 8,
  padding: '10px 12px',
  color: '#bbe1fa',
  fontSize: 13,
  outline: 'none',
  resize: 'none' as const,
  fontFamily: 'inherit',
}

export default function SprintReviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [completed, setCompleted] = useState('')
  const [blocked, setBlocked] = useState('')
  const [improvement, setImprovement] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<AIReviewOutput | null>(null)
  const [sprintId, setSprintId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => setSprintId(data.activeSprint?.id ?? ''))
  }, [id])

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/ai/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sprintId, projectId: id, completed, blocked, improvement }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    setSummary(data.review)
    setStep('summary')
    setLoading(false)
  }

  async function startNextSprint() {
    if (!summary) return
    setLoading(true)
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: id, nextSprint: summary.nextSprintProposal, completeSprintId: sprintId }),
    })
    router.push(`/projects/${id}/ocean`)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
          <div className="font-semibold text-lg" style={{ color: '#bbe1fa' }}>Sprint Review</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(187,225,250,0.5)' }}>
            Reflect and plan next sprint
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(187,225,250,0.12) transparent' }}>
        {step === 'form' ? (
          <div className="px-7 py-5 max-w-[700px]">
            {/* AI chip */}
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] mb-5"
              style={{ background: 'rgba(50,130,184,0.15)', border: '1px solid rgba(50,130,184,0.3)', color: '#bbe1fa' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#bbe1fa', animation: 'pulse 2s ease infinite' }} />
              Sprint 1 · End of sprint review
            </div>

            <div className="font-semibold text-xl mb-5" style={{ color: '#bbe1fa' }}>How did it go?</div>

            <form onSubmit={submitReview} className="flex flex-col gap-3.5">
              {[
                { label: 'What did you complete this sprint?', value: completed, onChange: setCompleted, placeholder: 'e.g. Auth flow, seafloor canvas, AI planning endpoint...' },
                { label: 'What got blocked or couldn\'t be finished?', value: blocked, onChange: setBlocked, placeholder: 'e.g. Sprint review page blocked on design...' },
                { label: 'What would you improve next sprint?', value: improvement, onChange: setImprovement, placeholder: 'e.g. Better task estimates, more daily check-ins...' },
              ].map(field => (
                <div key={field.label} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'rgba(187,225,250,0.5)' }}>
                    {field.label}
                  </label>
                  <textarea
                    rows={3}
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    placeholder={field.placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: '#3282b8', color: 'white' }}
              >
                {loading ? 'Generating...' : 'Submit review → Let AI plan next sprint'}
              </button>
            </form>
          </div>
        ) : (
          <div className="px-7 py-5 max-w-[700px]">
            <div className="text-5xl text-center mb-4">🌊</div>
            <div className="font-bold text-2xl text-center mb-2" style={{ color: '#bbe1fa' }}>Sprint review submitted!</div>
            <div className="text-sm text-center mb-6" style={{ color: 'rgba(187,225,250,0.5)' }}>
              {summary?.reviewSummary}
            </div>

            {/* AI proposal */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}
            >
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] mb-3"
                style={{ background: 'rgba(50,130,184,0.15)', border: '1px solid rgba(50,130,184,0.3)', color: '#bbe1fa' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#bbe1fa', animation: 'pulse 2s ease infinite' }} />
                AI · Next sprint proposal
              </div>
              <div className="text-xs mb-3" style={{ color: 'rgba(187,225,250,0.5)' }}>
                Based on your review, here's what I recommend for next sprint:
              </div>
              {summary?.nextSprintProposal.map((t, i) => (
                <div key={i} className="flex items-start gap-2 py-2" style={{ borderBottom: '1px solid rgba(187,225,250,0.06)' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#3282b8' }} />
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#bbe1fa' }}>{t.title}</div>
                    {t.description && <div className="text-xs mt-0.5" style={{ color: 'rgba(187,225,250,0.5)' }}>{t.description}</div>}
                  </div>
                </div>
              ))}
            </div>

            {summary?.improvements && summary.improvements.length > 0 && (
              <div
                className="rounded-xl p-4 mb-4"
                style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)' }}
              >
                <div className="text-sm font-semibold mb-2" style={{ color: '#bbe1fa' }}>💡 Improvements</div>
                {summary.improvements.map((imp, i) => (
                  <div key={i} className="text-sm flex gap-2 py-1" style={{ color: 'rgba(187,225,250,0.7)' }}>
                    <span style={{ color: 'rgba(187,225,250,0.4)' }}>→</span> {imp}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={startNextSprint}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #3282b8, #5ba8d8)', color: 'white' }}
            >
              {loading ? 'Starting...' : '🌊 Start next sprint'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </div>
  )
}
