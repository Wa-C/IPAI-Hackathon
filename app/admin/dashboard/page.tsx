'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  Shield,
  Activity,
  Network,
  Cpu,
  Globe,
  ArrowUpRight,
  Layers,
  BookOpen,
  Brain,
} from 'lucide-react'
import Link from 'next/link'

const platformStats = [
  {
    label: 'Global Models',
    value: '12',
    change: '+2 this quarter',
    icon: Globe,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  {
    label: 'Schools Connected',
    value: '3',
    change: 'Active FL participants',
    icon: Network,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
  {
    label: 'FL Rounds Completed',
    value: '847',
    change: '+23 this week',
    icon: Layers,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    label: 'Avg Model Accuracy',
    value: '94.2%',
    change: '+1.3% improvement',
    icon: TrendingUp,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
]

const topModels = [
  { name: 'RecSys-FL v3.2', type: 'Learning Recommendation', accuracy: 96.1, school: 'Global', status: 'active' },
  { name: 'TinyLlama-FL v2.1', type: 'GenAI Fine-tuned', accuracy: 93.8, school: 'Global', status: 'active' },
  { name: 'DistilGPT-FL v1.8', type: 'GenAI Fine-tuned', accuracy: 91.5, school: 'Global', status: 'active' },
]

const recentFLActivity = [
  { action: 'FL round #847 completed', detail: 'RecSys-FL v3.2 aggregated from 3 schools', time: '12 min ago' },
  { action: 'Model checkpoint saved', detail: 'TinyLlama-FL v2.1 - epoch 45', time: '1 hour ago' },
  { action: 'New school joined FL', detail: 'Realschule Stuttgart connected', time: '3 hours ago' },
  { action: 'Performance alert', detail: 'DistilGPT-FL v1.8 accuracy improved +0.8%', time: '5 hours ago' },
  { action: 'Privacy audit passed', detail: 'All schools GDPR compliant - Q1 2026', time: '1 day ago' },
]

export default function AdminDashboard() {
  useAuth()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6, #06b6d4)' }}
          >
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Federated Learning Platform
            </h1>
            <p className="text-sm text-muted-foreground">
              Admin overview - Privacy-preserving AI model management
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {platformStats.map((stat) => (
          <Card key={stat.label} className="border-border/50 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Platform Types */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-border/50 overflow-hidden">
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #8b5cf6, #a855f7, #d946ef)' }} />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <BookOpen className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Learning Recommendation System</CardTitle>
                  <CardDescription>Federated collaborative filtering on learning datasets</CardDescription>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">6</p>
                <p className="text-[10px] text-muted-foreground">Models</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">96.1%</p>
                <p className="text-[10px] text-muted-foreground">Top Accuracy</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">523</p>
                <p className="text-[10px] text-muted-foreground">FL Rounds</p>
              </div>
            </div>
            <Link href="/admin/models">
              <Button variant="outline" size="sm" className="w-full mt-2">
                View Models <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50 overflow-hidden">
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #6366f1)' }} />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Cpu className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Federated Fine-tuned GenAI</CardTitle>
                  <CardDescription>DistilGPT, TinyLlama fine-tuned via federated learning</CardDescription>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">6</p>
                <p className="text-[10px] text-muted-foreground">Models</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">93.8%</p>
                <p className="text-[10px] text-muted-foreground">Top Accuracy</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">324</p>
                <p className="text-[10px] text-muted-foreground">FL Rounds</p>
              </div>
            </div>
            <Link href="/admin/models">
              <Button variant="outline" size="sm" className="w-full mt-2">
                View Models <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Performing Models */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Top Performing Models
                </CardTitle>
                <CardDescription>Ranked by accuracy across all federated rounds</CardDescription>
              </div>
              <Link href="/admin/performance">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topModels.map((model, i) => (
              <div key={model.name} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                  i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : 'bg-orange-400'
                }`}>
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{model.name}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      {model.type === 'GenAI Fine-tuned' ? 'GenAI' : 'RecSys'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{model.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{model.accuracy}%</p>
                  <p className="text-[10px] text-muted-foreground">accuracy</p>
                </div>
                <div className="w-24 hidden sm:block">
                  <Progress value={model.accuracy} className="h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* FL Activity Feed */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-500" />
              FL Activity
            </CardTitle>
            <CardDescription>Recent federated learning events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentFLActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="h-2 w-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{activity.action}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{activity.detail}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{activity.time}</p>
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
            <Link href="/admin/models">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Globe className="h-5 w-5" />
                <span className="text-sm">Global Models</span>
              </Button>
            </Link>
            <Link href="/admin/school-models">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Network className="h-5 w-5" />
                <span className="text-sm">School Models</span>
              </Button>
            </Link>
            <Link href="/admin/performance">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Cpu className="h-5 w-5" />
                <span className="text-sm">Performance</span>
              </Button>
            </Link>
            <Link href="/admin/settings/privacy">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Privacy & GDPR</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
