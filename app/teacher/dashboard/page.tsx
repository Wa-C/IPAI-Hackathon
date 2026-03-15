'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getDashboardSummary, type DashboardSummary } from '@/lib/api'
import {
  Plus,
  Sparkles,
  Route,
  BookOpen,
  Play,
  Eye,
  Shuffle,
  Clock,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Zap,
  Brain,
  Loader2,
} from 'lucide-react'

export default function TeacherDashboardPage() {
  const { user, organisation } = useAuth()
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
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

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-8 w-8 text-warning" />
        <p className="text-muted-foreground">Failed to load dashboard: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const totalStudents =
    data.learning_modes.readers +
    data.learning_modes.players +
    data.learning_modes.watchers +
    data.learning_modes.mixed

  const totalIssues = data.bias_overview.total_flagged
  const resolvedIssues = data.bias_overview.total_resolved

  const quickStats = [
    { label: 'Active Students', value: String(data.stats.total_students), change: '+12%', icon: Users, color: 'from-purple-500 to-indigo-500' },
    { label: 'Lessons Created', value: String(data.stats.total_lessons), change: '+8%', icon: BookOpen, color: 'from-cyan-500 to-blue-500' },
    { label: 'AI Generations', value: String(data.stats.ai_generations), change: '+24%', icon: Brain, color: 'from-orange-500 to-red-500' },
    { label: 'Avg. Engagement', value: `${data.stats.avg_engagement}%`, change: '+5%', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
  ]

  const todayClasses = data.classes.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            {organisation?.name} - Here{"'"}s what{"'"}s happening today
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/teacher/lesson-builder">
            <Button
              className="gap-2 text-white border-0 shadow-lg hover:shadow-xl hover:opacity-90 transition-all rounded-xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
            >
              <Plus className="h-4 w-4" />
              Create Lesson
            </Button>
          </Link>
          <Link href="/teacher/bias-scanner">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Sparkles className="h-4 w-4" />
              Scan Material
            </Button>
          </Link>
        </div>
      </div>

      {/* Privacy Banner */}
      <div
        className="rounded-2xl p-4 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
      >
        <div className="flex items-center gap-4 text-white">
          <div className="p-2 rounded-xl bg-white/20">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Privacy First</p>
            <p className="text-sm text-white/80">
              Your students{"'"} detailed data stays on this school server. COPA only uses anonymised patterns.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-lg card-interactive overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-md`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs border-0"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
                >
                  {stat.change}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Classes */}
        <Card className="border-0 shadow-lg lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                Today{"'"}s Classes
              </CardTitle>
              <Badge variant="outline" className="rounded-full">{todayClasses.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayClasses.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/teacher/classes/${cls.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all hover:scale-[1.02] group"
                >
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{cls.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cls.student_count} students
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className="text-white border-0 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                    >
                      {cls.next_lesson_time
                        ? new Date(cls.next_lesson_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Differentiation Overview */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-xl bg-chart-2/10">
                <Users className="h-4 w-4 text-chart-2" />
              </div>
              Learning Modes
            </CardTitle>
            <CardDescription>How your students prefer to learn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { icon: BookOpen, label: 'Readers', value: data.learning_modes.readers, color: 'bg-chart-1' },
                { icon: Play, label: 'Players', value: data.learning_modes.players, color: 'bg-chart-2' },
                { icon: Eye, label: 'Watchers', value: data.learning_modes.watchers, color: 'bg-chart-3' },
                { icon: Shuffle, label: 'Mixed', value: data.learning_modes.mixed, color: 'bg-chart-4' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all`}
                      style={{ width: `${totalStudents > 0 ? (item.value / totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inclusion Radar */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-xl bg-accent/10">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              Inclusion Radar
            </CardTitle>
            <CardDescription>Bias scan results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Issues Resolved</p>
                  <p className="text-2xl font-bold text-success">{resolvedIssues}/{totalIssues}</p>
                </div>
                <Progress value={totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0} className="h-2" />
              </div>

              {/* Categories */}
              <div className="space-y-3">
                {(["gender", "culture", "socioeconomic", "ableism"] as const).map((category) => {
                  const catData = data.bias_overview[category]
                  return (
                    <div key={category} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                      <span className="capitalize text-sm text-muted-foreground">
                        {category.replace('socioeconomic', 'socio-economic')}
                      </span>
                      <div className="flex items-center gap-2">
                        {catData.flagged > catData.resolved ? (
                          <div className="p-1 rounded-full bg-warning/10">
                            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                          </div>
                        ) : (
                          <div className="p-1 rounded-full bg-success/10">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          </div>
                        )}
                        <span className="font-medium text-sm">{catData.resolved}/{catData.flagged}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-secondary/50 to-background">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-2xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
              >
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Ready to create your next lesson?</h3>
                <p className="text-sm text-muted-foreground">Use AI to generate differentiated content in seconds</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/teacher/lesson-builder">
                <Button
                  className="gap-2 text-white border-0 rounded-xl hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                >
                  <Brain className="h-4 w-4" />
                  AI Lesson Builder
                </Button>
              </Link>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Route className="h-4 w-4" />
                Adaptive Paths
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
