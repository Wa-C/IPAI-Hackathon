'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'

interface BadgeNotification {
  type: string
  title: string
  description: string
}

interface ChatBadgesProps {
  badges: BadgeNotification[]
}

export function ChatBadges({ badges }: ChatBadgesProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (badges.length === 0) return
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(timer)
  }, [badges])

  if (!visible || badges.length === 0) return null

  return (
    <div className="absolute top-12 left-3 right-3 z-10 space-y-2">
      {badges.map((badge) => (
        <div
          key={badge.type}
          className="flex items-center gap-3 rounded-xl border bg-amber-500/10 border-amber-500/30 p-3 shadow-lg animate-in slide-in-from-top-2 duration-300"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{badge.title}</p>
            <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
