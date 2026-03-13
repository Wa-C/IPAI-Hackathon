'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User, UserRole, Organisation, Teacher, Student, LearningMode } from './types'
import type { Language } from './i18n'

// Mock organisations
const mockOrganisations: Organisation[] = [
  {
    id: 'org-1',
    name: 'Heinrich-Heine-Gymnasium Berlin',
    code: 'HHG-BER-2024',
    apiKey: 'ecdp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    webhookUrl: 'https://hhg-berlin.de/api/edcopilot/webhook',
    settings: {
      allowLmsIntegration: true,
      allowThirdPartyContent: true,
      enableFederatedLearning: true,
      sendAnonymisedSignals: true,
      participateInModelImprovement: true,
    },
    modelVersion: 'v2.4.1',
    connectedIntegrations: [
      { id: 'int-1', name: 'Moodle', type: 'lms', status: 'connected' },
      { id: 'int-2', name: 'Microsoft Teams', type: 'lms', status: 'connected' },
      { id: 'int-3', name: 'Bettermarks', type: 'content', status: 'pending' },
    ],
  },
  {
    id: 'org-2',
    name: 'Grundschule am Park Hamburg',
    code: 'GAP-HH-2024',
    apiKey: 'ecdp_live_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    webhookUrl: 'https://gap-hamburg.de/api/edcopilot/webhook',
    settings: {
      allowLmsIntegration: true,
      allowThirdPartyContent: false,
      enableFederatedLearning: true,
      sendAnonymisedSignals: true,
      participateInModelImprovement: false,
    },
    modelVersion: 'v2.4.0',
    connectedIntegrations: [
      { id: 'int-4', name: 'IServ', type: 'lms', status: 'connected' },
    ],
  },
]

// Mock users
const mockTeacher: Teacher = {
  id: 'teacher-1',
  name: 'Maria Schmidt',
  email: 'maria.schmidt@hhg-berlin.de',
  role: 'teacher',
  avatar: undefined,
  organisationId: 'org-1',
  language: 'de',
  timezone: 'Europe/Berlin',
  createdAt: '2023-09-01T08:00:00Z',
  classes: ['class-1', 'class-2', 'class-3'],
  preferences: {
    defaultLearningModes: ['read', 'play', 'watch'],
    biasScanCategories: ['gender', 'culture', 'socioeconomic', 'ableism'],
  },
}

const mockStudent: Student = {
  id: 'student-1',
  name: 'Max Müller',
  email: 'max.mueller@student.hhg-berlin.de',
  role: 'student',
  avatar: undefined,
  organisationId: 'org-1',
  language: 'de',
  timezone: 'Europe/Berlin',
  createdAt: '2023-09-01T08:00:00Z',
  classId: 'class-1',
  learningPreference: {
    recommended: 'play',
    scores: { read: 65, play: 85, watch: 70 },
  },
  performanceStatus: 'on-track',
  lastActivityDate: '2024-03-10T14:30:00Z',
}

interface AuthContextType {
  user: User | null
  organisation: Organisation | null
  organisations: Organisation[]
  language: Language
  isAuthenticated: boolean
  isLoading: boolean
  login: (role: UserRole, organisationId: string) => Promise<void>
  logout: () => void
  setLanguage: (lang: Language) => void
  updateLearningPreference: (mode: LearningMode) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organisation, setOrganisation] = useState<Organisation | null>(null)
  const [language, setLanguageState] = useState<Language>('en')
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (role: UserRole, organisationId: string) => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const org = mockOrganisations.find(o => o.id === organisationId) || mockOrganisations[0]
    setOrganisation(org)
    
    if (role === 'teacher') {
      setUser({ ...mockTeacher, organisationId: org.id })
    } else {
      setUser({ ...mockStudent, organisationId: org.id })
    }
    
    setIsLoading(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setOrganisation(null)
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    if (user) {
      setUser({ ...user, language: lang })
    }
  }, [user])

  const updateLearningPreference = useCallback((mode: LearningMode) => {
    if (user && user.role === 'student') {
      setUser({
        ...user,
        learningPreference: {
          ...(user as Student).learningPreference,
          manual: mode,
        },
      } as Student)
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        organisation,
        organisations: mockOrganisations,
        language,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setLanguage,
        updateLearningPreference,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
