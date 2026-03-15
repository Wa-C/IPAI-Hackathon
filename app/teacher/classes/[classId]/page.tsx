'use client'

import { use } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { mockClasses, mockStudents } from '@/lib/mock-data'
import { formatDate } from '@/lib/i18n'
import type { LearningMode, Student } from '@/lib/types'
import { 
  ArrowLeft, 
  BookOpen, 
  Play, 
  Eye, 
  Shuffle, 
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles
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

function AssignActivitiesDialog({ mode, count }: { mode: LearningMode; count: number }) {
  const descriptions: Record<LearningMode, string> = {
    read: 'Students in this group prefer text-based learning. Activities will include reading passages, written exercises, and comprehension tasks.',
    play: 'Students in this group prefer interactive learning. Activities will include gamified quizzes, competitive challenges, and hands-on exercises.',
    watch: 'Students in this group prefer visual learning. Activities will include video content, animated explanations, and visual demonstrations.',
    mixed: 'Students in this group have no strong preference. Activities will include a balanced mix of reading, interactive, and video content.',
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          Assign Activities
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {modeIcons[mode]}
            Assign Activities for {mode.charAt(0).toUpperCase() + mode.slice(1)}ers
          </DialogTitle>
          <DialogDescription>
            {count} students will receive these tailored activities
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{descriptions[mode]}</p>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <h4 className="font-medium text-sm">Sample activities:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- Chapter summary with comprehension questions</li>
              <li>- Vocabulary matching exercise</li>
              <li>- Theme analysis worksheet</li>
            </ul>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Assign to {count} Students</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ClassDetailPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = use(params)
  const classData = mockClasses.find(c => c.id === classId) || mockClasses[0]
  const students = mockStudents.filter(s => classData.studentIds.includes(s.id) || s.classId === classId)

  // Group students by learning mode
  const studentsByMode = students.reduce((acc, student) => {
    const mode = student.learningPreference.recommended
    if (!acc[mode]) acc[mode] = []
    acc[mode].push(student)
    return acc
  }, {} as Record<LearningMode, Student[]>)

  // Mock inclusion data
  const inclusionData = [
    { material: 'Lesson 5: Poetry Analysis', scanned: '2024-03-08', issues: 2, resolved: 2 },
    { material: 'Lesson 4: Creative Writing', scanned: '2024-03-05', issues: 1, resolved: 1 },
    { material: 'Lesson 3: Grammar Review', scanned: '2024-03-01', issues: 0, resolved: 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/teacher/classes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to classes</span>
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{classData.name}</h1>
          <p className="text-muted-foreground">
            Grade {classData.grade} - {classData.subject} - {students.length} students
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="learning-modes">Learning Modes</TabsTrigger>
          <TabsTrigger value="inclusion">Inclusion</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Students
              </CardTitle>
              <CardDescription>
                View and manage students in this class
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Learning Preference</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={modeColors[student.learningPreference.recommended]}>
                          {modeIcons[student.learningPreference.recommended]}
                          <span className="ml-1 capitalize">{student.learningPreference.recommended}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(student.lastActivityDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[student.performanceStatus]}>
                          {statusLabels[student.performanceStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/teacher/students/${student.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Modes Tab */}
        <TabsContent value="learning-modes" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {(['read', 'play', 'watch', 'mixed'] as const).map((mode) => {
              const modeStudents = studentsByMode[mode] || []
              return (
                <Card key={mode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className={`p-2 rounded-lg ${modeColors[mode]}`}>
                          {modeIcons[mode]}
                        </div>
                        <span className="capitalize">{mode}ers</span>
                      </CardTitle>
                      <Badge variant="outline">{modeStudents.length} students</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {modeStudents.length > 0 ? (
                      <>
                        <div className="space-y-2">
                          {modeStudents.slice(0, 3).map((student) => (
                            <div key={student.id} className="flex items-center justify-between text-sm">
                              <span>{student.name}</span>
                              <Badge variant="secondary" className={statusColors[student.performanceStatus]}>
                                {statusLabels[student.performanceStatus]}
                              </Badge>
                            </div>
                          ))}
                          {modeStudents.length > 3 && (
                            <p className="text-sm text-muted-foreground">
                              +{modeStudents.length - 3} more
                            </p>
                          )}
                        </div>
                        <AssignActivitiesDialog mode={mode} count={modeStudents.length} />
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No students in this group</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Inclusion Tab */}
        <TabsContent value="inclusion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Inclusion Scan History
              </CardTitle>
              <CardDescription>
                Bias scan results for materials used in this class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inclusionData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{item.material}</p>
                    <p className="text-sm text-muted-foreground">Scanned {formatDate(item.scanned)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.issues === 0 ? (
                      <Badge variant="secondary" className="bg-success/10 text-success gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Clean
                      </Badge>
                    ) : item.resolved === item.issues ? (
                      <Badge variant="secondary" className="bg-success/10 text-success gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {item.resolved}/{item.issues} resolved
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-warning/10 text-warning-foreground gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {item.resolved}/{item.issues} resolved
                      </Badge>
                    )}
                    <Link href="/teacher/bias-scanner">
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
