'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { getStudents, getClasses, type StudentItem, type ClassItem } from '@/lib/api'
import { formatDate } from '@/lib/i18n'
import { Search, BookOpen, Play, Eye, Shuffle, ArrowRight, Loader2, AlertTriangle } from 'lucide-react'

const modeIcons: Record<string, React.ReactNode> = {
  read: <BookOpen className="h-4 w-4" />,
  play: <Play className="h-4 w-4" />,
  watch: <Eye className="h-4 w-4" />,
  mixed: <Shuffle className="h-4 w-4" />,
}

const modeColors: Record<string, string> = {
  read: 'bg-chart-1/10 text-chart-1',
  play: 'bg-chart-2/10 text-chart-2',
  watch: 'bg-chart-3/10 text-chart-3',
  mixed: 'bg-chart-4/10 text-chart-4',
}

const statusColors: Record<string, string> = {
  'on-track': 'bg-success/10 text-success',
  'needs-support': 'bg-warning/10 text-warning-foreground',
  'advanced': 'bg-primary/10 text-primary',
}

const statusLabels: Record<string, string> = {
  'on-track': 'On track',
  'needs-support': 'Needs support',
  'advanced': 'Advanced',
}

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState<StudentItem[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getStudents(), getClasses()])
      .then(([s, c]) => {
        setStudents(s)
        setClasses(c)
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
        <p className="text-muted-foreground">Failed to load students: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase())
  )

  const getClassName = (classId: string | null) => {
    if (!classId) return 'Unassigned'
    const cls = classes.find(c => c.id === classId)
    return cls?.name || 'Unknown'
  }

  const getMode = (student: StudentItem): string => {
    return student.learning_preference?.recommended || 'mixed'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Students</h1>
          <p className="text-muted-foreground">View all students across your classes</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Student Cards for Mobile */}
      <div className="grid gap-4 md:hidden">
        {filteredStudents.map((student) => {
          const mode = getMode(student)
          return (
            <Link key={student.id} href={`/teacher/students/${student.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{getClassName(student.class_id)}</p>
                    </div>
                    <Badge variant="secondary" className={modeColors[mode] || modeColors.mixed}>
                      {modeIcons[mode] || modeIcons.mixed}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant="secondary" className={statusColors[student.performance_status] || statusColors['on-track']}>
                      {statusLabels[student.performance_status] || student.performance_status}
                    </Badge>
                    {student.last_activity_date && (
                      <span className="text-sm text-muted-foreground">
                        Last active: {formatDate(student.last_activity_date)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Table for Desktop */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Learning Preference</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                const mode = getMode(student)
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getClassName(student.class_id)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={modeColors[mode] || modeColors.mixed}>
                        {modeIcons[mode] || modeIcons.mixed}
                        <span className="ml-1 capitalize">{mode}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[student.performance_status] || statusColors['on-track']}>
                        {statusLabels[student.performance_status] || student.performance_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.last_activity_date ? formatDate(student.last_activity_date) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/teacher/students/${student.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          View
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
