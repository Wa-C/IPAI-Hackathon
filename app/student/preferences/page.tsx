'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { mockStudents } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import {
  Save,
  Eye,
  Ear,
  BookOpen,
  Zap,
  Clock,
  Accessibility,
  Palette,
  Volume2,
  Type
} from 'lucide-react'

export default function StudentPreferences() {
  const { user } = useAuth()
  
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

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

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
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Learning Style */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Learning Style
            </CardTitle>
            <CardDescription>
              Choose how you prefer to learn new content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Learning Pace */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Learning Pace</Label>
              <RadioGroup
                value={preferences.pace}
                onValueChange={(value) => setPreferences({ ...preferences, pace: value as 'slow' | 'standard' | 'fast' })}
                className="grid grid-cols-3 gap-3"
              >
                <div className="relative">
                  <RadioGroupItem value="slow" id="pace-slow" className="peer sr-only" />
                  <Label
                    htmlFor="pace-slow"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border cursor-pointer hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors"
                  >
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Relaxed</span>
                    <span className="text-xs text-muted-foreground text-center">Take your time</span>
                  </Label>
                </div>
                <div className="relative">
                  <RadioGroupItem value="standard" id="pace-standard" className="peer sr-only" />
                  <Label
                    htmlFor="pace-standard"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border cursor-pointer hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors"
                  >
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Standard</span>
                    <span className="text-xs text-muted-foreground text-center">Balanced pace</span>
                  </Label>
                </div>
                <div className="relative">
                  <RadioGroupItem value="fast" id="pace-fast" className="peer sr-only" />
                  <Label
                    htmlFor="pace-fast"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border cursor-pointer hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors"
                  >
                    <Zap className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Accelerated</span>
                    <span className="text-xs text-muted-foreground text-center">Move quickly</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Content Preferences */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="font-medium">Visual Aids</Label>
                    <p className="text-xs text-muted-foreground">Include diagrams and images</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.visualAids}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, visualAids: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="font-medium">Audio Support</Label>
                    <p className="text-xs text-muted-foreground">Text-to-speech for content</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.audioSupport}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, audioSupport: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-accent" />
                  <div>
                    <Label className="font-medium">Extra Challenges</Label>
                    <p className="text-xs text-muted-foreground">Advanced problems and extensions</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.extraChallenges}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, extraChallenges: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Type className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="font-medium">Simplified Text</Label>
                    <p className="text-xs text-muted-foreground">Easier vocabulary and shorter sentences</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.simplifiedText}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, simplifiedText: checked })}
                />
              </div>
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
            <CardDescription>
              Adjust settings to make learning more comfortable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Text Size</Label>
                <span className="text-sm text-muted-foreground">{preferences.textSize}%</span>
              </div>
              <Slider
                value={[preferences.textSize]}
                onValueChange={([value]) => setPreferences({ ...preferences, textSize: value })}
                min={75}
                max={150}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller</span>
                <span>Default</span>
                <span>Larger</span>
              </div>
            </div>

            {/* Visual Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="font-medium">Color Blind Mode</Label>
                    <p className="text-xs text-muted-foreground">Optimized color palette</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.colorBlindMode}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, colorBlindMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Type className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="font-medium">Dyslexia-Friendly Font</Label>
                    <p className="text-xs text-muted-foreground">OpenDyslexic font style</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.dyslexiaFont}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, dyslexiaFont: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="font-medium">Reading Guide</Label>
                    <p className="text-xs text-muted-foreground">Highlight current line</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.readingGuide}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, readingGuide: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="font-medium">Reduced Motion</Label>
                    <p className="text-xs text-muted-foreground">Minimize animations</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.reducedMotion}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, reducedMotion: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="font-medium">High Contrast</Label>
                    <p className="text-xs text-muted-foreground">Increased color contrast</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.highContrast}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, highContrast: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Goals */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Learning Goals</CardTitle>
            <CardDescription>
              Tell us what you want to achieve - this helps personalize your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Share your learning goals, interests, or any challenges you face..."
              value={preferences.learningGoal}
              onChange={(e) => setPreferences({ ...preferences, learningGoal: e.target.value })}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This information is private and only used to personalize your learning experience.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
