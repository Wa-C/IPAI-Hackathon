'use client'

import { use } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { mockStudents, mockClasses, mockLearningActivities } from '@/lib/mock-data'
import { formatDate } from '@/lib/i18n'
import type { LearningMode } from '@/lib/types'
import { 
  ArrowLeft, 
  BookOpen, 
  Play, 
  Eye, 
  Shuffle, 
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trophy,
  TrendingUp,
  Settings2
} from 'lucide-react'

const modeIcons: Record<LearningMode | 'mixed', React.ReactNode> = {
  read: <BookOpen className="h-4 w-4" />,
  play: <Play className="h-4 w-4" />,
  watch: <Eye className="h-4 w-4" />,
  mixed: <Shuffle className="h-4 w-4" />,
}

const modeColors: Record<LearningMode | 'mixed', string> = {
  read: 'bg-chart-1/10 text-chart-1',
  play: 'bg-chart-2/10 text-chart-2',
  watch: 'bg-chart-3/10 text-chart-3',
  mixed: 'bg-chart-4/10 text-chart-4',
}

const statusColors = {
  'on-track': 'bg-success/10 text-success',
  'needs-support': 'bg-warning/10 text-warning-foreground',
  'advanced': 'bg-primary/10 text-primary',
}

const statusLabels = {
  'on-track': 'On track',
  'needs-support': 'Needs support',
  'advanced': 'Advanced',
}

export default function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params)
  const student = mockStudents.find(s => s.id === studentId) || mockStudents[0]
  const classData = mockClasses.find(c => c.id === student.classId)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Mock learning plan activities
  const learningPlan = [
    { id: 1, title: 'Shakespeare Introduction Video', mode: 'watch' as LearningMode, status: 'completed', date: '2024-03-08' },
    { id: 2, title: 'Character Quiz Challenge', mode: 'play' as LearningMode, status: 'completed', date: '2024-03-09' },
    { id: 3, title: 'Act 1 Reading Comprehension', mode: 'read' as LearningMode, status: 'in-progress', date: '2024-03-10' },
    { id: 4, title: 'Theme Analysis Game', mode: 'play' as LearningMode, status: 'upcoming', date: '2024-03-12' },
    { id: 5, title: 'Essay Writing Exercise', mode: 'read' as LearningMode, status: 'upcoming', date: '2024-03-14' },
  ]

  // Mock materials
  const materials = [
    { id: 1, title: 'Romeo and Juliet - Simplified', biasScan: 'clean' },
    { id: 2, title: 'Shakespeare Timeline', biasScan: 'clean' },
    { id: 3, title: 'Character Relationships Chart', biasScan: 'warning' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/teacher/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to students</span>
          </Button>
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-accent text-accent-foreground text-lg">
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{student.name}</h1>
            <p className="text-muted-foreground">
              {classData?.name} - Grade {classData?.grade}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="learning-plan">Learning Plan</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Recent Quiz Score</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  +12% from previous
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Activity Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">High</div>
                <p className="text-xs text-muted-foreground">
                  Last active: {formatDate(student.lastActivityDate)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Recommended Mode</CardTitle>
                <div className={`p-1.5 rounded ${modeColors[student.learningPreference.recommended]}`}>
                  {modeIcons[student.learningPreference.recommended]}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{student.learningPreference.recommended}</div>
                <p className="text-xs text-muted-foreground">
                  Based on engagement data
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className={statusColors[student.performanceStatus]}>
                  {statusLabels[student.performanceStatus]}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Learning Mode Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Learning Mode Preferences</CardTitle>
              <CardDescription>Engagement scores by learning mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-chart-1" />
                    Read
                  </span>
                  <span className="font-medium">{student.learningPreference.scores.read}%</span>
                </div>
                <Progress value={student.learningPreference.scores.read} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-chart-2" />
                    Play
                  </span>
                  <span className="font-medium">{student.learningPreference.scores.play}%</span>
                </div>
                <Progress value={student.learningPreference.scores.play} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-chart-3" />
                    Watch
                  </span>
                  <span className="font-medium">{student.learningPreference.scores.watch}%</span>
                </div>
                <Progress value={student.learningPreference.scores.watch} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Teacher Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Teacher Notes</CardTitle>
              <CardDescription>Private notes about this student</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add notes about this student's progress, needs, or observations..."
                rows={4}
                defaultValue="Max shows strong engagement with interactive content. Consider increasing play-based activities for vocabulary learning. Struggles with longer reading passages."
              />
              <Button size="sm">Save Notes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Plan Tab */}
        <TabsContent value="learning-plan" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Upcoming & Recent Activities</h3>
              <p className="text-sm text-muted-foreground">Track progress through assigned activities</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Settings2 className="h-4 w-4" />
                Switch Mode Emphasis
              </Button>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Activity
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {learningPlan.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${modeColors[activity.mode]}`}>
                        {modeIcons[activity.mode]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        activity.status === 'completed'
                          ? 'bg-success/10 text-success'
                          : activity.status === 'in-progress'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {activity.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {activity.status === 'in-progress' && <Clock className="h-3 w-3 mr-1" />}
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1).replace('-', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="mt-6 space-y-6">
          <div>
            <h3 className="font-medium">Assigned Materials</h3>
            <p className="text-sm text-muted-foreground">Materials assigned to this student with bias scan status</p>
          </div>

          <div className="space-y-4">
            {materials.map((material) => (
              <Card key={material.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{material.title}</p>
                    <div className="flex items-center gap-2">
                      {material.biasScan === 'clean' ? (
                        <Badge variant="secondary" className="bg-success/10 text-success gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Clean
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-warning/10 text-warning-foreground gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Needs Review
                        </Badge>
                      )}
                      <Link href="/teacher/bias-scanner">
                        <Button variant="ghost" size="sm">Scan</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
