'use client'

import { useState } from 'react'
import type { TaskItem } from '@/lib/chat-api'
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'

interface ChatTasksProps {
  tasks: TaskItem[]
}

export function ChatTasks({ tasks }: ChatTasksProps) {
  const [expanded, setExpanded] = useState(false)

  if (tasks.length === 0) return null

  const doneCount = tasks.filter((t) => t.done).length
  const allDone = doneCount === tasks.length

  return (
    <div className="border-b bg-muted/30 shrink-0">
      {/* Compact header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {tasks.map((t, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  t.done ? 'bg-emerald-500' : 'bg-muted-foreground/25'
                }`}
              />
            ))}
          </div>
          <span className={`font-medium ${allDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
            {allDone ? 'All goals complete!' : `${doneCount}/${tasks.length} goals`}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Expanded task list */}
      {expanded && (
        <div className="px-3 pb-2 space-y-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                task.done
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-muted-foreground'
              }`}
            >
              {task.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
              )}
              <span className={task.done ? 'line-through opacity-60' : ''}>
                {task.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
