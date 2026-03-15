'use client'

import type { ChatMessage } from '@/lib/chat-api'
import { Bot, User } from 'lucide-react'

interface ChatMessagesProps {
  messages: ChatMessage[]
  isLoading?: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="flex flex-col gap-2.5 px-3 py-3">
      {messages.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-3">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Start a conversation with your tutor</p>
        </div>
      )}

      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <div
            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gradient-to-br from-violet-500 to-blue-500 text-white'
            }`}
          >
            {msg.role === 'user' ? (
              <User className="h-3 w-3" />
            ) : (
              <Bot className="h-3 w-3" />
            )}
          </div>
          <div
            className={`max-w-[82%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-muted text-foreground rounded-tl-sm'
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-2">
          <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-blue-500 text-white mt-0.5">
            <Bot className="h-3 w-3" />
          </div>
          <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
