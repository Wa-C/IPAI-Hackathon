'use client'

import { useAuth } from '@/lib/auth-context'
import { mockClasses, mockStudents, mockTeachers, mockLessons } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  Settings,
  Database,
  Activity
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user } = useAuth()

  const stats = [
    {
      label: 'Total Teachers',
      value: mockTeachers.length.toString(),
      change: '+2 this month',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total Students',
      value: mockStudents.length.toString(),
      change: '+15 this month',
      icon: GraduationCap,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Active Classes',
      value: mockClasses.length.toString(),
      change: 'Across all grades',
      icon: BookOpen,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Lessons Created',
      value: mockLessons.length.toString(),
      change: '+8 this week',
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ]

  const systemHealth = [
    { name: 'Database', status: 'healthy', uptime: '99.9%' },
    { name: 'AI Service', status: 'healthy', uptime: '99.7%' },
    { name: 'Storage', status: 'healthy', uptime: '100%' },
    { name: 'Auth Service', status: 'healthy', uptime: '99.9%' },
  ]

  const recentActivity = [
    { action: 'New teacher registered', user: 'Maria Schmidt', time: '5 minutes ago' },
    { action: 'Lesson published', user: 'Hans Mueller', time: '15 minutes ago' },
    { action: 'Class created', user: 'Anna Weber', time: '1 hour ago' },
    { action: 'Bias scan completed', user: 'System', time: '2 hours ago' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your organization: {user?.organizationId || 'Berlin International School'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* System Health */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-success" />
              System Health
            </CardTitle>
            <CardDescription>All services operational</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemHealth.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm font-medium text-foreground">{service.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{service.uptime}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data Privacy Compliance */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              GDPR Compliance
            </CardTitle>
            <CardDescription>Privacy and data protection status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Compliance Score</span>
                <span className="font-medium text-foreground">98%</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-foreground">Data processing agreements signed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-foreground">Consent management active</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-foreground">Data retention policy configured</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-foreground">1 pending consent request</span>
              </div>
            </div>
            <Link href="/admin/settings/privacy">
              <Button variant="outline" size="sm" className="w-full">View Details</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user} - {activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">Manage Users</span>
              </Button>
            </Link>
            <Link href="/admin/integrations">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Database className="h-5 w-5" />
                <span className="text-sm">Integrations</span>
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Settings className="h-5 w-5" />
                <span className="text-sm">Settings</span>
              </Button>
            </Link>
            <Link href="/admin/settings/privacy">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Privacy</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
