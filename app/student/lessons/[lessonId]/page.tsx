'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { mockLessons, mockStudents } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Star,
  CheckCircle,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Volume2,
  Eye,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId as string
  
  const lesson = mockLessons.find(l => l.id === lessonId) || mockLessons[0]
  const student = mockStudents[0]
  
  const [currentSection, setCurrentSection] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showHint, setShowHint] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Mock lesson content sections
  const sections = [
    {
      type: 'content',
      title: 'Introduction',
      content: `Welcome to ${lesson.title}! In this lesson, we will explore key concepts and build your understanding step by step.`,
      hasAudio: true,
      hasVisual: true,
    },
    {
      type: 'content',
      title: 'Core Concepts',
      content: 'Let us dive into the main ideas. Remember, learning is a journey - take your time to understand each concept before moving on.',
      hasAudio: true,
      hasVisual: true,
    },
    {
      type: 'question',
      title: 'Check Your Understanding',
      question: 'Based on what you have learned, which statement best describes the main concept?',
      options: [
        'Option A: The first possible answer',
        'Option B: The second possible answer',
        'Option C: The third possible answer',
        'Option D: The fourth possible answer',
      ],
      correctAnswer: 'Option B: The second possible answer',
      hint: 'Think about the key principles we discussed in the introduction.',
    },
    {
      type: 'content',
      title: 'Practical Application',
      content: 'Now let us see how these concepts apply in real-world situations. Understanding the practical side helps reinforce your learning.',
      hasAudio: true,
      hasVisual: true,
    },
    {
      type: 'reflection',
      title: 'Reflect on Your Learning',
      prompt: 'In your own words, explain what you learned today and how you might use this knowledge.',
    },
  ]

  const currentSectionData = sections[currentSection]
  const progress = ((currentSection + 1) / sections.length) * 100

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
      setShowHint(false)
    } else {
      setIsCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      setShowHint(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-border/50">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Lesson Complete!
                </h1>
                <p className="text-muted-foreground">
                  Great job completing {lesson.title}
                </p>
              </div>
              <div className="flex items-center justify-center gap-6 py-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">+{lesson.duration * 10}</p>
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">85%</p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Link href="/student/lessons">
                  <Button variant="outline">Back to Lessons</Button>
                </Link>
                <Button onClick={() => {
                  setCurrentSection(0)
                  setIsCompleted(false)
                  setAnswers({})
                }}>
                  Review Lesson
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Link href="/student/lessons" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Lessons
            </Link>
            <h1 className="text-xl font-semibold text-foreground">{lesson.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="secondary">{lesson.subject}</Badge>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {lesson.duration} min
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                +{lesson.duration * 10} pts
              </span>
            </div>
          </div>
          {student.preferences.visualAids && (
            <Badge variant="outline" className="gap-1">
              <Eye className="h-3 w-3" />
              Visual Mode
            </Badge>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Section {currentSection + 1} of {sections.length}
            </span>
            <span className="font-medium text-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content Card */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {currentSectionData.type === 'content' && <BookOpen className="h-5 w-5 text-primary" />}
                {currentSectionData.type === 'question' && <HelpCircle className="h-5 w-5 text-accent" />}
                {currentSectionData.type === 'reflection' && <MessageSquare className="h-5 w-5 text-secondary-foreground" />}
                {currentSectionData.title}
              </CardTitle>
              {currentSectionData.type === 'content' && currentSectionData.hasAudio && (
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Volume2 className="h-4 w-4" />
                  Listen
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentSectionData.type === 'content' && (
              <>
                <p className="text-foreground leading-relaxed">
                  {currentSectionData.content}
                </p>
                {currentSectionData.hasVisual && student.preferences.visualAids && (
                  <div className="rounded-lg bg-muted/50 p-6 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Eye className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Visual diagram would appear here</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {currentSectionData.type === 'question' && (
              <div className="space-y-4">
                <p className="text-foreground font-medium">
                  {currentSectionData.question}
                </p>
                <RadioGroup
                  value={answers[`q-${currentSection}`] || ''}
                  onValueChange={(value) => setAnswers({ ...answers, [`q-${currentSection}`]: value })}
                  className="space-y-2"
                >
                  {currentSectionData.options?.map((option, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                      <RadioGroupItem value={option} id={`option-${i}`} />
                      <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {currentSectionData.hint && (
                  <div className="pt-2">
                    {showHint ? (
                      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-accent mt-0.5" />
                          <p className="text-sm text-foreground">{currentSectionData.hint}</p>
                        </div>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setShowHint(true)} className="gap-1.5">
                        <Lightbulb className="h-4 w-4" />
                        Need a hint?
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentSectionData.type === 'reflection' && (
              <div className="space-y-3">
                <p className="text-foreground">
                  {currentSectionData.prompt}
                </p>
                <Textarea
                  placeholder="Write your reflection here..."
                  value={answers[`r-${currentSection}`] || ''}
                  onChange={(e) => setAnswers({ ...answers, [`r-${currentSection}`]: e.target.value })}
                  className="min-h-[120px]"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="gap-1.5"
          >
            {currentSection === sections.length - 1 ? (
              <>
                Complete
                <CheckCircle className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
