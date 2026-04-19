'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { AIReviewOutput } from '@/types'

type Step = 'form' | 'summary'

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
      body: JSON.stringify({
        sprintId,
        projectId: id,
        completed,
        blocked,
        improvement,
      }),
    })
    const data = await res.json()
    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }
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
      body: JSON.stringify({
        projectId: id,
        nextSprint: summary.nextSprintProposal,
        completeSprintId: sprintId,
      }),
    })
    router.push(`/projects/${id}`)
  }

  if (step === 'form') {
    return (
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div>
          <Link href={`/projects/${id}`} className="text-ocean-500 text-sm hover:text-ocean-300 transition-colors">
            ← Sprint board
          </Link>
          <h1 className="text-2xl font-bold text-ocean-100 mt-1">Sprint review</h1>
          <p className="text-ocean-400 text-sm mt-0.5">Reflect on the sprint — AI will propose what comes next.</p>
        </div>
        <Card>
          <form onSubmit={submitReview} className="flex flex-col gap-4">
            <Textarea
              label="What got done?"
              placeholder="Describe what was completed this sprint..."
              value={completed}
              onChange={e => setCompleted(e.target.value)}
              rows={3}
              required
            />
            <Textarea
              label="What got blocked?"
              placeholder="Any obstacles, blockers, or unfinished work?"
              value={blocked}
              onChange={e => setBlocked(e.target.value)}
              rows={3}
            />
            <Textarea
              label="What should improve?"
              placeholder="One thing to do differently next sprint..."
              value={improvement}
              onChange={e => setImprovement(e.target.value)}
              rows={2}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Surface & review
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ocean-100">Sprint summary</h1>
        <p className="text-ocean-400 text-sm mt-0.5">{summary?.reviewSummary}</p>
      </div>

      {summary?.improvements && summary.improvements.length > 0 && (
        <Card title="💡 Improvements">
          <ul className="flex flex-col gap-1">
            {summary.improvements.map((imp, i) => (
              <li key={i} className="text-ocean-300 text-sm flex gap-2">
                <span className="text-ocean-500">→</span> {imp}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="🏊 Proposed next sprint">
        <div className="flex flex-col gap-2">
          {summary?.nextSprintProposal.map((t, i) => (
            <div key={i} className="bg-ocean-800 rounded-lg p-3">
              <p className="text-ocean-100 text-sm font-medium">{t.title}</p>
              <p className="text-ocean-400 text-xs mt-0.5">{t.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {summary?.carryOver && summary.carryOver.length > 0 && (
        <Card title="↩ Carry over">
          <ul className="flex flex-col gap-1">
            {summary.carryOver.map((t, i) => (
              <li key={i} className="text-ocean-400 text-sm">• {t}</li>
            ))}
          </ul>
        </Card>
      )}

      <Button onClick={startNextSprint} loading={loading} className="w-full">
        🌊 Start next sprint
      </Button>
    </div>
  )
}
