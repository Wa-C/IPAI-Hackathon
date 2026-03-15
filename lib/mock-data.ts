import type {
  Class,
  Student,
  Lesson,
  Material,
  BiasIssue,
  BiasScanResult,
  LearningActivity,
  DifferentiationOverview,
  InclusionRadar,
  TodayClass,
  Task,
} from './types'

// Mock Classes
export const mockClasses: Class[] = [
  {
    id: 'class-1',
    name: '10a English',
    grade: '10',
    subject: 'English',
    teacherId: 'teacher-1',
    studentIds: ['student-1', 'student-2', 'student-3', 'student-4', 'student-5'],
    nextLessonTime: '2024-03-11T09:00:00Z',
  },
  {
    id: 'class-2',
    name: '9b English',
    grade: '9',
    subject: 'English',
    teacherId: 'teacher-1',
    studentIds: ['student-6', 'student-7', 'student-8'],
    nextLessonTime: '2024-03-11T11:00:00Z',
  },
  {
    id: 'class-3',
    name: '11c Advanced English',
    grade: '11',
    subject: 'English',
    teacherId: 'teacher-1',
    studentIds: ['student-9', 'student-10'],
    nextLessonTime: '2024-03-12T08:00:00Z',
  },
]

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Max Müller',
    email: 'max.mueller@student.hhg-berlin.de',
    role: 'student',
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
  },
  {
    id: 'student-2',
    name: 'Sophie Weber',
    email: 'sophie.weber@student.hhg-berlin.de',
    role: 'student',
    organisationId: 'org-1',
    language: 'de',
    timezone: 'Europe/Berlin',
    createdAt: '2023-09-01T08:00:00Z',
    classId: 'class-1',
    learningPreference: {
      recommended: 'read',
      scores: { read: 90, play: 60, watch: 55 },
    },
    performanceStatus: 'advanced',
    lastActivityDate: '2024-03-10T16:45:00Z',
  },
  {
    id: 'student-3',
    name: 'Liam Fischer',
    email: 'liam.fischer@student.hhg-berlin.de',
    role: 'student',
    organisationId: 'org-1',
    language: 'de',
    timezone: 'Europe/Berlin',
    createdAt: '2023-09-01T08:00:00Z',
    classId: 'class-1',
    learningPreference: {
      recommended: 'watch',
      scores: { read: 50, play: 65, watch: 88 },
    },
    performanceStatus: 'needs-support',
    lastActivityDate: '2024-03-09T11:20:00Z',
  },
  {
    id: 'student-4',
    name: 'Emma Becker',
    email: 'emma.becker@student.hhg-berlin.de',
    role: 'student',
    organisationId: 'org-1',
    language: 'de',
    timezone: 'Europe/Berlin',
    createdAt: '2023-09-01T08:00:00Z',
    classId: 'class-1',
    learningPreference: {
      recommended: 'mixed',
      scores: { read: 75, play: 78, watch: 72 },
    },
    performanceStatus: 'on-track',
    lastActivityDate: '2024-03-10T13:00:00Z',
  },
  {
    id: 'student-5',
    name: 'Noah Schneider',
    email: 'noah.schneider@student.hhg-berlin.de',
    role: 'student',
    organisationId: 'org-1',
    language: 'de',
    timezone: 'Europe/Berlin',
    createdAt: '2023-09-01T08:00:00Z',
    classId: 'class-1',
    learningPreference: {
      recommended: 'play',
      scores: { read: 55, play: 92, watch: 60 },
    },
    performanceStatus: 'on-track',
    lastActivityDate: '2024-03-10T15:30:00Z',
  },
]

// Mock Teachers
export const mockTeachers = [
  {
    id: 'teacher-1',
    name: 'Maria K.',
    email: 'maria.k@hhg-berlin.de',
    subject: 'English',
    classes: ['class-1', 'class-2', 'class-3'],
  },
  {
    id: 'teacher-2',
    name: 'Thomas S.',
    email: 'thomas.s@hhg-berlin.de',
    subject: 'Science',
    classes: ['class-4'],
  },
]

// Mock Lessons
export const mockLessons: Lesson[] = [
  {
    id: 'lesson-1',
    classId: 'class-1',
    title: 'Introduction to Shakespeare',
    subject: 'English',
    topic: 'Romeo and Juliet - Act 1',
    learningObjective: 'Students will understand the historical context and main themes of Romeo and Juliet',
    baseMaterial: 'Shakespeare wrote Romeo and Juliet in the late 16th century...',
    status: 'published',
    gradeLevel: 10,
    duration: 45,
    differentiatedContent: true,
    contentTypes: ['video', 'text', 'quiz'],
    differentiationLevels: [
      {
        level: 'struggling',
        tasks: [
          {
            id: 'task-1',
            title: 'Character Matching',
            description: 'Match characters to their descriptions using picture cards',
            mode: 'play',
            duration: 15,
            generatedByAI: true,
          },
        ],
        rationale: 'Visual and interactive approach helps struggling learners grasp character relationships',
      },
      {
        level: 'on-track',
        tasks: [
          {
            id: 'task-2',
            title: 'Scene Analysis',
            description: 'Read Act 1, Scene 1 and identify the main conflict',
            mode: 'read',
            duration: 20,
            generatedByAI: true,
          },
        ],
        rationale: 'Text-based analysis appropriate for grade-level readers',
      },
      {
        level: 'advanced',
        tasks: [
          {
            id: 'task-3',
            title: 'Historical Context Essay',
            description: 'Write a 500-word essay comparing Elizabethan society to the play',
            mode: 'read',
            duration: 30,
            generatedByAI: true,
          },
        ],
        rationale: 'Extended writing challenges advanced learners to make deeper connections',
      },
    ],
    createdAt: '2024-03-08T10:00:00Z',
    biasScanStatus: 'clean',
  },
  {
    id: 'lesson-2',
    classId: 'class-1',
    title: 'Photosynthesis Explained',
    subject: 'Science',
    topic: 'Plant Biology',
    learningObjective: 'Understand the process of photosynthesis and its importance',
    baseMaterial: 'Photosynthesis is the process by which plants convert sunlight...',
    status: 'published',
    gradeLevel: 10,
    duration: 30,
    differentiatedContent: true,
    contentTypes: ['video', 'quiz', 'game'],
    differentiationLevels: [],
    createdAt: '2024-03-09T10:00:00Z',
    biasScanStatus: 'clean',
  },
  {
    id: 'lesson-3',
    classId: 'class-1',
    title: 'World War II: Key Events',
    subject: 'History',
    topic: 'Modern History',
    learningObjective: 'Learn about the major events and turning points of WWII',
    baseMaterial: 'World War II was a global conflict that lasted from 1939 to 1945...',
    status: 'published',
    gradeLevel: 10,
    duration: 50,
    differentiatedContent: true,
    contentTypes: ['video', 'text', 'interactive-timeline'],
    differentiationLevels: [],
    createdAt: '2024-03-10T10:00:00Z',
    biasScanStatus: 'clean',
  },
  {
    id: 'lesson-4',
    classId: 'class-1',
    title: 'Algebra Fundamentals',
    subject: 'Mathematics',
    topic: 'Solving Equations',
    learningObjective: 'Master basic algebraic equations and problem-solving',
    baseMaterial: 'Algebra is the branch of mathematics dealing with symbols...',
    status: 'published',
    gradeLevel: 10,
    duration: 40,
    differentiatedContent: true,
    contentTypes: ['video', 'practice', 'quiz'],
    differentiationLevels: [],
    createdAt: '2024-03-10T14:00:00Z',
    biasScanStatus: 'clean',
  },
  {
    id: 'lesson-5',
    classId: 'class-2',
    title: 'Creative Writing Workshop',
    subject: 'English',
    topic: 'Short Stories',
    learningObjective: 'Develop creative writing skills through storytelling',
    baseMaterial: 'Every great story starts with an idea...',
    status: 'published',
    gradeLevel: 9,
    duration: 35,
    differentiatedContent: false,
    contentTypes: ['text', 'writing-exercise'],
    differentiationLevels: [],
    createdAt: '2024-03-11T08:00:00Z',
    biasScanStatus: 'clean',
  },
]

// Sample bias issues for scanner demo
export const sampleBiasIssues: BiasIssue[] = [
  {
    id: 'bias-1',
    category: 'gender',
    severity: 'medium',
    originalPhrase: 'The fireman rushed to save the day',
    explanation: 'The term "fireman" implies only men can be firefighters, which reinforces gender stereotypes.',
    suggestion: 'The firefighter rushed to save the day',
    position: { start: 0, end: 35 },
  },
  {
    id: 'bias-2',
    category: 'culture',
    severity: 'low',
    originalPhrase: 'exotic foods from foreign lands',
    explanation: 'Describing foods as "exotic" can otherize non-Western cuisines and cultures.',
    suggestion: 'diverse foods from around the world',
    position: { start: 100, end: 135 },
  },
  {
    id: 'bias-3',
    category: 'ableism',
    severity: 'high',
    originalPhrase: 'fell on deaf ears',
    explanation: 'This idiom uses deafness negatively, implying that deaf people cannot understand or respond.',
    suggestion: 'was ignored',
    position: { start: 200, end: 220 },
  },
  {
    id: 'bias-4',
    category: 'socioeconomic',
    severity: 'medium',
    originalPhrase: 'children from good families',
    explanation: 'Implies that family worth is tied to socioeconomic status or traditional family structures.',
    suggestion: 'children from supportive backgrounds',
    position: { start: 300, end: 330 },
  },
]

// Sample material with bias issues
export const sampleBiasMaterial = `The fireman rushed to save the day when the alarm sounded. In class, we discussed exotic foods from foreign lands and how different cultures eat. The teacher's message about homework fell on deaf ears, especially among children from good families who seemed distracted.`

// Dashboard data
export const mockTodayClasses: TodayClass[] = [
  { id: 'class-1', name: '10a English', time: '09:00', studentCount: 24, subject: 'English' },
  { id: 'class-2', name: '9b English', time: '11:00', studentCount: 22, subject: 'English' },
  { id: 'class-3', name: '11c Advanced', time: '14:00', studentCount: 18, subject: 'English' },
]

export const mockDifferentiationOverview: DifferentiationOverview = {
  readers: 28,
  players: 35,
  watchers: 22,
  mixed: 15,
}

export const mockInclusionRadar: InclusionRadar = {
  week: '2024-W10',
  byCategory: {
    gender: { flagged: 12, resolved: 10 },
    culture: { flagged: 8, resolved: 7 },
    socioeconomic: { flagged: 5, resolved: 5 },
    ableism: { flagged: 3, resolved: 2 },
  },
}

// Student learning activities
export const mockLearningActivities: Record<string, LearningActivity[]> = {
  read: [
    {
      id: 'act-r1',
      title: 'Romeo and Juliet - Chapter Summary',
      description: 'Read the simplified summary of Act 1 and answer comprehension questions',
      mode: 'read',
      topic: 'Shakespeare',
      duration: 15,
      xp: 50,
    },
    {
      id: 'act-r2',
      title: 'Vocabulary Builder',
      description: 'Learn 10 new words from the play with definitions and examples',
      mode: 'read',
      topic: 'Shakespeare',
      duration: 10,
      xp: 30,
    },
  ],
  play: [
    {
      id: 'act-p1',
      title: 'Character Quiz Challenge',
      description: 'Test your knowledge of Romeo and Juliet characters in this timed quiz',
      mode: 'play',
      topic: 'Shakespeare',
      duration: 10,
      xp: 100,
    },
    {
      id: 'act-p2',
      title: 'Scene Sequencing Game',
      description: 'Put the scenes in the correct order to unlock bonus points',
      mode: 'play',
      topic: 'Shakespeare',
      duration: 8,
      xp: 75,
    },
  ],
  watch: [
    {
      id: 'act-w1',
      title: 'Introduction to Shakespeare',
      description: 'Watch a 5-minute animated video about Shakespeare and his time',
      mode: 'watch',
      topic: 'Shakespeare',
      duration: 5,
      xp: 25,
      thumbnailUrl: '/placeholder-video.jpg',
    },
    {
      id: 'act-w2',
      title: 'Act 1 Scene Analysis',
      description: 'Video walkthrough of the first scene with expert commentary',
      mode: 'watch',
      topic: 'Shakespeare',
      duration: 12,
      xp: 60,
      thumbnailUrl: '/placeholder-video.jpg',
    },
  ],
}

// Generated AI tasks for lesson builder
export const mockGeneratedTasks: Record<string, Task[]> = {
  struggling: [
    {
      id: 'gen-s1',
      title: 'Picture Vocabulary Cards',
      description: 'Match key vocabulary words with their picture representations. Focus on 8 essential terms with visual support.',
      mode: 'play',
      duration: 10,
      generatedByAI: true,
    },
    {
      id: 'gen-s2',
      title: 'Simplified Reading Passage',
      description: 'A shortened version of the text with highlighted key words and margin definitions.',
      mode: 'read',
      duration: 15,
      generatedByAI: true,
    },
    {
      id: 'gen-s3',
      title: 'Story Introduction Video',
      description: 'Watch a 3-minute animated summary before reading the full text.',
      mode: 'watch',
      duration: 5,
      generatedByAI: true,
    },
  ],
  'on-track': [
    {
      id: 'gen-o1',
      title: 'Guided Reading Activity',
      description: 'Read the full passage with embedded questions to check understanding at key points.',
      mode: 'read',
      duration: 20,
      generatedByAI: true,
    },
    {
      id: 'gen-o2',
      title: 'Comprehension Quiz',
      description: 'Interactive quiz with multiple choice and short answer questions about the text.',
      mode: 'play',
      duration: 15,
      generatedByAI: true,
    },
  ],
  advanced: [
    {
      id: 'gen-a1',
      title: 'Critical Analysis Essay',
      description: 'Write a 400-word analysis comparing themes in the text to modern contexts.',
      mode: 'read',
      duration: 30,
      generatedByAI: true,
    },
    {
      id: 'gen-a2',
      title: 'Extended Research Project',
      description: 'Research the historical background and create a presentation connecting it to the text.',
      mode: 'mixed',
      duration: 45,
      generatedByAI: true,
    },
    {
      id: 'gen-a3',
      title: 'Peer Teaching Activity',
      description: 'Prepare to explain a key concept to classmates using any format of your choice.',
      mode: 'mixed',
      duration: 25,
      generatedByAI: true,
    },
  ],
}

// Fairness lab mock results
export const mockFairnessResults = {
  profileA: {
    name: 'Alex',
    suggestions: [
      'Read the chapter summary and answer 5 comprehension questions',
      'Complete the vocabulary matching exercise',
      'Watch the introduction video before the quiz',
    ],
  },
  profileB: {
    name: 'Jordan',
    suggestions: [
      'Read the chapter summary and answer 5 comprehension questions',
      'Complete the vocabulary matching exercise',
      'Watch the introduction video before the quiz',
    ],
  },
}
