'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  mockTodayClasses, 
  mockDifferentiationOverview, 
  mockInclusionRadar 
} from '@/lib/mock-data'
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
} from 'lucide-react'

export default function TeacherDashboardPage() {
  const { user, organisation } = useAuth()
  
  const totalStudents = 
    mockDifferentiationOverview.readers +
    mockDifferentiationOverview.players +
    mockDifferentiationOverview.watchers +
    mockDifferentiationOverview.mixed

  const totalIssues = Object.values(mockInclusionRadar.byCategory).reduce(
    (acc, cat) => acc + cat.flagged,
    0
  )
  const resolvedIssues = Object.values(mockInclusionRadar.byCategory).reduce(
    (acc, cat) => acc + cat.resolved,
    0
  )

  const quickStats = [
    { label: 'Active Students', value: '156', change: '+12%', icon: Users, color: 'bg-[#0066FF]' },
    { label: 'Lessons Created', value: '48', change: '+8%', icon: BookOpen, color: 'bg-slate-400' },
    { label: 'AI Generations', value: '234', change: '+24%', icon: Brain, color: 'bg-slate-500' },
    { label: 'Avg. Engagement', value: '87%', change: '+5%', icon: TrendingUp, color: 'bg-[#0066FF]/80' },
  ]

  return (
    <div className="space-y-10 bg-[#F8FAFC] min-h-screen pb-12 pt-8 px-4 lg:px-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[#0A1A3F] drop-shadow-sm">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-slate-500 text-lg font-bold">
              Your AI-Assistant is ready for your classes.
            </p>
          </div>
          {/* AI Efficiency Tracker */}
          <div className="flex items-center gap-4 mt-4">
            <Progress value={85} className="w-48 lg:w-64 h-1.5 bg-[#0066FF]/10 shadow-inner [&>div]:bg-gradient-to-r [&>div]:from-[#0066FF] [&>div]:to-cyan-400" />
            <span className="text-[#0066FF] font-bold text-sm bg-blue-50/50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">
              <Zap className="w-3.5 h-3.5 inline mr-1.5 fill-[#0066FF]" />
              12.5 hours saved this week
            </span>
          </div>
        <div className="flex gap-3">
          <Link href="/teacher/lesson-builder">
            <Button 
              className="gap-2 text-white border-0 shadow-lg hover:shadow-[0_8px_20px_rgba(0,102,255,0.3)] hover:opacity-95 transition-all rounded-full shadow-blue-500/20"
              style={{ backgroundColor: '#0066FF' }}
            >
              <Plus className="h-4 w-4" />
              Create Lesson
            </Button>
          </Link>
          <Link href="/teacher/bias-scanner">
            <Button variant="outline" className="gap-2 rounded-full border border-[#0066FF]/30 bg-white shadow-sm hover:shadow-md text-[#0066FF] hover:bg-[#F8FAFC] transition-all">
              <Sparkles className="h-4 w-4" />
              Scan Material
            </Button>
          </Link>
        </div>
      </div>

      {/* Privacy Banner */}
      <div 
        className="rounded-[3rem] p-6 lg:px-10 flex flex-col md:flex-row items-center gap-6 shadow-[0_0_30px_rgba(0,102,255,0.3)] hover:scale-[1.01] transition-transform duration-500 bg-[#1E293B] border border-[#0066FF]/30"
      >
        <div className="p-4 rounded-[2rem] bg-[#0066FF]/20 shrink-0 shadow-inner backdrop-blur-md border border-[#0066FF]/50 relative">
          <Shield className="h-8 w-8 text-[#0066FF] drop-shadow-[0_0_10px_rgba(0,102,255,0.8)]" />
          <div className="absolute inset-0 bg-[#0066FF] blur-xl opacity-20 rounded-full"></div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="font-black text-2xl lg:text-3xl text-white mb-2 drop-shadow-sm">Privacy First.</p>
          <p className="text-base text-[#94A3B8] max-w-2xl font-medium">
            Your students{"'"} detailed data stays securely on this school server. COPA ensures your school data stays private and secure, ensuring complete privacy compliance.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-[0_20px_50px_rgba(0,102,255,0.08)] hover:shadow-[0_20px_50px_rgba(0,102,255,0.15)] rounded-[3rem] bg-white hover:scale-[1.02] transition-transform duration-300 card-interactive overflow-hidden">
            <CardContent className="p-8 lg:p-10">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${stat.color} shadow-[0_4px_20px_rgba(0,102,255,0.2)]`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-sm border-0 font-bold bg-white text-[#0066FF] px-3 py-1 shadow-sm"
                >
                  {stat.change}
                </Badge>
              </div>
              <p className="text-5xl font-black text-[#0A1A3F] mb-2 tracking-tight">{stat.value}</p>
              <p className="text-lg font-bold text-slate-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
        {/* Today's Classes */}
        <Card className="border-0 shadow-[0_20px_50px_rgba(0,102,255,0.08)] hover:shadow-[0_20px_50px_rgba(0,102,255,0.12)] rounded-[3rem] bg-white hover:scale-[1.01] transition-transform duration-300 lg:col-span-1">
          <CardHeader className="pb-4 pt-8 px-8">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black flex items-center gap-3 text-[#0A1A3F]">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                Today{"'"}s Classes
              </CardTitle>
              <Badge variant="outline" className="rounded-full">{mockTodayClasses.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTodayClasses.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/teacher/classes/${cls.id}`}
                  className="flex items-center justify-between p-5 rounded-[2rem] bg-[#F8FAFC] hover:bg-[#0066FF]/5 border border-[#0066FF]/5 transition-all hover:scale-[1.02] group shadow-sm"
                >
                  <div>
                    <p className="font-black text-lg text-[#0A1A3F] group-hover:text-[#0066FF] transition-colors">{cls.name}</p>
                    <p className="text-base font-medium text-slate-500 mt-1">
                      {cls.studentCount} students
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      className="text-[#0066FF] bg-[#0066FF]/10 hover:bg-[#0066FF]/20 border-0 rounded-full font-bold px-4 py-1.5 text-sm shadow-sm"
                    >
                      {cls.time}
                    </Badge>
                    <ArrowRight className="h-5 w-5 text-[#0066FF] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 group-hover:duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Differentiation Overview */}
        <Card className="border-0 shadow-[0_20px_50px_rgba(0,102,255,0.08)] hover:shadow-[0_20px_50px_rgba(0,102,255,0.12)] rounded-[3rem] bg-white hover:scale-[1.01] transition-transform duration-300">
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="text-xl font-black flex items-center gap-3 text-[#0A1A3F]">
              <div className="p-3 rounded-2xl bg-[#0066FF]/10">
                <Users className="h-5 w-5 text-[#0066FF]" />
              </div>
              Learning Modes
            </CardTitle>
            <CardDescription className="text-base font-medium text-slate-500">How your students prefer to learn</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-6 mt-4">
              {[
                { icon: BookOpen, label: 'Readers', value: mockDifferentiationOverview.readers, color: 'bg-[#0066FF]' },
                { icon: Play, label: 'Players', value: mockDifferentiationOverview.players, color: 'bg-slate-400' },
                { icon: Eye, label: 'Watchers', value: mockDifferentiationOverview.watchers, color: 'bg-slate-500' },
                { icon: Shuffle, label: 'Mixed', value: mockDifferentiationOverview.mixed, color: 'bg-[#0066FF]/80' },
              ].map((item) => (
                <div key={item.label} className="space-y-3">
                  <div className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-4 font-bold text-[#0A1A3F] text-lg">
                      <div className={`p-2.5 rounded-[1.25rem] ${item.color} bg-opacity-10 shadow-sm border border-[#0066FF]/5`}>
                        <item.icon className={`h-5 w-5 ${item.color.replace('bg-', 'text-')}`} />
                      </div>
                      {item.label}
                    </span>
                    <span className="font-black text-xl text-[#0A1A3F]">{item.value}</span>
                  </div>
                  <div className="h-4 rounded-full bg-[#F8FAFC] shadow-inner overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full rounded-full ${item.color} transition-all`}
                      style={{ width: `${(item.value / totalStudents) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inclusion Radar */}
        <Card className="border-0 shadow-[0_20px_50px_rgba(0,102,255,0.08)] hover:shadow-[0_20px_50px_rgba(0,102,255,0.12)] rounded-[3rem] bg-white hover:scale-[1.01] transition-transform duration-300">
          <CardHeader className="pb-4 md:pt-8 md:px-8">
            <CardTitle className="text-xl font-black flex items-center gap-3 text-[#0A1A3F]">
              <div className="p-3 rounded-2xl bg-[#0066FF]/10">
                <Sparkles className="h-5 w-5 text-[#0066FF]" />
              </div>
              Inclusion Radar
            </CardTitle>
            <CardDescription className="text-base font-medium text-slate-500">Bias scan results this week</CardDescription>
          </CardHeader>
          <CardContent className="md:px-8 pb-8">
            <div className="space-y-6 mt-4">
              {/* Summary */}
              <div className="p-6 rounded-[2rem] bg-[#F8FAFC] border border-[#0066FF]/10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-lg font-black text-[#0A1A3F]">Issues Resolved</p>
                  <p className="text-4xl font-black text-[#0066FF] drop-shadow-sm">{resolvedIssues}/{totalIssues}</p>
                </div>
                <Progress value={(resolvedIssues / totalIssues) * 100} className="h-4 bg-white shadow-inner [&>div]:bg-gradient-to-r [&>div]:from-[#0066FF] [&>div]:to-cyan-400" />
              </div>

              {/* Categories */}
              <div className="space-y-4">
                {Object.entries(mockInclusionRadar.byCategory).map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between p-5 rounded-[2rem] bg-[#F8FAFC] shadow-sm hover:scale-[1.02] border border-[#0066FF]/5 transition-transform cursor-default">
                    <span className="capitalize font-bold text-lg text-[#0A1A3F]">
                      {category.replace('socioeconomic', 'socio-economic')}
                    </span>
                    <div className="flex items-center gap-3">
                      {data.flagged > data.resolved ? (
                        <div className="p-2 rounded-xl bg-blue-100/50 border border-blue-200">
                          <AlertTriangle className="h-5 w-5 text-blue-500" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/20">
                          <CheckCircle2 className="h-5 w-5 text-[#0066FF]" />
                        </div>
                      )}
                      <span className="font-black text-xl text-[#0A1A3F]">{data.resolved}/{data.flagged}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-[0_20px_50px_rgba(0,102,255,0.08)] rounded-[3rem] bg-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#0066FF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <CardContent className="p-10 lg:p-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div 
                className="p-4 rounded-[2rem] shadow-[0_10px_30px_rgba(0,102,255,0.3)] shrink-0"
                style={{ background: 'linear-gradient(135deg, #0066FF 0%, #38bdf8 100%)' }}
              >
                <Zap className="h-8 w-8 text-white drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-[#0A1A3F] mb-1">Ready to create your next lesson?</h3>
                <p className="text-lg font-medium text-slate-500">Use AI to generate differentiated content in seconds</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/teacher/lesson-builder">
                <Button 
                  className="gap-2 text-white border-0 rounded-full hover:opacity-90 shadow-blue-500/30 shadow-lg"
                  style={{ backgroundColor: '#0066FF' }}
                >
                  <Brain className="h-4 w-4" />
                  AI Lesson Builder
                </Button>
              </Link>
              <Button variant="outline" className="gap-2 rounded-full border-[#0066FF] text-[#0066FF] hover:bg-[#F8FAFF] hover:text-[#0066FF]">
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
