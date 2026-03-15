'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { ChatExercise } from './chat-exercise'
import { ChatBadges } from './chat-badges'
import { ChatKnowledge } from './chat-knowledge'
import { ChatTasks } from './chat-tasks'
import {
  sendChatMessage,
  getChatHistory,
  generateExercise,
  evaluateAnswer,
  getKnowledge,
  type ChatMessage,
  type Exercise,
  type EvaluateResponse,
  type KnowledgeEntry,
  type TaskItem,
} from '@/lib/chat-api'
import { MessageCircle, X, Brain, Sparkles, BookOpen, Minimize2, Maximize2 } from 'lucide-react'

interface ChatWidgetProps {
  studentId: string
  lessonId: string
  defaultOpen?: boolean
}

type PanelSize = 'normal' | 'large'

export function ChatWidget({ studentId, lessonId, defaultOpen = false }: ChatWidgetProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [panelSize, setPanelSize] = useState<PanelSize>('normal')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [phase, setPhase] = useState('warmup')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Exercise state
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [exerciseResult, setExerciseResult] = useState<EvaluateResponse | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  // Badge & knowledge state
  const [newBadges, setNewBadges] = useState<Array<{ type: string; title: string; description: string }>>([])
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([])
  const [showKnowledge, setShowKnowledge] = useState(false)

  // Task state
  const [tasks, setTasks] = useState<TaskItem[]>([])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading, exercise])

  // Load history on first open
  const initChat = useCallback(async () => {
    if (isInitialized) return
    try {
      const history = await getChatHistory(studentId, lessonId)
      if (history.messages.length > 0) {
        setMessages(history.messages)
        setSessionId(history.session_id)
        setPhase(history.phase || 'chat')
        if (history.tasks && history.tasks.length > 0) setTasks(history.tasks)
      } else {
        setIsLoading(true)
        const res = await sendChatMessage(studentId, lessonId, 'Hello!')
        setMessages([
          { role: 'user', content: 'Hello!' },
          { role: 'assistant', content: res.response },
        ])
        setSessionId(res.session_id)
        setPhase(res.phase)
        if (res.badges) setNewBadges(res.badges)
        if (res.tasks && res.tasks.length > 0) setTasks(res.tasks)
      }
      setIsInitialized(true)
    } catch (err) {
      console.error('Chat init error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [studentId, lessonId, isInitialized])

  useEffect(() => {
    if (open && !isInitialized) initChat()
  }, [open, initChat, isInitialized])

  useEffect(() => {
    if (open && showKnowledge) {
      getKnowledge(studentId).then(setKnowledge).catch(() => {})
    }
  }, [open, showKnowledge, studentId])

  const handleSend = async (message: string) => {
    if (exerciseResult) {
      setExercise(null)
      setExerciseResult(null)
    }
    setMessages((prev) => [...prev, { role: 'user', content: message }])
    setIsLoading(true)
    try {
      const res = await sendChatMessage(studentId, lessonId, message, sessionId)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.response }])
      setSessionId(res.session_id)
      setPhase(res.phase)
      if (res.badges) setNewBadges(res.badges)
      if (res.tasks && res.tasks.length > 0) setTasks(res.tasks)
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestExercise = async () => {
    if (!sessionId) return
    setIsLoading(true)
    try {
      const ex = await generateExercise(studentId, lessonId, sessionId)
      setExercise(ex)
      setExerciseResult(null)
    } catch (err) {
      console.error('Exercise generation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExerciseSubmit = async (answer: string) => {
    if (!exercise || !sessionId) return
    setIsEvaluating(true)
    try {
      const result = await evaluateAnswer(studentId, lessonId, sessionId, answer, exercise)
      setExerciseResult(result)
    } catch (err) {
      console.error('Evaluation error:', err)
    } finally {
      setIsEvaluating(false)
    }
  }

  const sizeClasses = {
    normal: 'w-[400px] h-[600px]',
    large: 'w-[480px] h-[calc(100vh-3rem)]',
  }

  // Collapsed — floating button
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full shadow-xl pl-4 pr-5 py-3 text-white transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)' }}
        aria-label="Open chat"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">COPA Tutor</span>
      </button>
    )
  }

  // Expanded — chat panel
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${sizeClasses[panelSize]} rounded-2xl shadow-2xl border bg-background flex flex-col overflow-hidden transition-all duration-200`}>

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 text-white shrink-0"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">COPA Tutor</p>
            <p className="text-[10px] opacity-70 capitalize">{phase}</p>
          </div>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/15"
            onClick={() => { setShowKnowledge(!showKnowledge) }}
            title="Mastery progress"
          >
            <Brain className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/15"
            onClick={handleRequestExercise}
            disabled={isLoading || !sessionId}
            title="Request exercise"
          >
            <BookOpen className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/15"
            onClick={() => setPanelSize(panelSize === 'normal' ? 'large' : 'normal')}
            title={panelSize === 'normal' ? 'Expand' : 'Shrink'}
          >
            {panelSize === 'normal' ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/15"
            onClick={() => setOpen(false)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Badge notifications (overlay) ── */}
      <ChatBadges badges={newBadges} />

      {/* ── Task progress strip ── */}
      {tasks.length > 0 && <ChatTasks tasks={tasks} />}

      {/* ── Knowledge panel (collapsible) ── */}
      {showKnowledge && (
        <div className="border-b shrink-0 max-h-40 overflow-y-auto">
          <ChatKnowledge entries={knowledge} />
        </div>
      )}

      {/* ── Messages area (scrollable, takes remaining space) ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        <ChatMessages messages={messages} isLoading={isLoading} />

        {/* Exercise inline in message flow */}
        {exercise && (
          <ChatExercise
            exercise={exercise}
            onSubmit={handleExerciseSubmit}
            result={exerciseResult}
            isEvaluating={isEvaluating}
          />
        )}
      </div>

      {/* ── Input bar ── */}
      <ChatInput
        onSend={handleSend}
        disabled={isLoading}
        placeholder={phase === 'warmup' ? 'Say hello...' : 'Ask about the lesson...'}
      />
    </div>
  )
}
