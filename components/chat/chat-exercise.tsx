'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Exercise, EvaluateResponse } from '@/lib/chat-api'
import { CheckCircle2, XCircle, AlertCircle, Lightbulb } from 'lucide-react'

interface ChatExerciseProps {
  exercise: Exercise
  onSubmit: (answer: string) => void
  result: EvaluateResponse | null
  isEvaluating?: boolean
}

export function ChatExercise({ exercise, onSubmit, result, isEvaluating }: ChatExerciseProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [openAnswer, setOpenAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)

  const handleSubmit = () => {
    if (exercise.type === 'quiz') {
      if (selectedOption) onSubmit(selectedOption)
    } else {
      if (openAnswer.trim()) onSubmit(openAnswer.trim())
    }
  }

  const gradeIcon = {
    correct: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    partial: <AlertCircle className="h-5 w-5 text-amber-500" />,
    wrong: <XCircle className="h-5 w-5 text-red-500" />,
  }

  const gradeBg = {
    correct: 'bg-emerald-500/10 border-emerald-500/20',
    partial: 'bg-amber-500/10 border-amber-500/20',
    wrong: 'bg-red-500/10 border-red-500/20',
  }

  return (
    <div className="mx-3 my-2 rounded-xl border bg-card p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {exercise.type === 'quiz' ? 'Quiz' : exercise.type === 'game' ? 'Challenge' : 'Question'}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {exercise.concept}
        </Badge>
      </div>

      <p className="text-sm font-medium">{exercise.question}</p>

      {/* Quiz options */}
      {exercise.type === 'quiz' && exercise.options && !result && (
        <div className="space-y-2">
          {exercise.options.map((option, i) => (
            <button
              key={i}
              onClick={() => setSelectedOption(option.charAt(0))}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                selectedOption === option.charAt(0)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/30 hover:bg-muted/50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Open answer */}
      {exercise.type !== 'quiz' && !result && (
        <textarea
          value={openAnswer}
          onChange={(e) => setOpenAnswer(e.target.value)}
          placeholder="Type your answer..."
          rows={3}
          className="w-full resize-none rounded-lg border bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      )}

      {/* Hint */}
      {!result && exercise.hints && exercise.hints.length > 0 && (
        <div>
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Lightbulb className="h-3 w-3" /> Need a hint?
            </button>
          ) : (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1.5">
              {exercise.hints[0]}
            </p>
          )}
        </div>
      )}

      {/* Submit button */}
      {!result && (
        <Button
          size="sm"
          className="w-full rounded-lg"
          onClick={handleSubmit}
          disabled={
            isEvaluating ||
            (exercise.type === 'quiz' ? !selectedOption : !openAnswer.trim())
          }
        >
          {isEvaluating ? 'Checking...' : 'Submit Answer'}
        </Button>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-lg border p-3 space-y-2 ${gradeBg[result.grade]}`}>
          <div className="flex items-center gap-2">
            {gradeIcon[result.grade]}
            <span className="text-sm font-medium capitalize">{result.grade}!</span>
            <span className="text-xs text-muted-foreground ml-auto">
              Score: {Math.round(result.score * 100)}%
            </span>
          </div>
          <p className="text-sm">{result.feedback}</p>
          {result.grade !== 'correct' && result.correct_answer && (
            <p className="text-xs text-muted-foreground">
              Correct answer: {result.correct_answer}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
