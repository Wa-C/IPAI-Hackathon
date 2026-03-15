'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  getStudentsList,
  getStudentContentFormat,
  setStudentContentFormat,
  getStudentAboutMe,
  setStudentAboutMe,
  type StudentWithPref,
  type AboutMe,
} from '@/lib/api'
import { Input } from '@/components/ui/input'
import {
  Save,
  Eye,
  BookOpen,
  Zap,
  Clock,
  Accessibility,
  Palette,
  Volume2,
  Type,
  FileText,
  Layers,
  CheckCircle2,
  Loader2,
  User,
  Gamepad2,
  Video,
  Lock,
  Heart,
  Globe,
  Sparkles as SparklesIcon,
  AlertCircle,
} from 'lucide-react'

export default function StudentPreferences() {
  const [students, setStudents] = useState<StudentWithPref[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [contentFormat, setContentFormat] = useState<'reading' | 'flashcard'>('reading')
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [aboutMe, setAboutMe] = useState<AboutMe>({
    hobbies: '',
    age: '',
    native_language: '',
    interests: '',
    learning_challenges: '',
    fun_fact: '',
  })

  const [preferences, setPreferences] = useState({
    pace: 'standard' as 'slow' | 'standard' | 'fast',
    visualAids: true,
    audioSupport: false,
    extraChallenges: false,
    simplifiedText: false,
    colorBlindMode: false,
    dyslexiaFont: false,
    textSize: 100,
    readingGuide: false,
    reducedMotion: false,
    highContrast: false,
    learningGoal: 'I want to improve my understanding and get better grades',
  })

  // Load students from DB
  useEffect(() => {
    getStudentsList()
      .then((data) => {
        setStudents(data)
        if (data.length > 0) {
          // Auto-select first student or previously selected
          const lastId = localStorage.getItem('copa_student_id')
          const found = data.find(s => s.id === lastId)
          const student = found || data[0]
          setSelectedStudentId(student.id)
          setContentFormat((student.content_format as 'reading' | 'flashcard') || 'reading')
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStudents(false))
  }, [])

  // Load preference + about me when student changes
  useEffect(() => {
    if (!selectedStudentId) return
    localStorage.setItem('copa_student_id', selectedStudentId)
    getStudentContentFormat(selectedStudentId)
      .then((data) => {
        const fmt = data.content_format as 'reading' | 'flashcard'
        if (fmt === 'reading' || fmt === 'flashcard') setContentFormat(fmt)
      })
      .catch(() => {})
    getStudentAboutMe(selectedStudentId)
      .then((data) => {
        if (data.about_me && typeof data.about_me === 'object') {
          setAboutMe({ hobbies: '', age: '', native_language: '', interests: '', learning_challenges: '', fun_fact: '', ...data.about_me })
        }
      })
      .catch(() => {})
  }, [selectedStudentId])

  const handleContentFormatChange = (format: 'reading' | 'flashcard') => {
    setContentFormat(format)
  }

  const handleSave = async () => {
    if (!selectedStudentId) return
    setIsSaving(true)
    try {
      await Promise.all([
        setStudentContentFormat(selectedStudentId, contentFormat),
        setStudentAboutMe(selectedStudentId, aboutMe),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setIsSaving(false)
  }

  const selectedStudent = students.find(s => s.id === selectedStudentId)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Learning Preferences</h1>
          <p className="text-muted-foreground">
            Customize how lessons are presented to match your learning style
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !selectedStudentId} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
        </Button>
      </div>

      {/* Student Selector */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground">Active Student Profile</label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="mt-1.5 h-11 rounded-xl">
                  <SelectValue placeholder={loadingStudents ? 'Loading students...' : 'Select student'} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Content Format - saves to DB */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              How do you want to learn?
            </CardTitle>
            <CardDescription>
              Choose your preferred content format — lessons will be generated in this style.
              {selectedStudent && (
                <span className="font-medium text-foreground"> Currently: {contentFormat}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => handleContentFormatChange('reading')}
                className={`relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
                  contentFormat === 'reading'
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {contentFormat === 'reading' && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className={`p-4 rounded-2xl ${contentFormat === 'reading' ? 'bg-primary/10' : 'bg-muted'}`}>
                  <FileText className={`h-8 w-8 ${contentFormat === 'reading' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-center">
                  <p className={`text-lg font-semibold ${contentFormat === 'reading' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Reading
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Structured text lessons with sections and key terms
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleContentFormatChange('flashcard')}
                className={`relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
                  contentFormat === 'flashcard'
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {contentFormat === 'flashcard' && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className={`p-4 rounded-2xl ${contentFormat === 'flashcard' ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Layers className={`h-8 w-8 ${contentFormat === 'flashcard' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-center">
                  <p className={`text-lg font-semibold ${contentFormat === 'flashcard' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Flashcards
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Interactive quiz cards with questions, answers, and hints
                  </p>
                </div>
              </button>

              {/* Gamification — coming soon */}
              <div
                className="relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-dashed border-border opacity-60 cursor-not-allowed"
              >
                <div className="absolute top-3 right-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-4 rounded-2xl bg-muted">
                  <Gamepad2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-muted-foreground">
                    Gamification
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Learn through points, challenges, and interactive games
                  </p>
                  <span className="inline-block mt-2 text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>

              {/* Video Learning — coming soon */}
              <div
                className="relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-dashed border-border opacity-60 cursor-not-allowed"
              >
                <div className="absolute top-3 right-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-4 rounded-2xl bg-muted">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-muted-foreground">
                    Video Learning
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI-generated video explanations and visual walkthroughs
                  </p>
                  <span className="inline-block mt-2 text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Style */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Learning Style
            </CardTitle>
            <CardDescription>Fine-tune how you prefer to learn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Learning Pace</Label>
              <RadioGroup
                value={preferences.pace}
                onValueChange={(value) => setPreferences({ ...preferences, pace: value as any })}
                className="grid grid-cols-3 gap-3"
              >
                {[
                  { value: 'slow', label: 'Relaxed', desc: 'Take your time', icon: Clock },
                  { value: 'standard', label: 'Standard', desc: 'Balanced pace', icon: BookOpen },
                  { value: 'fast', label: 'Accelerated', desc: 'Move quickly', icon: Zap },
                ].map((opt) => (
                  <div key={opt.value} className="relative">
                    <RadioGroupItem value={opt.value} id={`pace-${opt.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`pace-${opt.value}`}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border cursor-pointer hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors"
                    >
                      <opt.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-xs text-muted-foreground text-center">{opt.desc}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              {[
                { key: 'visualAids', icon: Eye, label: 'Visual Aids', desc: 'Include diagrams and images' },
                { key: 'audioSupport', icon: Volume2, label: 'Audio Support', desc: 'Text-to-speech for content' },
                { key: 'extraChallenges', icon: Zap, label: 'Extra Challenges', desc: 'Advanced problems and extensions' },
                { key: 'simplifiedText', icon: Type, label: 'Simplified Text', desc: 'Easier vocabulary and shorter sentences' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-primary" />
                    <div>
                      <Label className="font-medium">{item.label}</Label>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={(preferences as any)[item.key]}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, [item.key]: checked })}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-primary" />
              Accessibility
            </CardTitle>
            <CardDescription>Adjust settings for comfort</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Text Size</Label>
                <span className="text-sm text-muted-foreground">{preferences.textSize}%</span>
              </div>
              <Slider
                value={[preferences.textSize]}
                onValueChange={([value]) => setPreferences({ ...preferences, textSize: value })}
                min={75} max={150} step={5}
              />
            </div>

            <div className="space-y-4">
              {[
                { key: 'colorBlindMode', icon: Palette, label: 'Color Blind Mode', desc: 'Optimized color palette' },
                { key: 'dyslexiaFont', icon: Type, label: 'Dyslexia-Friendly Font', desc: 'OpenDyslexic font style' },
                { key: 'readingGuide', icon: Eye, label: 'Reading Guide', desc: 'Highlight current line' },
                { key: 'highContrast', icon: Eye, label: 'High Contrast', desc: 'Increased color contrast' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-primary" />
                    <div>
                      <Label className="font-medium">{item.label}</Label>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={(preferences as any)[item.key]}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, [item.key]: checked })}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* About You */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              About You
            </CardTitle>
            <CardDescription>
              Tell us about yourself so your tutor and lessons can be personalized to your interests and needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="about-age" className="text-sm font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Age
                </Label>
                <Input
                  id="about-age"
                  placeholder="e.g. 15"
                  value={aboutMe.age || ''}
                  onChange={(e) => setAboutMe({ ...aboutMe, age: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about-language" className="text-sm font-medium flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  Native Language
                </Label>
                <Input
                  id="about-language"
                  placeholder="e.g. German, Arabic, French"
                  value={aboutMe.native_language || ''}
                  onChange={(e) => setAboutMe({ ...aboutMe, native_language: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="about-hobbies" className="text-sm font-medium flex items-center gap-1.5">
                  <SparklesIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Hobbies & Activities
                </Label>
                <Input
                  id="about-hobbies"
                  placeholder="e.g. football, drawing, video games, cooking"
                  value={aboutMe.hobbies || ''}
                  onChange={(e) => setAboutMe({ ...aboutMe, hobbies: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="about-interests" className="text-sm font-medium flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  Topics You Enjoy Learning About
                </Label>
                <Input
                  id="about-interests"
                  placeholder="e.g. space, animals, history, technology"
                  value={aboutMe.interests || ''}
                  onChange={(e) => setAboutMe({ ...aboutMe, interests: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="about-challenges" className="text-sm font-medium flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  Learning Challenges (optional)
                </Label>
                <Textarea
                  id="about-challenges"
                  placeholder="Anything your tutor should know? e.g. I find grammar difficult, I'm shy about speaking, I need more time to read..."
                  value={aboutMe.learning_challenges || ''}
                  onChange={(e) => setAboutMe({ ...aboutMe, learning_challenges: e.target.value })}
                  className="min-h-[70px] rounded-xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="about-funfact" className="text-sm font-medium flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                  Fun Fact About You (optional)
                </Label>
                <Input
                  id="about-funfact"
                  placeholder="e.g. I can solve a Rubik's cube in under 2 minutes!"
                  value={aboutMe.fun_fact || ''}
                  onChange={(e) => setAboutMe({ ...aboutMe, fun_fact: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              This information is private and only used to personalize your learning experience. Your teacher cannot see this.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
