'use client'

import { useState } from 'react'
import { mockLessons } from '@/lib/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search,
  Clock,
  Star,
  Play,
  CheckCircle,
  BookOpen,
  Filter
} from 'lucide-react'
import Link from 'next/link'

export default function StudentLessons() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  
  const publishedLessons = mockLessons.filter(l => l.status === 'published')
  
  // Simulate progress for lessons
  const lessonProgress: Record<string, number> = {
    'lesson-1': 100,
    'lesson-2': 45,
    'lesson-3': 0,
    'lesson-4': 75,
    'lesson-5': 0,
  }

  const subjects = [...new Set(publishedLessons.map(l => l.subject))]
  
  const filteredLessons = publishedLessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = !selectedSubject || lesson.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  const inProgressLessons = filteredLessons.filter(l => {
    const progress = lessonProgress[l.id] || 0
    return progress > 0 && progress < 100
  })

  const completedLessons = filteredLessons.filter(l => lessonProgress[l.id] === 100)
  const newLessons = filteredLessons.filter(l => !lessonProgress[l.id])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Lessons</h1>
          <p className="text-muted-foreground">Continue learning at your own pace</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Tabs */}
      <Tabs defaultValue="in-progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="in-progress" className="gap-2">
            <Play className="h-4 w-4" />
            In Progress ({inProgressLessons.length})
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-2">
            <BookOpen className="h-4 w-4" />
            New ({newLessons.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedLessons.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-3">
          {inProgressLessons.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <Play className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No lessons in progress</p>
                <p className="text-sm text-muted-foreground mt-1">Start a new lesson to begin learning!</p>
              </CardContent>
            </Card>
          ) : (
            inProgressLessons.map((lesson) => (
              <LessonCard 
                key={lesson.id} 
                lesson={lesson} 
                progress={lessonProgress[lesson.id] || 0}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-3">
          {newLessons.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-10 w-10 text-success mx-auto mb-3" />
                <p className="text-muted-foreground">You have started all available lessons!</p>
              </CardContent>
            </Card>
          ) : (
            newLessons.map((lesson) => (
              <LessonCard 
                key={lesson.id} 
                lesson={lesson} 
                progress={0}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completedLessons.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No completed lessons yet</p>
                <p className="text-sm text-muted-foreground mt-1">Complete your first lesson to earn points!</p>
              </CardContent>
            </Card>
          ) : (
            completedLessons.map((lesson) => (
              <LessonCard 
                key={lesson.id} 
                lesson={lesson} 
                progress={100}
                completed
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Trophy } from 'lucide-react'
import type { Lesson } from '@/lib/types'

function LessonCard({ 
  lesson, 
  progress, 
  completed = false 
}: { 
  lesson: Lesson
  progress: number
  completed?: boolean 
}) {
  return (
    <Card className={`border-border/50 hover:border-primary/30 transition-colors ${
      completed ? 'bg-success/5' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {lesson.subject}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Grade {lesson.gradeLevel}
              </Badge>
              {completed && (
                <Badge className="bg-success text-success-foreground text-xs">
                  Completed
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-foreground">{lesson.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {lesson.duration} min
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                +{lesson.duration * 10} pts
              </span>
              {lesson.differentiatedContent && (
                <Badge variant="outline" className="text-xs">
                  Personalized
                </Badge>
              )}
            </div>
            {!completed && progress > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}
          </div>
          <Link href={`/student/lessons/${lesson.id}`}>
            <Button size="sm" variant={completed ? 'outline' : 'default'} className="gap-1.5">
              {completed ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Review
                </>
              ) : progress > 0 ? (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Continue
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Start
                </>
              )}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
