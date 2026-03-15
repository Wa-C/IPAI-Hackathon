// COPA Core Types

export type UserRole = 'teacher' | 'student' | 'admin'

export type LearningMode = 'read' | 'play' | 'watch' | 'mixed'

export interface Organisation {
  id: string
  name: string
  code: string
  apiKey?: string
  webhookUrl?: string
  settings: {
    allowLmsIntegration: boolean
    allowThirdPartyContent: boolean
    enableFederatedLearning: boolean
    sendAnonymisedSignals: boolean
    participateInModelImprovement: boolean
  }
  modelVersion: string
  connectedIntegrations: Integration[]
}

export interface Integration {
  id: string
  name: string
  type: 'lms' | 'content' | 'analytics'
  status: 'connected' | 'pending' | 'disconnected'
  icon?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  organisationId: string
  language: 'en' | 'de'
  timezone: string
  createdAt: string
}

export interface Teacher extends User {
  role: 'teacher'
  classes: string[]
  preferences: {
    defaultLearningModes: LearningMode[]
    biasScanCategories: BiasCategory[]
  }
}

export interface Student extends User {
  role: 'student'
  classId: string
  learningPreference: LearningModePreference
  performanceStatus: 'on-track' | 'needs-support' | 'advanced'
  lastActivityDate: string
}

export interface Class {
  id: string
  name: string
  grade: string
  subject: string
  teacherId: string
  studentIds: string[]
  nextLessonTime?: string
}

export interface LearningModePreference {
  recommended: LearningMode
  manual?: LearningMode
  scores: {
    read: number
    play: number
    watch: number
  }
}

export interface Lesson {
  id: string
  classId: string
  title: string
  subject: string
  topic: string
  learningObjective: string
  baseMaterial?: string
  status?: 'draft' | 'published' | 'archived'
  gradeLevel?: number
  duration?: number
  differentiatedContent?: boolean
  contentTypes?: string[]
  differentiationLevels: DifferentiationLevel[]
  createdAt: string
  biasScanStatus?: 'pending' | 'clean' | 'issues-found'
}

export interface DifferentiationLevel {
  level: 'struggling' | 'on-track' | 'advanced'
  tasks: Task[]
  rationale: string
}

export interface Task {
  id: string
  title: string
  description: string
  mode: LearningMode
  duration: number // in minutes
  generatedByAI: boolean
}

export interface Material {
  id: string
  title: string
  content: string
  classId?: string
  studentId?: string
  biasScanResult?: BiasScanResult
  assignedAt: string
}

export type BiasCategory = 'gender' | 'culture' | 'socioeconomic' | 'ableism'

export interface BiasIssue {
  id: string
  category: BiasCategory
  severity: 'low' | 'medium' | 'high'
  originalPhrase: string
  explanation: string
  suggestion: string
  position: {
    start: number
    end: number
  }
}

export interface BiasScanResult {
  scannedAt: string
  totalIssues: number
  issuesByCategory: Record<BiasCategory, number>
  issues: BiasIssue[]
  resolvedCount: number
}

// Activity types for student learning
export interface LearningActivity {
  id: string
  title: string
  description: string
  mode: LearningMode
  topic: string
  duration: number
  xp?: number
  thumbnailUrl?: string
  completedAt?: string
  score?: number
}

// Analytics types
export interface DifferentiationOverview {
  readers: number
  players: number
  watchers: number
  mixed: number
}

export interface InclusionRadar {
  week: string
  byCategory: Record<BiasCategory, { flagged: number; resolved: number }>
}

export interface TodayClass {
  id: string
  name: string
  time: string
  studentCount: number
  subject: string
}
