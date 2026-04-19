'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import { AIPlanOutput } from '@/types'

type Step = 'form' | 'plan' | 'creating'

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

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [plan, setPlan] = useState<AIPlanOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generatePlan(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/ai/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, teamSize: 1 }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    setPlan(data.plan)
    setStep('plan')
    setLoading(false)
  }

  async function createProject() {
    if (!plan) return
    setStep('creating')
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, goal, plan }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setStep('plan'); return }
    router.push(`/projects/${data.projectId}/ocean`)
  }

  const cardStyle = {
    background: 'rgba(15,76,117,0.25)',
    border: '1px solid rgba(187,225,250,0.12)',
    borderRadius: 12,
    padding: 16,
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d1f26' }}>
      <TopNav />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {step === 'form' && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#bbe1fa' }}>New project</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(187,225,250,0.5)' }}>
                Describe your goal — AI will break it into a sprint plan.
              </p>
            </div>
            <div style={cardStyle}>
              <form onSubmit={generatePlan} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'rgba(187,225,250,0.5)' }}>Project name</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Study for calculus exam"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'rgba(187,225,250,0.5)' }}>Project goal</label>
                  <textarea
                    style={inputStyle}
                    placeholder="Describe what you're trying to accomplish. The more detail, the better the plan."
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  style={{ background: '#3282b8', color: 'white' }}
                >
                  {loading ? 'Generating plan...' : '🤿 Generate dive plan'}
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 'plan' && plan && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#bbe1fa' }}>Your dive plan</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(187,225,250,0.5)' }}>{plan.projectSummary}</p>
            </div>
            <div style={cardStyle}>
              <div className="text-sm font-semibold mb-3" style={{ color: '#bbe1fa' }}>🏊 This sprint (start here)</div>
              <div className="flex flex-col gap-2">
                {plan.currentSprint.map((t, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <p className="text-sm font-medium" style={{ color: '#bbe1fa' }}>{t.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(187,225,250,0.5)' }}>{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={cardStyle}>
              <div className="text-sm font-semibold mb-3" style={{ color: '#bbe1fa' }}>📋 Backlog (coming up)</div>
              <div className="flex flex-col gap-1.5">
                {plan.backlog.map((t, i) => (
                  <div key={i} className="rounded-lg p-2.5 text-sm" style={{ background: 'rgba(0,0,0,0.15)', color: 'rgba(187,225,250,0.7)' }}>
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={createProject}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: '#3282b8', color: 'white' }}
              >
                ✓ Start project
              </button>
              <button
                onClick={() => setStep('form')}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)', color: '#bbe1fa' }}
              >
                Revise
              </button>
            </div>
          </div>
        )}

        {step === 'creating' && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-3">🌊</div>
              <p style={{ color: 'rgba(187,225,250,0.7)' }}>Creating your project...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
