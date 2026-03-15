'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getLessons, getStudentContentFormat, type LessonItem } from '@/lib/api'
import {
  Search,
  Clock,
  Star,
  Play,
  BookOpen,
  Loader2,
  AlertTriangle,
  FileText,
  Layers,
  MessageCircle,
} from 'lucide-react'

export default function StudentLessons() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentFormat, setContentFormat] = useState<'reading' | 'flashcard'>('reading')

  useEffect(() => {
    // Load preference from DB via the selected student
    const studentId = localStorage.getItem('copa_student_id')
    if (studentId) {
      getStudentContentFormat(studentId)
        .then((data) => {
          const fmt = data.content_format as 'reading' | 'flashcard'
          if (fmt === 'reading' || fmt === 'flashcard') setContentFormat(fmt)
        })
        .catch(() => {})
    }

    getLessons()
      .then((data) => {
        // Only show published lessons
        setLessons(data.filter(l => l.status === 'published'))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-8 w-8 text-warning" />
        <p className="text-muted-foreground">Failed to load lessons: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const subjects = [...new Set(lessons.map(l => l.subject))]

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = !selectedSubject || lesson.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Lessons</h1>
          <p className="text-muted-foreground">
            Open lessons in your preferred format:
            <Badge variant="secondary" className="ml-2 gap-1">
              {contentFormat === 'reading' ? <FileText className="h-3 w-3" /> : <Layers className="h-3 w-3" />}
              {contentFormat === 'reading' ? 'Reading' : 'Flashcards'}
            </Badge>
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      </div>

      {/* Subject Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={selectedSubject === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedSubject(null)}
        >
          All Subjects
        </Button>
        {subjects.map((subject) => (
          <Button
            key={subject}
            variant={selectedSubject === subject ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSubject(subject)}
          >
            {subject}
          </Button>
        ))}
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No lessons found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson) => (
            <Card key={lesson.id} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{lesson.subject}</Badge>
                      {lesson.grade_level && (
                        <Badge variant="outline" className="text-xs">Grade {lesson.grade_level}</Badge>
                      )}
                      {lesson.differentiated_content && (
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                          Personalized
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium text-foreground">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{lesson.learning_objective}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link href={`/student/lessons/${lesson.id}`}>
                      <Button size="sm" className="gap-1.5 w-full">
                        {contentFormat === 'reading' ? (
                          <>
                            <FileText className="h-3.5 w-3.5" />
                            Read
                          </>
                        ) : (
                          <>
                            <Layers className="h-3.5 w-3.5" />
                            Study
                          </>
                        )}
                      </Button>
                    </Link>
                    <Link href={`/student/lessons/${lesson.id}?chat=open`}>
                      <Button variant="outline" size="sm" className="gap-1.5 w-full">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
