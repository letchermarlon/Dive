export function projectPlanPrompt(goal: string, teamSize: number): string {
  return `You are a project planning assistant. Convert this project goal into an actionable plan.

Project goal: "${goal}"
Team size: ${teamSize} person(s)

Return ONLY a valid JSON object with exactly this structure:
{
  "projectSummary": "1-2 sentence summary of what this project is",
  "backlog": [
    { "title": "Task title", "description": "Brief description of what to do" }
  ],
  "currentSprint": [
    { "title": "Task title", "description": "Brief description of what to do" }
  ],
  "subtasks": [
    { "parentTitle": "Task title matching one in currentSprint", "steps": ["step 1", "step 2"] }
  ],
  "recommendedFirstStep": "The single most important first action to take right now"
}

Rules:
- backlog: 4-8 tasks (important but not this sprint)
- currentSprint: 3-5 tasks (highest priority, start immediately)
- tasks must be small, clear, and actionable
- avoid jargon — write for anyone, not just developers
- subtasks: provide for each sprint task, 2-3 steps each`
}

export function sprintReviewPrompt(
  completed: string,
  blocked: string,
  improvement: string,
  remainingTasks: string[]
): string {
  return `You are a sprint review assistant. Summarize this sprint and propose the next one.

What was completed: "${completed}"
What was blocked: "${blocked}"
What should improve: "${improvement}"
Remaining tasks from backlog: ${JSON.stringify(remainingTasks)}

Return ONLY a valid JSON object with exactly this structure:
{
  "reviewSummary": "2-3 sentence summary of how the sprint went",
  "nextSprintProposal": [
    { "title": "Task title", "description": "Brief description" }
  ],
  "carryOver": ["title of incomplete task 1", "title of incomplete task 2"],
  "improvements": ["concrete improvement 1", "concrete improvement 2"]
}

Rules:
- nextSprintProposal: 3-5 tasks for the next sprint
- carryOver: list titles of tasks that didn't get done and should continue
- improvements: 2-3 specific, actionable process improvements`
}
