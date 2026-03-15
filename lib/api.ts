const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

// Dashboard
export interface DashboardSummary {
  stats: {
    total_students: number
    total_lessons: number
    ai_generations: number
    avg_engagement: number
  }
  classes: Array<{
    id: string
    name: string
    grade: string
    subject: string
    student_count: number
    next_lesson_time: string | null
  }>
  learning_modes: {
    readers: number
    players: number
    watchers: number
    mixed: number
  }
  bias_overview: {
    gender: { flagged: number; resolved: number }
    culture: { flagged: number; resolved: number }
    socioeconomic: { flagged: number; resolved: number }
    ableism: { flagged: number; resolved: number }
    total_flagged: number
    total_resolved: number
  }
}

export function getDashboardSummary() {
  return fetchAPI<DashboardSummary>('/api/v1/dashboard/summary')
}

// Classes
export interface ClassItem {
  id: string
  name: string
  grade: string
  subject: string
  organization_id: string
  teacher_id: string | null
  next_lesson_time: string | null
  student_count: number
  archived: boolean
  created_at: string
}

export function getClasses() {
  return fetchAPI<ClassItem[]>('/api/v1/classes')
}

// Students
export interface StudentItem {
  id: string
  name: string
  email: string
  class_id: string | null
  organization_id: string
  performance_status: string
  learning_preference: {
    recommended: string
    manual: string | null
    scores: Record<string, number>
  } | null
  last_activity_date: string | null
}

export function getStudents() {
  return fetchAPI<StudentItem[]>('/api/v1/students')
}

// Organizations
export interface Organization {
  id: string
  name: string
  code: string
}

export function getOrganizations() {
  return fetchAPI<Organization[]>('/api/v1/organizations')
}

// Lessons
export interface LessonItem {
  id: string
  class_id: string
  title: string
  subject: string
  topic: string
  learning_objective: string
  base_material: string | null
  status: string
  grade_level: number | null
  duration: number | null
  differentiated_content: boolean
  content_types: string[] | null
  bias_scan_status: string | null
  created_at: string | null
}

export function getLessons() {
  return fetchAPI<LessonItem[]>('/api/v1/lessons')
}

export function getLessonsByClass(classId: string) {
  return fetchAPI<LessonItem[]>(`/api/v1/lessons/by-class/${classId}`)
}

export function createLesson(data: {
  class_id: string
  title: string
  subject: string
  topic: string
  learning_objective: string
  base_material?: string
  grade_level?: number
  duration?: number
  content_types?: string[]
  generate_differentiation?: boolean
}) {
  return fetchAPI<LessonItem>('/api/v1/lessons', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteLesson(lessonId: string) {
  return fetch(`${API_BASE}/api/v1/lessons/${lessonId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })
}

// AI Content Generation
export interface ReadingContent {
  type: 'reading'
  title: string
  estimated_minutes: number
  sections: Array<{
    heading: string
    body: string
    key_terms: string[]
  }>
}

export interface FlashcardContent {
  type: 'flashcard'
  title: string
  description: string
  cards: Array<{
    front: string
    back: string
    hint?: string
  }>
}

export type GeneratedContent = ReadingContent | FlashcardContent

export function generateContent(data: {
  title: string
  subject: string
  topic: string
  learning_objective: string
  base_material?: string
  grade_level?: number
  content_type: 'reading' | 'flashcard'
}) {
  return fetchAPI<GeneratedContent>('/api/v1/lessons/generate-content', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Student Preferences (DB-backed)
export interface StudentWithPref {
  id: string
  name: string
  email: string
  class_id: string | null
  performance_status: string
  content_format: string
  recommended_mode: string
}

export function getStudentsList() {
  return fetchAPI<StudentWithPref[]>('/api/v1/student-prefs/students-list')
}

export function getStudentContentFormat(studentId: string) {
  return fetchAPI<{ content_format: string }>(`/api/v1/student-prefs/content-format?student_id=${studentId}`)
}

export function setStudentContentFormat(studentId: string, format: 'reading' | 'flashcard') {
  return fetchAPI<{ content_format: string; status: string }>('/api/v1/student-prefs/content-format', {
    method: 'PUT',
    body: JSON.stringify({ student_id: studentId, content_format: format }),
  })
}

// About Me profile
export interface AboutMe {
  hobbies?: string
  age?: string
  native_language?: string
  interests?: string
  learning_challenges?: string
  fun_fact?: string
}

export function getStudentAboutMe(studentId: string) {
  return fetchAPI<{ about_me: AboutMe }>(`/api/v1/student-prefs/about-me?student_id=${studentId}`)
}

export function setStudentAboutMe(studentId: string, aboutMe: AboutMe) {
  return fetchAPI<{ about_me: AboutMe; status: string }>('/api/v1/student-prefs/about-me', {
    method: 'PUT',
    body: JSON.stringify({ student_id: studentId, about_me: aboutMe }),
  })
}

// PDF Upload
export async function uploadPdf(file: File): Promise<{ filename: string; pages: number; characters: number; text: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/api/v1/upload/pdf`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Upload failed: ${res.status}`)
  }
  return res.json()
}
