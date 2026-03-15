'use client'

import { Progress } from '@/components/ui/progress'
import type { KnowledgeEntry } from '@/lib/chat-api'
import { Brain } from 'lucide-react'

interface ChatKnowledgeProps {
  entries: KnowledgeEntry[]
}

export function ChatKnowledge({ entries }: ChatKnowledgeProps) {
  if (entries.length === 0) {
    return (
      <div className="px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">No mastery data yet. Keep chatting!</p>
      </div>
    )
  }

  const sorted = [...entries].sort((a, b) => b.mastery - a.mastery)

  return (
    <div className="px-4 py-3 space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Brain className="h-3.5 w-3.5 text-primary" />
        Mastery Progress
      </div>
      <div className="space-y-2">
        {sorted.slice(0, 6).map((entry) => (
          <div key={entry.concept} className="space-y-0.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground truncate max-w-[70%]">{entry.concept}</span>
              <span className="text-foreground font-medium">{Math.round(entry.mastery * 100)}%</span>
            </div>
            <Progress value={entry.mastery * 100} className="h-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
