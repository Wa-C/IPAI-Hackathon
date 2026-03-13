'use client'

import { useAuth } from '@/lib/auth-context'
import { mockLessons, mockStudents } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target,
  Play,
  Star,
  Zap,
  TrendingUp,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboard() {
  const { user } = useAuth()
  
  const studentData = mockStudents.find(s => s.id === 'student-1') || mockStudents[0]
  const activeLessons = mockLessons.filter(l => l.status === 'published').slice(0, 3)
  
  const stats = [
    {
      label: 'Lessons Done',
      value: '12',
      icon: BookOpen,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'Day Streak',
      value: '7',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
    },
    {
      label: 'Total Points',
      value: '2,450',
      icon: Trophy,
      color: 'from-yellow-500 to-amber-500',
    },
    {
      label: 'Avg. Score',
      value: '87%',
      icon: Target,
      color: 'from-emerald-500 to-teal-500',
    },
  ]

  const achievements = [
    { name: 'Quick Learner', description: 'Complete 5 lessons in one day', earned: true, icon: Zap },
    { name: 'Perfect Score', description: 'Get 100% on a quiz', earned: true, icon: Star },
    { name: 'Week Warrior', description: '7-day learning streak', earned: true, icon: Flame },
    { name: 'Math Master', description: 'Complete all math lessons', earned: false, icon: Trophy },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Flame className="h-4 w-4 text-accent" />
            {"You're"} on a 7-day streak! Keep it up!
          </p>
        </div>
        <Link href="/student/lessons">
          <Button 
            className="gap-2 text-white border-0 shadow-lg hover:shadow-xl hover:opacity-90 transition-all rounded-xl"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
          >
            <Play className="h-4 w-4" />
            Continue Learning
          </Button>
        </Link>
      </div>

      {/* Streak Banner */}
      <div 
        className="rounded-2xl p-5 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white">
            <div className="p-3 rounded-xl bg-white/20">
              <Flame className="h-8 w-8" />
            </div>
            <div>
              <p className="text-2xl font-bold">7 Day Streak!</p>
              <p className="text-white/80">Complete 1 more lesson today to keep your streak going</p>
            </div>
          </div>
          <div className="hidden md:flex gap-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div 
                key={day} 
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-medium ${
                  i < 6 ? 'bg-white/30 text-white' : 'bg-white/10 text-white/50'
                }`}
              >
                {i < 6 ? <Star className="h-4 w-4 fill-current" /> : day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-lg card-interactive overflow-hidden">
            <CardContent className="p-5">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Continue Learning</h2>
            <Link href="/student/lessons">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {activeLessons.map((lesson, i) => (
              <Card key={lesson.id} className="border-0 shadow-lg card-interactive overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                      i === 0 ? 'from-purple-500 to-indigo-500' : 
                      i === 1 ? 'from-cyan-500 to-blue-500' : 
                      'from-emerald-500 to-teal-500'
                    } flex items-center justify-center shadow-md flex-shrink-0`}>
                      <BookOpen className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs rounded-full">
                          {lesson.subject}
                        </Badge>
                        <Badge variant="outline" className="text-xs rounded-full">
                          Grade {lesson.gradeLevel}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground text-lg">{lesson.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {lesson.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-4 w-4" />
                          +{lesson.duration * 10} pts
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-foreground">{30 + i * 20}%</span>
                        </div>
                        <Progress value={30 + i * 20} className="h-2" />
                      </div>
                    </div>
                    <Link href={`/student/lessons/${lesson.id}`}>
                      <Button 
                        size="sm" 
                        className="text-white border-0 rounded-xl shadow-md flex-shrink-0 hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Continue
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Daily Goal */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-secondary/80 to-secondary/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-2xl shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                  >
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Daily Learning Goal</h3>
                    <p className="text-sm text-muted-foreground">Complete 2 more lessons to reach your goal!</p>
                  </div>
                </div>
                <div className="text-right">
                  <p 
                    className="text-3xl font-bold"
                    style={{ 
                      background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >1/3</p>
                  <p className="text-xs text-muted-foreground">Lessons today</p>
                </div>
              </div>
              <Progress value={33} className="h-3 mt-4 rounded-full" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Learning Preferences */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                Your Learning Style
              </CardTitle>
              <CardDescription>Personalized just for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Pace', value: studentData?.preferences?.pace || 'Standard' },
                { label: 'Content', value: studentData?.preferences?.visualAids ? 'Visual' : 'Text' },
                { label: 'Challenge', value: studentData?.preferences?.extraChallenges ? 'Extra' : 'Normal' },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <span className="text-sm text-muted-foreground">{pref.label}</span>
                  <Badge variant="secondary" className="rounded-full">{pref.value}</Badge>
                </div>
              ))}
              <Link href="/student/preferences">
                <Button variant="outline" size="sm" className="w-full mt-2 rounded-xl">
                  Update Preferences
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-accent/10">
                    <Trophy className="h-4 w-4 text-accent" />
                  </div>
                  Achievements
                </CardTitle>
                <Link href="/student/achievements">
                  <Button variant="ghost" size="sm" className="text-xs h-7">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    achievement.earned 
                      ? 'bg-gradient-to-r from-accent/10 to-transparent border border-accent/20' 
                      : 'bg-muted/30 opacity-50'
                  }`}
                >
                  <div 
                    className={`p-2 rounded-xl ${achievement.earned ? 'shadow-md' : 'bg-muted'}`}
                    style={achievement.earned ? { background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' } : {}}
                  >
                    <achievement.icon className={`h-4 w-4 ${achievement.earned ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                  </div>
                  {achievement.earned && (
                    <Star className="h-5 w-5 text-accent fill-accent flex-shrink-0" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-xl bg-success/10">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-24">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const heights = [60, 80, 45, 90, 70, 30, 50]
                  const isToday = i === 6
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className={`w-full rounded-xl transition-all ${isToday ? 'shadow-md' : ''}`}
                        style={{ 
                          height: `${heights[i]}%`,
                          background: isToday 
                            ? 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' 
                            : 'rgba(124, 58, 237, 0.6)'
                        }}
                      />
                      <span className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                        {day}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
