const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function chatFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1/chat${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`Chat API error ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface TaskItem {
  id: number
  label: string
  done: boolean
  attempts: number
}

export interface ChatResponse {
  response: string
  session_id: string | null
  phase: string
  concepts_touched: string[]
  badges: Array<{ type: string; title: string; description: string }> | null
  tasks: TaskItem[]
}

export interface Exercise {
  type: 'quiz' | 'open' | 'game'
  question: string
  options?: string[]
  correct_answer: string
  explanation?: string
  hints?: string[]
  concept: string
  difficulty: string
  key_points?: string[]
  game_type?: string
  items?: any
}

export interface EvaluateResponse {
  score: number
  grade: 'correct' | 'partial' | 'wrong'
  feedback: string
  misconception: string | null
  should_review: string[]
  correct_answer: string
  mastery_update: string
}

export interface KnowledgeEntry {
  lesson_id: string
  concept: string
  mastery: number
  last_seen: string | null
}

export interface BadgeEntry {
  badge_type: string
  title: string
  description: string
  earned_at: string | null
}

export async function sendChatMessage(
  studentId: string,
  lessonId: string,
  message: string,
  sessionId?: string | null,
): Promise<ChatResponse> {
  return chatFetch<ChatResponse>('', {
    method: 'POST',
    body: JSON.stringify({
      student_id: studentId,
      lesson_id: lessonId,
      message,
      session_id: sessionId || undefined,
    }),
  })
}

export async function generateExercise(
  studentId: string,
  lessonId: string,
  sessionId: string,
  concept?: string,
): Promise<Exercise> {
  return chatFetch<Exercise>('/exercise', {
    method: 'POST',
    body: JSON.stringify({
      student_id: studentId,
      lesson_id: lessonId,
      session_id: sessionId,
      concept: concept || undefined,
    }),
  })
}

export async function evaluateAnswer(
  studentId: string,
  lessonId: string,
  sessionId: string,
  answer: string,
  exercise: Exercise,
): Promise<EvaluateResponse> {
  return chatFetch<EvaluateResponse>('/evaluate', {
    method: 'POST',
    body: JSON.stringify({
      student_id: studentId,
      lesson_id: lessonId,
      session_id: sessionId,
      answer,
      exercise,
    }),
  })
}

export async function getChatHistory(
  studentId: string,
  lessonId: string,
): Promise<{ messages: ChatMessage[]; session_id: string | null; phase?: string; tasks?: TaskItem[] }> {
  return chatFetch(`/history?student_id=${studentId}&lesson_id=${lessonId}`)
}

export async function getKnowledge(studentId: string): Promise<KnowledgeEntry[]> {
  return chatFetch(`/knowledge?student_id=${studentId}`)
}

export async function getBadges(studentId: string): Promise<BadgeEntry[]> {
  return chatFetch(`/badges?student_id=${studentId}`)
}
