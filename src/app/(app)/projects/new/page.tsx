'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import { AIPlanOutput } from '@/types'

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

const cardStyle = {
  background: 'rgba(15,76,117,0.25)',
  border: '1px solid rgba(187,225,250,0.12)',
  borderRadius: 12,
  padding: 16,
}

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Generate plan then immediately create project — no review step
    const planRes = await fetch('/api/ai/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, teamSize: 1 }),
    })
    const planData = await planRes.json()
    if (planData.error) { setError(planData.error); setLoading(false); return }

    const plan = planData.plan as AIPlanOutput
    const projectRes = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, goal, plan }),
    })
    const projectData = await projectRes.json()
    if (projectData.error) { setError(projectData.error); setLoading(false); return }

    router.push(`/projects/${projectData.projectId}/ocean`)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d1f26' }}>
      <TopNav />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-3">🌊</div>
              <p style={{ color: 'rgba(187,225,250,0.7)' }}>Creating your project...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#bbe1fa' }}>New project</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(187,225,250,0.5)' }}>
                Describe your goal — AI will build your sprint plan automatically.
              </p>
            </div>
            <div style={cardStyle}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  className="py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  style={{ background: '#3282b8', color: 'white' }}
                >
                  🤿 Start diving
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}