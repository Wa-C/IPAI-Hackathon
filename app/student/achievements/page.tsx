'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  Star,
  Zap,
  Target,
  BookOpen,
  Clock,
  Award,
  Flame,
  Brain,
  Users
} from 'lucide-react'

const achievements = [
  {
    id: '1',
    name: 'Quick Learner',
    description: 'Complete 5 lessons in one day',
    icon: Zap,
    category: 'Speed',
    earned: true,
    earnedDate: '2024-01-15',
    points: 100,
  },
  {
    id: '2',
    name: 'Perfect Score',
    description: 'Get 100% on any quiz',
    icon: Target,
    category: 'Accuracy',
    earned: true,
    earnedDate: '2024-01-18',
    points: 150,
  },
  {
    id: '3',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: Flame,
    category: 'Consistency',
    earned: true,
    earnedDate: '2024-01-20',
    points: 200,
  },
  {
    id: '4',
    name: 'Math Master',
    description: 'Complete all available math lessons',
    icon: Brain,
    category: 'Mastery',
    earned: false,
    progress: 60,
    points: 300,
  },
  {
    id: '5',
    name: 'Early Bird',
    description: 'Complete a lesson before 8 AM',
    icon: Clock,
    category: 'Time',
    earned: false,
    progress: 0,
    points: 75,
  },
  {
    id: '6',
    name: 'Bookworm',
    description: 'Complete 25 lessons total',
    icon: BookOpen,
    category: 'Volume',
    earned: false,
    progress: 48,
    points: 250,
  },
  {
    id: '7',
    name: 'Team Player',
    description: 'Help 3 classmates with their lessons',
    icon: Users,
    category: 'Social',
    earned: false,
    progress: 33,
    points: 175,
  },
  {
    id: '8',
    name: 'Challenger',
    description: 'Complete 10 extra challenge problems',
    icon: Award,
    category: 'Challenge',
    earned: false,
    progress: 70,
    points: 225,
  },
]

const categories = ['All', 'Speed', 'Accuracy', 'Consistency', 'Mastery', 'Volume', 'Social', 'Challenge', 'Time']

export default function StudentAchievements() {
  const earnedAchievements = achievements.filter(a => a.earned)
  const inProgressAchievements = achievements.filter(a => !a.earned)
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0)
  const possiblePoints = achievements.reduce((sum, a) => sum + a.points, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Achievements</h1>
        <p className="text-muted-foreground">Track your progress and earn rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-accent/10">
                <Trophy className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{earnedAchievements.length}</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{inProgressAchievements.length}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-success/10">
                <Star className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{totalPoints}</p>
                <p className="text-xs text-muted-foreground">Points Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-warning/10">
                <Award className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{Math.round((earnedAchievements.length / achievements.length) * 100)}%</p>
                <p className="text-xs text-muted-foreground">Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earned Achievements */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Earned Achievements
          </CardTitle>
          <CardDescription>
            Achievements you have unlocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-lg bg-accent/5 border border-accent/20"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent text-accent-foreground">
                    <achievement.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">{achievement.name}</h3>
                      <Star className="h-4 w-4 text-accent fill-accent flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{achievement.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{achievement.category}</Badge>
                      <span className="text-xs text-muted-foreground">+{achievement.points} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* In Progress Achievements */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            In Progress
          </CardTitle>
          <CardDescription>
            Keep going to unlock these achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-lg bg-muted/30 border border-border"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    <achievement.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{achievement.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{achievement.category}</Badge>
                      <span className="text-xs text-muted-foreground">+{achievement.points} pts</span>
                    </div>
                    {achievement.progress !== undefined && achievement.progress > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-foreground">{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
