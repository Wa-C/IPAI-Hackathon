'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  BookOpen, 
  Award, 
  Flame,
  Calendar,
  BarChart3,
  Trophy,
  Star
} from 'lucide-react'

const weeklyProgress = [
  { day: 'Mon', lessons: 3, minutes: 45 },
  { day: 'Tue', lessons: 2, minutes: 30 },
  { day: 'Wed', lessons: 4, minutes: 60 },
  { day: 'Thu', lessons: 1, minutes: 15 },
  { day: 'Fri', lessons: 3, minutes: 45 },
  { day: 'Sat', lessons: 0, minutes: 0 },
  { day: 'Sun', lessons: 2, minutes: 25 },
]

const subjectProgress = [
  { subject: 'English', progress: 78, lessons: 12, color: '#0066FF' },
  { subject: 'Mathematics', progress: 65, lessons: 8, color: '#22d3ee' },
  { subject: 'Science', progress: 82, lessons: 10, color: '#22c55e' },
  { subject: 'History', progress: 45, lessons: 5, color: '#f97316' },
]

const recentAchievements = [
  { id: 1, name: 'First Quiz Ace', description: 'Score 100% on your first quiz', icon: Star, date: 'Today', xp: 100 },
  { id: 2, name: 'Week Warrior', description: 'Complete lessons 5 days in a row', icon: Flame, date: '2 days ago', xp: 150 },
  { id: 3, name: 'Subject Master', description: 'Complete all lessons in a subject', icon: Trophy, date: '1 week ago', xp: 200 },
]

export default function StudentProgress() {
  const totalMinutes = weeklyProgress.reduce((acc, day) => acc + day.minutes, 0)
  const totalLessons = weeklyProgress.reduce((acc, day) => acc + day.lessons, 0)
  const maxMinutes = Math.max(...weeklyProgress.map(d => d.minutes), 1)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Progress</h1>
        <p className="text-muted-foreground">Track your learning journey and achievements</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Weekly Minutes', value: `${totalMinutes}`, icon: Clock, change: '+12%', color: '#0A1A3F' },
          { label: 'Lessons Completed', value: `${totalLessons}`, icon: BookOpen, change: '+5', color: '#3b82f6' },
          { label: 'Current Streak', value: '7 days', icon: Flame, change: 'Best: 14', color: '#0066FF' },
          { label: 'Total XP', value: '2,450', icon: Award, change: 'Level 8', color: '#22c55e' },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-[0_20px_50px_rgba(0,102,255,0.08)] rounded-[3rem] bg-white hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        {/* Weekly Activity Chart */}
        <Card className="border-0 shadow-[0_20px_50px_rgba(0,102,255,0.08)] rounded-[3rem] bg-white hover:scale-[1.01] transition-transform duration-300">
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              This Week
            </CardTitle>
            <CardDescription>Your daily learning activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {weeklyProgress.map((day, i) => {
                const isToday = i === 4 // Friday
                const height = day.minutes > 0 ? (day.minutes / maxMinutes) * 100 : 5
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full h-32 flex items-end justify-center">
                      <div 
                        className={`w-full max-w-8 rounded-t-lg transition-all ${isToday ? 'shadow-md' : ''}`}
                        style={{ 
                          height: `${height}%`,
                          minHeight: '8px',
                          background: isToday 
                            ? 'linear-gradient(135deg, #0066FF 0%, #22d3ee 100%)' 
                            : day.minutes > 0 ? 'rgba(0, 102, 255, 0.4)' : 'rgba(0, 102, 255, 0.1)'
                        }}
                      />
                    </div>
                    <span className={`text-xs ${isToday ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {day.day}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total: {totalMinutes} minutes</span>
              <Badge 
                className="border-0"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                12% vs last week
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Subject Progress */}
        <Card className="border-0 shadow-[0_20px_50px_rgba(0,102,255,0.08)] rounded-[3rem] bg-white hover:scale-[1.01] transition-transform duration-300">
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Subject Progress
            </CardTitle>
            <CardDescription>Your progress across all subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {subjectProgress.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="font-medium text-foreground">{subject.subject}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${subject.progress}%`,
                      backgroundColor: subject.color
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{subject.lessons} lessons completed</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card className="border-0 shadow-[0_20px_50px_rgba(0,102,255,0.08)] rounded-[3rem] bg-white lg:col-span-2">
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Recent Achievements
            </CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
            <div className="grid gap-4 md:grid-cols-3 px-8 pb-8">
              {recentAchievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="p-5 rounded-[2.5rem] bg-white border border-blue-50 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-[#0066FF]/10 shrink-0 group-hover:scale-110 transition-transform">
                      <achievement.icon className="h-6 w-6 text-[#0066FF]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#0A1A3F] text-base leading-tight">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1.5">{achievement.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground font-medium">{achievement.date}</span>
                        <Badge className="text-sm font-bold border-0 bg-[#0066FF]/10 text-[#0066FF] px-3 py-1 shadow-sm">
                          +{achievement.xp} XP
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </Card>

        {/* Goals */}
        <Card className="border-0 shadow-[0_20px_50px_rgba(0,102,255,0.08)] rounded-[3rem] bg-white lg:col-span-2">
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Weekly Goals
            </CardTitle>
            <CardDescription>Track your progress towards your goals</CardDescription>
          </CardHeader>
            <div className="grid gap-4 md:grid-cols-3 px-8 pb-8">
              {[
                { label: 'Complete 15 lessons', current: 12, target: 15, unit: 'lessons' },
                { label: 'Study for 3 hours', current: 145, target: 180, unit: 'minutes' },
                { label: 'Earn 500 XP', current: 420, target: 500, unit: 'XP' },
              ].map((goal) => {
                const percent = Math.min((goal.current / goal.target) * 100, 100)
                return (
                  <div key={goal.label} className="p-5 rounded-[2.5rem] bg-white border border-blue-50 shadow-sm hover:shadow-md transition-all group">
                    <p className="font-bold text-[#0A1A3F] text-base mb-3 group-hover:text-[#0066FF] transition-colors">{goal.label}</p>
                    <Progress value={percent} className="h-2.5 bg-[#0066FF]/10 shadow-inner [&>div]:bg-gradient-to-r [&>div]:from-[#0066FF] [&>div]:to-cyan-400" />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-slate-500 font-medium">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                      <span className="text-sm font-bold text-[#0A1A3F]">{Math.round(percent)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
        </Card>
      </div>
    </div>
  )
}
