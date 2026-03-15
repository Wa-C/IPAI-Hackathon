'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Cpu,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Zap,
  Clock,
  BarChart3,
  Minus,
  BookOpen,
  Shield,
  Layers,
} from 'lucide-react'

interface ModelPerformance {
  rank: number
  name: string
  version: string
  type: 'recommendation' | 'genai'
  accuracy: number
  f1Score: number
  precision: number
  recall: number
  latency: number // ms
  flRounds: number
  trend: 'up' | 'down' | 'stable'
  trendDelta: number
  schoolsUsing: number
  totalPredictions: number
  privacyBudgetUsed: number // epsilon value for differential privacy
  lastEvaluation: string
}

const modelPerformances: ModelPerformance[] = [
  {
    rank: 1,
    name: 'RecSys-FL',
    version: 'v3.2',
    type: 'recommendation',
    accuracy: 96.1,
    f1Score: 0.95,
    precision: 0.96,
    recall: 0.94,
    latency: 12,
    flRounds: 523,
    trend: 'up',
    trendDelta: 1.6,
    schoolsUsing: 3,
    totalPredictions: 1245000,
    privacyBudgetUsed: 2.3,
    lastEvaluation: '2 hours ago',
  },
  {
    rank: 2,
    name: 'RecSys-FL',
    version: 'v3.0',
    type: 'recommendation',
    accuracy: 94.5,
    f1Score: 0.93,
    precision: 0.94,
    recall: 0.92,
    latency: 14,
    flRounds: 490,
    trend: 'stable',
    trendDelta: 0.2,
    schoolsUsing: 2,
    totalPredictions: 980000,
    privacyBudgetUsed: 2.1,
    lastEvaluation: '1 day ago',
  },
  {
    rank: 3,
    name: 'TinyLlama-FL',
    version: 'v2.1',
    type: 'genai',
    accuracy: 93.8,
    f1Score: 0.92,
    precision: 0.93,
    recall: 0.91,
    latency: 245,
    flRounds: 324,
    trend: 'up',
    trendDelta: 3.9,
    schoolsUsing: 3,
    totalPredictions: 567000,
    privacyBudgetUsed: 3.1,
    lastEvaluation: '4 hours ago',
  },
  {
    rank: 4,
    name: 'RecSys-FL',
    version: 'v2.5',
    type: 'recommendation',
    accuracy: 91.8,
    f1Score: 0.90,
    precision: 0.91,
    recall: 0.89,
    latency: 16,
    flRounds: 430,
    trend: 'down',
    trendDelta: -0.5,
    schoolsUsing: 1,
    totalPredictions: 620000,
    privacyBudgetUsed: 1.8,
    lastEvaluation: '3 days ago',
  },
  {
    rank: 5,
    name: 'DistilGPT-FL',
    version: 'v1.8',
    type: 'genai',
    accuracy: 91.5,
    f1Score: 0.89,
    precision: 0.90,
    recall: 0.88,
    latency: 180,
    flRounds: 245,
    trend: 'up',
    trendDelta: 2.1,
    schoolsUsing: 3,
    totalPredictions: 412000,
    privacyBudgetUsed: 2.8,
    lastEvaluation: '6 hours ago',
  },
  {
    rank: 6,
    name: 'TinyLlama-FL',
    version: 'v1.5',
    type: 'genai',
    accuracy: 89.9,
    f1Score: 0.87,
    precision: 0.88,
    recall: 0.86,
    latency: 260,
    flRounds: 180,
    trend: 'stable',
    trendDelta: 0.1,
    schoolsUsing: 2,
    totalPredictions: 298000,
    privacyBudgetUsed: 2.5,
    lastEvaluation: '2 days ago',
  },
  {
    rank: 7,
    name: 'RecSys-FL',
    version: 'v2.0',
    type: 'recommendation',
    accuracy: 88.2,
    f1Score: 0.86,
    precision: 0.87,
    recall: 0.85,
    latency: 18,
    flRounds: 340,
    trend: 'down',
    trendDelta: -1.2,
    schoolsUsing: 0,
    totalPredictions: 450000,
    privacyBudgetUsed: 1.5,
    lastEvaluation: '1 week ago',
  },
  {
    rank: 8,
    name: 'DistilGPT-FL',
    version: 'v1.4',
    type: 'genai',
    accuracy: 82.1,
    f1Score: 0.79,
    precision: 0.80,
    recall: 0.78,
    latency: 195,
    flRounds: 150,
    trend: 'down',
    trendDelta: -2.0,
    schoolsUsing: 0,
    totalPredictions: 215000,
    privacyBudgetUsed: 2.2,
    lastEvaluation: '2 weeks ago',
  },
]

const overviewMetrics = [
  {
    label: 'Best Accuracy',
    value: '96.1%',
    detail: 'RecSys-FL v3.2',
    icon: Trophy,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    label: 'Avg F1 Score',
    value: '0.90',
    detail: 'Across 8 active models',
    icon: Target,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  {
    label: 'Fastest Inference',
    value: '12ms',
    detail: 'RecSys-FL v3.2',
    icon: Zap,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
  {
    label: 'Privacy Budget',
    value: 'e=2.3',
    detail: 'Best privacy-accuracy tradeoff',
    icon: Shield,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
]

export default function ModelPerformancePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-orange-500" />
          Model Performance Rankings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Models ranked by accuracy - top performers are used across the most schools
        </p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewMetrics.map((metric) => (
          <Card key={metric.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Leaderboard */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Performance Leaderboard
          </CardTitle>
          <CardDescription>
            Models ranked by accuracy - higher accuracy means better learning recommendations or content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {modelPerformances.map((model) => {
              const TrendIcon = model.trend === 'up' ? TrendingUp : model.trend === 'down' ? TrendingDown : Minus
              const trendColor = model.trend === 'up' ? 'text-emerald-500' : model.trend === 'down' ? 'text-red-500' : 'text-slate-400'
              const rankBg = model.rank === 1 ? 'bg-amber-500' : model.rank === 2 ? 'bg-slate-400' : model.rank === 3 ? 'bg-orange-400' : 'bg-muted'
              const rankText = model.rank <= 3 ? 'text-white' : 'text-foreground'

              return (
                <div
                  key={`${model.name}-${model.version}`}
                  className={`p-4 rounded-xl transition-all hover:shadow-md ${
                    model.rank <= 3 ? 'bg-muted/40 border border-border/50' : 'bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${rankBg} ${rankText} shrink-0`}>
                      #{model.rank}
                    </div>

                    {/* Model Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground">{model.name} {model.version}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                          {model.type === 'genai' ? (
                            <><Cpu className="h-2.5 w-2.5 mr-0.5" /> GenAI</>
                          ) : (
                            <><BookOpen className="h-2.5 w-2.5 mr-0.5" /> RecSys</>
                          )}
                        </Badge>
                        {model.schoolsUsing > 0 && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] px-1.5 py-0 h-4">
                            {model.schoolsUsing} school{model.schoolsUsing > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {model.schoolsUsing === 0 && (
                          <Badge className="bg-slate-500/10 text-slate-500 border-0 text-[10px] px-1.5 py-0 h-4">
                            deprecated
                          </Badge>
                        )}
                      </div>

                      {/* Metrics Row */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">Accuracy</span>
                          <span className="text-xs font-bold text-foreground">{model.accuracy}%</span>
                          <span className={`text-[10px] flex items-center ${trendColor}`}>
                            <TrendIcon className="h-3 w-3" />
                            {model.trendDelta > 0 ? '+' : ''}{model.trendDelta}%
                          </span>
                        </div>
                        <span className="text-border">|</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">F1</span>
                          <span className="text-xs font-bold text-foreground">{model.f1Score}</span>
                        </div>
                        <span className="text-border">|</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">Precision</span>
                          <span className="text-xs font-bold text-foreground">{model.precision}</span>
                        </div>
                        <span className="text-border">|</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">Recall</span>
                          <span className="text-xs font-bold text-foreground">{model.recall}</span>
                        </div>
                        <span className="text-border">|</span>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-foreground">{model.latency}ms</span>
                        </div>
                        <span className="text-border">|</span>
                        <div className="flex items-center gap-1">
                          <Layers className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-foreground">{model.flRounds} rounds</span>
                        </div>
                      </div>
                    </div>

                    {/* Accuracy Bar */}
                    <div className="w-32 hidden md:block">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Accuracy</span>
                        <span className="font-bold text-foreground">{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                    </div>
                  </div>

                  {/* Extra details row */}
                  <div className="flex items-center gap-4 mt-2 ml-13 pl-13 text-[10px] text-muted-foreground" style={{ marginLeft: '52px' }}>
                    <span>{model.totalPredictions.toLocaleString()} total predictions</span>
                    <span>|</span>
                    <span className="flex items-center gap-0.5">
                      <Shield className="h-2.5 w-2.5" />
                      Privacy budget: epsilon={model.privacyBudgetUsed}
                    </span>
                    <span>|</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      Evaluated {model.lastEvaluation}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Why Rankings Matter */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-violet-500/10 shrink-0">
              <TrendingUp className="h-6 w-6 text-violet-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">Why do top models rank higher?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Models are ranked primarily by <strong className="text-foreground">accuracy</strong> - the percentage of correct predictions
                or high-quality generations. Top-ranked models have been through more federated learning rounds,
                benefiting from diverse training signals across multiple schools while maintaining strict
                differential privacy (low epsilon values). Higher-ranked models are automatically deployed
                to more schools, creating a virtuous cycle of better data diversity and improved performance.
                The ranking also considers <strong className="text-foreground">F1 score</strong> (balance of precision and recall),
                <strong className="text-foreground"> inference latency</strong>, and <strong className="text-foreground">privacy budget efficiency</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
