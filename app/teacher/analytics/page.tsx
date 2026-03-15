'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { mockDifferentiationOverview, mockInclusionRadar, mockClasses } from '@/lib/mock-data'
import { TrendingUp, TrendingDown, Users, BookOpen, Play, Eye, Shuffle } from 'lucide-react'

export default function TeacherAnalyticsPage() {
  const totalStudents = 
    mockDifferentiationOverview.readers +
    mockDifferentiationOverview.players +
    mockDifferentiationOverview.watchers +
    mockDifferentiationOverview.mixed

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Overview of learning patterns and inclusion metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockClasses.length}</div>
            <p className="text-xs text-muted-foreground">Across all grades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bias Issues Resolved</CardTitle>
            <Badge variant="secondary">This Week</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24/28</div>
            <Progress value={85} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Mode Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Mode Distribution</CardTitle>
          <CardDescription>How students prefer to learn across all your classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
              <BookOpen className="h-8 w-8 text-chart-1 mb-2" />
              <span className="text-2xl font-bold">{mockDifferentiationOverview.readers}</span>
              <span className="text-sm text-muted-foreground">Readers</span>
              <span className="text-xs text-muted-foreground">
                {Math.round((mockDifferentiationOverview.readers / totalStudents) * 100)}%
              </span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
              <Play className="h-8 w-8 text-chart-2 mb-2" />
              <span className="text-2xl font-bold">{mockDifferentiationOverview.players}</span>
              <span className="text-sm text-muted-foreground">Players</span>
              <span className="text-xs text-muted-foreground">
                {Math.round((mockDifferentiationOverview.players / totalStudents) * 100)}%
              </span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
              <Eye className="h-8 w-8 text-chart-3 mb-2" />
              <span className="text-2xl font-bold">{mockDifferentiationOverview.watchers}</span>
              <span className="text-sm text-muted-foreground">Watchers</span>
              <span className="text-xs text-muted-foreground">
                {Math.round((mockDifferentiationOverview.watchers / totalStudents) * 100)}%
              </span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
              <Shuffle className="h-8 w-8 text-chart-4 mb-2" />
              <span className="text-2xl font-bold">{mockDifferentiationOverview.mixed}</span>
              <span className="text-sm text-muted-foreground">Mixed</span>
              <span className="text-xs text-muted-foreground">
                {Math.round((mockDifferentiationOverview.mixed / totalStudents) * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inclusion Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Inclusion Metrics</CardTitle>
          <CardDescription>Bias scan results by category this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(mockInclusionRadar.byCategory).map(([category, data]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {category.replace('socioeconomic', 'Socio-economic')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {data.resolved}/{data.flagged} resolved
                  </span>
                </div>
                <Progress value={(data.resolved / data.flagged) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
