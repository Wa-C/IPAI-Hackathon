'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  getClasses,
  getLessons,
  createLesson,
  deleteLesson,
  generateContent,
  uploadPdf,
  type ClassItem,
  type LessonItem,
  type ReadingContent,
  type FlashcardContent,
  type GeneratedContent,
} from '@/lib/api'
import {
  Sparkles,
  BookOpen,
  Brain,
  Zap,
  Loader2,
  AlertTriangle,
  Trash2,
  FileText,
  Layers,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
} from 'lucide-react'

// ─── Flashcard Component ────────────────────────────────────
function FlashcardPreview({ content }: { content: FlashcardContent }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = content.cards[currentIndex]
  if (!card) return null

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{content.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Card {currentIndex + 1} of {content.cards.length}
        </p>
      </div>

      {/* The Card */}
      <div
        className="flashcard-container mx-auto"
        style={{ perspective: '1000px', maxWidth: '460px' }}
      >
        <div
          onClick={() => setFlipped(!flipped)}
          className="flashcard-inner cursor-pointer"
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '260px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="rounded-2xl shadow-xl border-2 border-primary/20 p-8 flex flex-col items-center justify-center text-center"
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)',
            }}
          >
            <div className="p-3 rounded-xl bg-primary/10 mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground leading-relaxed">{card.front}</p>
            {card.hint && (
              <p className="text-xs text-muted-foreground mt-4 italic">Hint: {card.hint}</p>
            )}
            <p className="text-xs text-muted-foreground mt-4 opacity-60">Click to flip</p>
          </div>

          {/* Back */}
          <div
            className="rounded-2xl shadow-xl border-2 border-emerald-500/20 p-8 flex flex-col items-center justify-center text-center"
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(145deg, hsl(var(--card)) 0%, rgba(16,185,129,0.05) 100%)',
            }}
          >
            <div className="p-3 rounded-xl bg-emerald-500/10 mb-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-base text-foreground leading-relaxed">{card.back}</p>
            <p className="text-xs text-muted-foreground mt-4 opacity-60">Click to flip back</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => { setFlipped(false); setCurrentIndex(Math.max(0, currentIndex - 1)) }}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-1.5">
          {content.cards.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFlipped(false); setCurrentIndex(i) }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-primary scale-125'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => { setFlipped(false); setCurrentIndex(Math.min(content.cards.length - 1, currentIndex + 1)) }}
          disabled={currentIndex === content.cards.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Reading Component ──────────────────────────────────────
function ReadingPreview({ content }: { content: ReadingContent }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <span>{content.estimated_minutes} min read</span>
      </div>

      <div className="space-y-8">
        {content.sections.map((section, i) => (
          <article key={i} className="reading-section">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)' }}
              >
                {i + 1}
              </span>
              {section.heading}
            </h3>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pl-9">
              {section.body}
            </div>
            {section.key_terms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pl-9">
                {section.key_terms.map((term) => (
                  <Badge
                    key={term}
                    variant="secondary"
                    className="rounded-full text-xs bg-primary/10 text-primary border-0"
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────
export default function LessonBuilderPage() {
  // Form state
  const [selectedClass, setSelectedClass] = useState('')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [objective, setObjective] = useState('')
  const [material, setMaterial] = useState('')

  // Data state
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)

  // AI generation state
  const [activeContentType, setActiveContentType] = useState<'reading' | 'flashcard'>('reading')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  // Upload state
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setGenError(null)
    try {
      const result = await uploadPdf(file)
      setMaterial(result.text)
    } catch (err: any) {
      setGenError(err.message || 'PDF upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Saving state
  const [saving, setSaving] = useState(false)

  // Load classes and lessons
  useEffect(() => {
    Promise.all([getClasses(), getLessons()])
      .then(([c, l]) => { setClasses(c); setLessons(l) })
      .catch(() => {})
      .finally(() => setLoadingClasses(false))
  }, [])

  // Auto-fill subject when class selected
  useEffect(() => {
    if (selectedClass) {
      const cls = classes.find(c => c.id === selectedClass)
      if (cls && !subject) setSubject(cls.subject)
    }
  }, [selectedClass])

  const canGenerate = selectedClass && title.trim()

  const handleGenerate = async () => {
    if (!canGenerate) return
    setGenerating(true)
    setGenError(null)
    setGeneratedContent(null)

    try {
      const cls = classes.find(c => c.id === selectedClass)
      const result = await generateContent({
        title,
        subject,
        topic,
        learning_objective: objective,
        base_material: material || undefined,
        grade_level: cls ? parseInt(cls.grade) : undefined,
        content_type: activeContentType,
      })
      setGeneratedContent(result)
    } catch (e: any) {
      setGenError(e.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveLesson = async () => {
    if (!selectedClass || !title.trim()) return
    setSaving(true)
    try {
      const cls = classes.find(c => c.id === selectedClass)
      await createLesson({
        class_id: selectedClass,
        title,
        subject,
        topic,
        learning_objective: objective,
        base_material: material || undefined,
        grade_level: cls ? parseInt(cls.grade) : undefined,
        content_types: [activeContentType],
        generate_differentiation: false,
      })
      // Refresh lessons list
      const updated = await getLessons()
      setLessons(updated)
      // Reset form
      setTitle('')
      setTopic('')
      setObjective('')
      setMaterial('')
      setGeneratedContent(null)
    } catch (e: any) {
      setGenError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLesson = async (id: string) => {
    try {
      await deleteLesson(id)
      setLessons(prev => prev.filter(l => l.id !== id))
    } catch {}
  }

  // Switch content type and regenerate
  const handleContentTypeSwitch = (type: 'reading' | 'flashcard') => {
    setActiveContentType(type)
    if (generatedContent && generatedContent.type !== type && canGenerate) {
      // Auto-regenerate for new type
      setActiveContentType(type)
      setTimeout(() => {
        setGenerating(true)
        setGenError(null)
        setGeneratedContent(null)
        const cls = classes.find(c => c.id === selectedClass)
        generateContent({
          title,
          subject,
          topic,
          learning_objective: objective,
          base_material: material || undefined,
          grade_level: cls ? parseInt(cls.grade) : undefined,
          content_type: type,
        })
          .then(setGeneratedContent)
          .catch((e: any) => setGenError(e.message))
          .finally(() => setGenerating(false))
      }, 0)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="p-2.5 rounded-xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
          >
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Lesson Builder</h1>
        </div>
        <p className="text-muted-foreground">Create lessons and preview AI-generated content for your students</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ─── Left: Form (2 cols) ─── */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">New Lesson</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Class */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder={loadingClasses ? 'Loading...' : 'Select a class'} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} (Grade {cls.grade})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Shakespeare"
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Subject + Topic row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="English"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Topic</label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Romeo and Juliet"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* Objective */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Learning Objective</label>
                <Textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="What should students learn?"
                  rows={2}
                  className="rounded-xl resize-none"
                />
              </div>

              {/* Base Material */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Base Material <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-lg text-xs"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      {uploading ? 'Extracting...' : 'Upload PDF'}
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Paste teaching material or notes, or upload a PDF..."
                  rows={4}
                  className="rounded-xl resize-none"
                />
                {material && (
                  <p className="text-xs text-muted-foreground">
                    {material.length.toLocaleString()} characters — AI will generate content strictly from this material
                  </p>
                )}
              </div>

              {/* Content Type Selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Content Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleContentTypeSwitch('reading')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                      activeContentType === 'reading'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activeContentType === 'reading' ? 'bg-primary/10' : 'bg-muted'}`}>
                      <FileText className={`h-5 w-5 ${activeContentType === 'reading' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${activeContentType === 'reading' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Reading
                      </p>
                      <p className="text-xs text-muted-foreground">Text lesson</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleContentTypeSwitch('flashcard')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                      activeContentType === 'flashcard'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activeContentType === 'flashcard' ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Layers className={`h-5 w-5 ${activeContentType === 'flashcard' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${activeContentType === 'flashcard' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Flashcards
                      </p>
                      <p className="text-xs text-muted-foreground">Quiz cards</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || generating}
                  className="flex-1 h-12 gap-2 text-white border-0 rounded-xl shadow-lg hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {generating ? 'Generating...' : 'Generate Preview'}
                </Button>
                <Button
                  onClick={handleSaveLesson}
                  disabled={!canGenerate || saving}
                  variant="outline"
                  className="h-12 gap-2 rounded-xl"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ─── Existing Lessons ─── */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Lessons</CardTitle>
              <CardDescription>{lessons.length} lessons created</CardDescription>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No lessons yet</p>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {lessons.slice(0, 20).map((lesson) => {
                    const cls = classes.find(c => c.id === lesson.class_id)
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {cls?.name || 'Unknown class'} &middot; {lesson.subject}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs rounded-full ${
                              lesson.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted'
                            }`}
                          >
                            {lesson.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Right: AI Preview (3 cols) ─── */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-lg min-h-[600px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div
                    className="p-2 rounded-xl shadow-md"
                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                  >
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  AI Content Preview
                </CardTitle>
                {generatedContent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Regenerate
                  </Button>
                )}
              </div>
              <CardDescription>
                {generatedContent
                  ? `Previewing ${generatedContent.type === 'reading' ? 'reading lesson' : 'flashcard set'} — this is how students will see it`
                  : 'Fill in the lesson details and click Generate to preview AI content'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Loading */}
              {generating && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <Loader2 className="absolute -top-1 -right-1 h-5 w-5 animate-spin text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mt-4">Generating {activeContentType} content...</p>
                  <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
                </div>
              )}

              {/* Error */}
              {genError && !generating && (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-warning" />
                  <p className="text-sm text-muted-foreground">{genError}</p>
                  <Button variant="outline" size="sm" onClick={handleGenerate}>Try Again</Button>
                </div>
              )}

              {/* Empty state */}
              {!generating && !genError && !generatedContent && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
                    <Brain className="h-10 w-10 text-primary/40" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Ready to generate</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Choose a content type, fill in the details, and click <strong>Generate Preview</strong> to see how your lesson will look
                  </p>
                </div>
              )}

              {/* ─── Reading Preview ─── */}
              {!generating && !genError && generatedContent?.type === 'reading' && (
                <ReadingPreview content={generatedContent as ReadingContent} />
              )}

              {/* ─── Flashcard Preview ─── */}
              {!generating && !genError && generatedContent?.type === 'flashcard' && (
                <FlashcardPreview content={generatedContent as FlashcardContent} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
