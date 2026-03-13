'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { BiasCategory, LearningMode } from '@/lib/types'

const biasCategories: { value: BiasCategory; label: string }[] = [
  { value: 'gender', label: 'Gender & Stereotypes' },
  { value: 'culture', label: 'Cultural Assumptions' },
  { value: 'socioeconomic', label: 'Socio-economic Bias' },
  { value: 'ableism', label: 'Ableism / Neurodiversity' },
]

const learningModes: { value: LearningMode; label: string }[] = [
  { value: 'read', label: 'Read' },
  { value: 'play', label: 'Play' },
  { value: 'watch', label: 'Watch' },
]

export default function TeacherSettingsPage() {
  const { user, language, setLanguage } = useAuth()
  
  const [selectedBiasCategories, setSelectedBiasCategories] = useState<BiasCategory[]>([
    'gender', 'culture', 'socioeconomic', 'ableism'
  ])
  const [selectedLearningModes, setSelectedLearningModes] = useState<LearningMode[]>([
    'read', 'play', 'watch'
  ])

  const toggleBiasCategory = (category: BiasCategory) => {
    setSelectedBiasCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleLearningMode = (mode: LearningMode) => {
    setSelectedLearningModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(user?.name || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-1">Teacher</Badge>
            </div>
          </div>

          <Separator />

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" defaultValue={user?.name} />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" defaultValue={user?.email} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle>Language & Region</CardTitle>
          <CardDescription>Set your language and time preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="language">Language</FieldLabel>
              <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'de')}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="timezone">Time Zone</FieldLabel>
              <Select defaultValue="Europe/Berlin">
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Berlin">Europe/Berlin (CET)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Learning Modes */}
      <Card>
        <CardHeader>
          <CardTitle>Default Learning Modes</CardTitle>
          <CardDescription>Which learning modes should be available by default in your lessons</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <div className="space-y-3">
              {learningModes.map(mode => (
                <div key={mode.value} className="flex items-center gap-3">
                  <Checkbox
                    id={`mode-${mode.value}`}
                    checked={selectedLearningModes.includes(mode.value)}
                    onCheckedChange={() => toggleLearningMode(mode.value)}
                  />
                  <Label htmlFor={`mode-${mode.value}`} className="cursor-pointer">
                    {mode.label}
                  </Label>
                </div>
              ))}
            </div>
          </FieldSet>
        </CardContent>
      </Card>

      {/* Bias Scan Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Bias Scan Preferences</CardTitle>
          <CardDescription>Which categories to focus on when scanning materials</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <div className="space-y-3">
              {biasCategories.map(category => (
                <div key={category.value} className="flex items-center gap-3">
                  <Checkbox
                    id={`bias-${category.value}`}
                    checked={selectedBiasCategories.includes(category.value)}
                    onCheckedChange={() => toggleBiasCategory(category.value)}
                  />
                  <Label htmlFor={`bias-${category.value}`} className="cursor-pointer">
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </FieldSet>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}
