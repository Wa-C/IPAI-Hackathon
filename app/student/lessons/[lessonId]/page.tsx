'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  generateContent,
  getStudentContentFormat,
  type ReadingContent,
  type FlashcardContent,
  type GeneratedContent,
} from '@/lib/api'
import { ChatWidget } from '@/components/chat/chat-widget'
import {
  ArrowLeft,
  Clock,
  Star,
  BookOpen,
  Loader2,
  AlertTriangle,
  Brain,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Zap,
  FileText,
  Layers,
  RotateCcw,
  Gamepad2,
  Video,
  Lock,
} from 'lucide-react'

// ─── Flashcard View ─────────────────────────────────────────
function FlashcardView({ content }: { content: FlashcardContent }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  const card = content.cards[currentIndex]
  if (!card) return null

  const markComplete = () => {
    setCompleted(prev => new Set(prev).add(currentIndex))
    if (currentIndex < content.cards.length - 1) {
      setFlipped(false)
      setTimeout(() => setCurrentIndex(currentIndex + 1), 200)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{content.description}</span>
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {completed.size}/{content.cards.length}
        </Badge>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center flex-wrap">
        {content.cards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setFlipped(false); setCurrentIndex(i) }}
            className={`w-3 h-3 rounded-full transition-all ${
              i === currentIndex
                ? 'bg-primary scale-125'
                : completed.has(i)
                ? 'bg-emerald-500'
                : 'bg-muted-foreground/20'
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="mx-auto" style={{ perspective: '1000px', maxWidth: '520px' }}>
        <div
          onClick={() => setFlipped(!flipped)}
          className="cursor-pointer"
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '300px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="rounded-2xl shadow-xl border-2 border-primary/20 p-8 flex flex-col items-center justify-center text-center"
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)',
            }}
          >
            <div
              className="p-3 rounded-xl mb-5"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)' }}
            >
              <Zap className="h-6 w-6 text-white" />
            </div>
            <p className="text-lg font-semibold text-foreground leading-relaxed px-2">{card.front}</p>
            {card.hint && (
              <p className="text-xs text-muted-foreground mt-5 italic bg-muted/50 px-3 py-1.5 rounded-full">
                Hint: {card.hint}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-4 opacity-50">Tap to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className="rounded-2xl shadow-xl border-2 border-emerald-500/20 p-8 flex flex-col items-center justify-center text-center"
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(145deg, hsl(var(--card)) 0%, rgba(16,185,129,0.05) 100%)',
            }}
          >
            <div className="p-3 rounded-xl bg-emerald-500/10 mb-5">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-base text-foreground leading-relaxed px-2">{card.back}</p>
            <Button
              size="sm"
              className="mt-6 gap-1.5 rounded-full"
              onClick={(e) => { e.stopPropagation(); markComplete() }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Got it!
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10"
          onClick={() => { setFlipped(false); setCurrentIndex(Math.max(0, currentIndex - 1)) }}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-muted-foreground font-medium">
          {currentIndex + 1} / {content.cards.length}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10"
          onClick={() => { setFlipped(false); setCurrentIndex(Math.min(content.cards.length - 1, currentIndex + 1)) }}
          disabled={currentIndex === content.cards.length - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Completion */}
      {completed.size === content.cards.length && (
        <div className="text-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="font-semibold text-foreground">All cards complete!</p>
          <p className="text-sm text-muted-foreground mt-1">Great job studying this lesson</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-1.5"
            onClick={() => { setCompleted(new Set()); setCurrentIndex(0); setFlipped(false) }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Study Again
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Reading View ───────────────────────────────────────────
function ReadingView({ content }: { content: ReadingContent }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <span>{content.estimated_minutes} min read</span>
      </div>

      {content.sections.map((section, i) => (
        <article key={i}>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)' }}
            >
              {i + 1}
            </span>
            {section.heading}
          </h3>
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pl-11">
            {section.body}
          </div>
          {section.key_terms.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pl-11">
              {section.key_terms.map((term) => (
                <Badge
                  key={term}
                  variant="secondary"
                  className="rounded-full text-xs bg-primary/10 text-primary border-0"
                >
                  {term}
                </Badge>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────
export default function StudentLessonPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const lessonId = params.lessonId as string
  const chatOpen = searchParams.get('chat') === 'open'

  const [lesson, setLesson] = useState<any>(null)
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentFormat, setContentFormat] = useState<'reading' | 'flashcard'>('reading')
  const [studentId, setStudentId] = useState<string | null>(null)

  // Resolve student ID
  useEffect(() => {
    const sid = localStorage.getItem('copa_student_id')
    if (sid) {
      setStudentId(sid)
    } else {
      // Fallback: fetch first available student
      import('@/lib/api').then(({ getStudentsList }) => {
        getStudentsList()
          .then((students) => {
            if (students.length > 0) {
              localStorage.setItem('copa_student_id', students[0].id)
              setStudentId(students[0].id)
            }
          })
          .catch(() => {})
      })
    }
  }, [])

  useEffect(() => {
    // Fetch lesson details then generate content based on DB preference
    async function loadLesson() {
      try {
        // Load student preference from DB
        const studentId = localStorage.getItem('copa_student_id')
        let format: 'reading' | 'flashcard' = 'reading'
        if (studentId) {
          try {
            const pref = await getStudentContentFormat(studentId)
            if (pref.content_format === 'reading' || pref.content_format === 'flashcard') {
              format = pref.content_format
            }
          } catch {}
        }
        setContentFormat(format)

        const res = await fetch(`http://localhost:8000/api/v1/lessons/${lessonId}`)
        if (!res.ok) throw new Error('Failed to load lesson')
        const lessonData = await res.json()
        setLesson(lessonData)

        // Generate content based on preference
        const generated = await generateContent({
          title: lessonData.title,
          subject: lessonData.subject,
          topic: lessonData.topic,
          learning_objective: lessonData.learning_objective,
          base_material: lessonData.base_material || undefined,
          grade_level: lessonData.grade_level || undefined,
          content_type: format,
        })
        setContent(generated)
      } catch (e: any) {
        setError(e.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    loadLesson()
  }, [lessonId])

  // Switch format and regenerate
  const handleSwitchFormat = async (format: 'reading' | 'flashcard') => {
    if (!lesson || format === contentFormat) return
    setContentFormat(format)
    localStorage.setItem('copa_content_format', format)
    setLoading(true)
    setError(null)
    setContent(null)
    try {
      const generated = await generateContent({
        title: lesson.title,
        subject: lesson.subject,
        topic: lesson.topic,
        learning_objective: lesson.learning_objective,
        base_material: lesson.base_material || undefined,
        grade_level: lesson.grade_level || undefined,
        content_type: format,
      })
      setContent(generated)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href="/student/lessons"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lessons
        </Link>

        {/* Lesson Header */}
        {lesson && (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">{lesson.title}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="secondary">{lesson.subject}</Badge>
                  {lesson.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {lesson.duration} min
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    +{(lesson.duration || 30) * 10} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Format Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View as:</span>
              <Button
                variant={contentFormat === 'reading' ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5 rounded-full"
                onClick={() => handleSwitchFormat('reading')}
                disabled={loading}
              >
                <FileText className="h-3.5 w-3.5" />
                Reading
              </Button>
              <Button
                variant={contentFormat === 'flashcard' ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5 rounded-full"
                onClick={() => handleSwitchFormat('flashcard')}
                disabled={loading}
              >
                <Layers className="h-3.5 w-3.5" />
                Flashcards
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-full opacity-50 cursor-not-allowed"
                disabled
              >
                <Gamepad2 className="h-3.5 w-3.5" />
                Gamification
                <Lock className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-full opacity-50 cursor-not-allowed"
                disabled
              >
                <Video className="h-3.5 w-3.5" />
                Video
                <Lock className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Content Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div
                className="p-2 rounded-xl shadow-md"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              {content?.type === 'reading' ? 'Reading Lesson' : content?.type === 'flashcard' ? 'Flashcard Study' : 'AI Lesson'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <Loader2 className="absolute -top-1 -right-1 h-5 w-5 animate-spin text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mt-4">
                  Preparing your {contentFormat === 'reading' ? 'reading' : 'flashcards'}...
                </p>
                <p className="text-xs text-muted-foreground mt-1">Tailored to your learning preference</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <AlertTriangle className="h-8 w-8 text-warning" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            )}

            {/* Reading */}
            {!loading && !error && content?.type === 'reading' && (
              <ReadingView content={content as ReadingContent} />
            )}

            {/* Flashcards */}
            {!loading && !error && content?.type === 'flashcard' && (
              <FlashcardView content={content as FlashcardContent} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* COPA Chatbot Widget */}
      {studentId && (
        <ChatWidget studentId={studentId} lessonId={lessonId} defaultOpen={chatOpen} />
      )}
    </div>
  )
}
