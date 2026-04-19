export type Project = {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: "owner" | "member";
  joinedAt: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "backlog" | "todo" | "doing" | "done" | "blocked";
  assignedTo?: string;
  estimatedMinutes?: number;
  sprintId?: string;
};

export type Sprint = {
  id: string;
  projectId: string;
  title: string;
  goal: string;
  status: "active" | "review" | "complete";
  startedAt: string;
  endedAt?: string;
};

export type SprintReview = {
  id: string;
  sprintId: string;
  userId: string;
  completedSummary: string;
  blockedSummary: string;
  nextImprovement: string;
  createdAt: string;
};

export type SeaFloorState = {
  id: string;
  userId: string;
  projectId: string;
  healthScore: number;
  progressScore: number;
  streakDays: number;
  unlockedObjects: string[];
  lastActivityAt: string;
};

export type TeamStats = {
  projectId: string;
  userId: string;
  completedTasks: number;
  focusSessions: number;
  consistencyScore: number;
};

export type AIPlanOutput = {
  projectSummary: string;
  backlog: { title: string; description: string }[];
  currentSprint: { title: string; description: string }[];
  subtasks: { parentTitle: string; steps: string[] }[];
  recommendedFirstStep: string;
};

export type AIReviewOutput = {
  reviewSummary: string;
  nextSprintProposal: { title: string; description: string }[];
  carryOver: string[];
  improvements: string[];
};
