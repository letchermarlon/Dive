'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'

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
  padding: 20,
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

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, goal }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }

    router.push(`/projects/${data.projectId}/sprint`)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d1f26' }}>
      <TopNav />
      <main className="flex-1 p-6 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p style={{ color: 'rgba(187,225,250,0.7)' }}>Creating your project...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pt-8">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#bbe1fa' }}>New project</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(187,225,250,0.5)' }}>
                Give your project a name and you&apos;re ready to dive in.
              </p>
            </div>
            <div style={cardStyle}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'rgba(187,225,250,0.5)' }}>
                    Project name
                  </label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Website redesign"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'rgba(187,225,250,0.5)' }}>
                    Description <span style={{ color: 'rgba(187,225,250,0.3)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    style={inputStyle}
                    placeholder="What are you trying to accomplish?"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    rows={3}
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  className="py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  style={{ background: '#3282b8', color: 'white' }}
                >
                  Create project
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
