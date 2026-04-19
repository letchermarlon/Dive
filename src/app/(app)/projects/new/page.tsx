'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input, { Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { AIPlanOutput } from '@/types'

type Step = 'form' | 'plan' | 'creating'

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
    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }
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
    if (data.error) {
      setError(data.error)
      setStep('plan')
      return
    }
    router.push(`/projects/${data.projectId}`)
  }

  if (step === 'form') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ocean-100">New project</h1>
          <p className="text-ocean-400 text-sm mt-1">Describe your goal — AI will break it into a sprint plan.</p>
        </div>
        <Card>
          <form onSubmit={generatePlan} className="flex flex-col gap-4">
            <Input
              label="Project name"
              placeholder="e.g. Study for calculus exam"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Textarea
              label="Project goal"
              placeholder="Describe what you're trying to accomplish. The more detail, the better the plan."
              value={goal}
              onChange={e => setGoal(e.target.value)}
              rows={4}
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              🤿 Generate dive plan
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  if (step === 'plan' && plan) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-ocean-100">Your dive plan</h1>
          <p className="text-ocean-400 text-sm mt-1">{plan.projectSummary}</p>
        </div>

        <Card title="🏊 This sprint (start here)">
          <div className="flex flex-col gap-2">
            {plan.currentSprint.map((t, i) => (
              <div key={i} className="bg-ocean-800 rounded-lg p-3">
                <p className="text-ocean-100 text-sm font-medium">{t.title}</p>
                <p className="text-ocean-400 text-xs mt-0.5">{t.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="📋 Backlog (coming up)">
          <div className="flex flex-col gap-2">
            {plan.backlog.map((t, i) => (
              <div key={i} className="bg-ocean-800/50 rounded-lg p-3">
                <p className="text-ocean-200 text-sm">{t.title}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-ocean-300 text-sm">
            <span className="text-ocean-400">First action: </span>
            {plan.recommendedFirstStep}
          </p>
        </Card>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <Button onClick={createProject} className="flex-1">
            ✓ Start project
          </Button>
          <Button variant="secondary" onClick={() => setStep('form')}>
            Revise
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-3">🌊</div>
        <p className="text-ocean-300">Creating your project...</p>
      </div>
    </div>
  )
}
