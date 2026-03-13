'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { mockClasses, mockGeneratedTasks } from '@/lib/mock-data'
import { Sparkles, Upload, HelpCircle, BookOpen, Play, Eye, Save, ScanSearch, Brain, Zap, ArrowRight, CheckCircle2, Video, FileText, Gamepad2, HelpingHand } from 'lucide-react'
import type { Task, LearningMode } from '@/lib/types'

const modeIcons: Record<LearningMode | 'mixed', React.ReactNode> = {
  read: <BookOpen className="h-4 w-4" />,
  play: <Play className="h-4 w-4" />,
  watch: <Eye className="h-4 w-4" />,
  mixed: <Sparkles className="h-4 w-4" />,
}

const modeColors: Record<LearningMode | 'mixed', string> = {
  read: 'from-purple-500 to-indigo-500',
  play: 'from-cyan-500 to-blue-500',
  watch: 'from-orange-500 to-red-500',
  mixed: 'from-emerald-500 to-teal-500',
}

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-2xl border-0 bg-card shadow-md p-5 space-y-4 card-interactive">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${modeColors[task.mode]} shadow-md`}>
            <span className="text-white">{modeIcons[task.mode]}</span>
          </div>
          <div>
            <span className="text-sm font-medium capitalize text-foreground">{task.mode}</span>
            <p className="text-xs text-muted-foreground">{task.duration} min</p>
          </div>
        </div>
        {task.generatedByAI && (
          <Badge 
            className="gap-1 text-white border-0 rounded-full"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
          >
            <Sparkles className="h-3 w-3" />
            AI
          </Badge>
        )}
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{task.title}</h4>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{task.description}</p>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:bg-primary/10 rounded-lg">
              <HelpCircle className="h-3.5 w-3.5" />
              Why this?
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs rounded-xl">
            <p>This activity was designed based on the learning level and preferred engagement style of the student group.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default function LessonBuilderPage() {
  const [selectedClass, setSelectedClass] = useState('')
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [objective, setObjective] = useState('')
  const [material, setMaterial] = useState('')
  const [createLevels, setCreateLevels] = useState(true)
  const [languageLearners, setLanguageLearners] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [contentTypes, setContentTypes] = useState({
    video: true,
    text: true,
    quiz: true,
    game: false,
  })

  const toggleContentType = (type: keyof typeof contentTypes) => {
    setContentTypes(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const handleGenerate = () => {
    setIsGenerated(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2.5 rounded-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
            >
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Lesson Builder</h1>
          </div>
          <p className="text-muted-foreground">Create differentiated lessons with AI assistance in seconds</p>
        </div>
        {isGenerated && (
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button 
              className="gap-2 text-white border-0 rounded-xl shadow-lg hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Publish
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                Lesson Configuration
              </CardTitle>
              <CardDescription>Set up the basic details for your lesson</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="class">Class</FieldLabel>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger id="class" className="h-12 rounded-xl">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} (Grade {cls.grade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="subject">Subject</FieldLabel>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., English Literature"
                    className="h-12 rounded-xl"
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="topic">Topic / Title</FieldLabel>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Introduction to Shakespeare"
                    className="h-12 rounded-xl"
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="objective">Learning Objective</FieldLabel>
                  <Textarea
                    id="objective"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="What should students learn from this lesson?"
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="material">Base Material</FieldLabel>
                  <Textarea
                    id="material"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Paste your teaching material here or describe what you want to teach..."
                    rows={5}
                    className="rounded-xl resize-none"
                  />
                  <Button variant="outline" size="sm" className="mt-3 gap-2 rounded-lg">
                    <Upload className="h-4 w-4" />
                    Upload File
                  </Button>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Content Types */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Play className="h-4 w-4 text-primary" />
                </div>
                Content Types
              </CardTitle>
              <CardDescription>Select the types of content to include in your lesson</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'video' as const, label: 'Video', icon: Video, desc: 'Explanatory videos' },
                  { key: 'text' as const, label: 'Reading', icon: FileText, desc: 'Text content' },
                  { key: 'quiz' as const, label: 'Quiz', icon: HelpingHand, desc: 'Questions & answers' },
                  { key: 'game' as const, label: 'Game', icon: Gamepad2, desc: 'Interactive games' },
                ].map((type) => (
                  <button
                    key={type.key}
                    onClick={() => toggleContentType(type.key)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      contentTypes[type.key] 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${contentTypes[type.key] ? 'bg-primary/10' : 'bg-muted'}`}>
                        <type.icon className={`h-5 w-5 ${contentTypes[type.key] ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className={`font-medium ${contentTypes[type.key] ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {type.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{type.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accent/10">
                  <Zap className="h-4 w-4 text-accent" />
                </div>
                Differentiation Settings
              </CardTitle>
              <CardDescription>Configure how the AI should differentiate content</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors">
                    <Checkbox
                      id="levels"
                      checked={createLevels}
                      onCheckedChange={(checked) => setCreateLevels(checked === true)}
                      className="mt-1"
                    />
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="levels" className="cursor-pointer font-medium text-foreground">
                        Create 3 levels (struggling / on-track / advanced)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Generate tailored activities for different learning levels
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors">
                    <Checkbox
                      id="language"
                      checked={languageLearners}
                      onCheckedChange={(checked) => setLanguageLearners(checked === true)}
                      className="mt-1"
                    />
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="language" className="cursor-pointer font-medium text-foreground">
                        Include support for language learners
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add vocabulary support and simplified language options
                      </p>
                    </div>
                  </div>
                </div>
              </FieldSet>

              <div className="mt-6">
                <Button 
                  onClick={handleGenerate} 
                  className="w-full h-14 gap-2 text-white border-0 rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all text-base"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                >
                  <Sparkles className="h-5 w-5" />
                  Generate Differentiated Lesson
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Output Preview */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="p-2 rounded-xl shadow-md"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                >
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                AI Output Preview
              </CardTitle>
              <CardDescription>
                {isGenerated
                  ? 'Review the generated activities for each learning level'
                  : 'Configure your lesson and click Generate to see AI suggestions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isGenerated ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                    <Brain className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Ready to create</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Fill in the lesson details and click Generate to create differentiated activities
                  </p>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 h-12 rounded-xl bg-secondary/50 p-1">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Overview</TabsTrigger>
                    <TabsTrigger value="struggling" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Struggling</TabsTrigger>
                    <TabsTrigger value="on-track" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">On-track</TabsTrigger>
                    <TabsTrigger value="advanced" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="space-y-5">
                      <div className="rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/30 p-5">
                        <h4 className="font-semibold text-foreground mb-2">Lesson Summary</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          This lesson has been differentiated into 3 levels with a total of 8 activities.
                          Each level includes tasks optimized for different learning modes (Read, Play, Watch).
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {[
                          { label: 'Struggling', count: 3, color: 'from-orange-500 to-red-500' },
                          { label: 'On-track', count: 2, color: 'from-cyan-500 to-blue-500' },
                          { label: 'Advanced', count: 3, color: 'from-emerald-500 to-teal-500' },
                        ].map((level) => (
                          <div key={level.label} className="rounded-2xl border-0 bg-card shadow-md p-5 text-center card-interactive">
                            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center shadow-md`}>
                              <span className="text-white font-bold text-lg">{level.count}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{level.label}</p>
                            <p className="text-xs text-muted-foreground">Tasks</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="struggling" className="mt-6 space-y-4">
                    <div className="rounded-xl bg-gradient-to-r from-orange-500/10 to-transparent p-4 border border-orange-500/20">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Rationale:</strong> Simpler vocabulary, more visual scaffolding, and interactive elements to support comprehension.
                      </p>
                    </div>
                    {mockGeneratedTasks.struggling.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </TabsContent>

                  <TabsContent value="on-track" className="mt-6 space-y-4">
                    <div className="rounded-xl bg-gradient-to-r from-cyan-500/10 to-transparent p-4 border border-cyan-500/20">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Rationale:</strong> Grade-level appropriate activities with guided questions and self-assessment checkpoints.
                      </p>
                    </div>
                    {mockGeneratedTasks['on-track'].map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </TabsContent>

                  <TabsContent value="advanced" className="mt-6 space-y-4">
                    <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent p-4 border border-emerald-500/20">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Rationale:</strong> Extended challenges, critical thinking tasks, and opportunities for independent research.
                      </p>
                    </div>
                    {mockGeneratedTasks.advanced.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {isGenerated && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1 gap-2 h-12 text-white border-0 rounded-xl shadow-lg hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
              >
                <Save className="h-4 w-4" />
                Save & Assign Later
              </Button>
              <Link href="/teacher/bias-scanner" className="flex-1">
                <Button variant="outline" className="w-full gap-2 h-12 rounded-xl">
                  <ScanSearch className="h-4 w-4" />
                  Run Bias Scan
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
