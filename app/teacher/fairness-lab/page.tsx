'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { mockFairnessResults } from '@/lib/mock-data'
import { FlaskConical, CheckCircle2, Users, ArrowRight } from 'lucide-react'

const differingAttributes = [
  { value: 'gender', label: 'Gender (male/female)' },
  { value: 'background', label: 'Socio-economic background hint' },
  { value: 'ethnicity', label: 'Ethnic name pattern' },
  { value: 'language', label: 'Native/Non-native speaker' },
]

export default function FairnessLabPage() {
  const [profileA, setProfileA] = useState({ name: 'Alex', attribute: '' })
  const [profileB, setProfileB] = useState({ name: 'Jordan', attribute: '' })
  const [selectedAttribute, setSelectedAttribute] = useState('')
  const [skills, setSkills] = useState('Reading comprehension: B2, Writing: B1, Vocabulary: B2')
  const [isComparing, setIsComparing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleCompare = () => {
    setIsComparing(true)
    setTimeout(() => {
      setIsComparing(false)
      setShowResults(true)
    }, 1500)
  }

  const handleReset = () => {
    setShowResults(false)
    setProfileA({ name: 'Alex', attribute: '' })
    setProfileB({ name: 'Jordan', attribute: '' })
    setSelectedAttribute('')
    setSkills('Reading comprehension: B2, Writing: B1, Vocabulary: B2')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          Fairness Lab
        </h1>
        <p className="text-muted-foreground">
          Test that COPA{"'"}s AI suggestions do not change based on sensitive attributes alone
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <FlaskConical className="h-4 w-4 text-primary" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          Create two synthetic student profiles that differ only in one sensitive attribute (like gender or background). 
          If the AI suggestions are identical, it demonstrates fair treatment regardless of the differing attribute.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile A */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-chart-1" />
              Student Profile A
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="nameA">Display Name</FieldLabel>
                <Input
                  id="nameA"
                  value={profileA.name}
                  onChange={(e) => setProfileA(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter a name"
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>Attribute Value</FieldLabel>
                <Badge variant="outline" className="text-sm">
                  {selectedAttribute ? 'Value A (e.g., Male / High income / German name)' : 'Select attribute below'}
                </Badge>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Profile B */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-chart-2" />
              Student Profile B
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="nameB">Display Name</FieldLabel>
                <Input
                  id="nameB"
                  value={profileB.name}
                  onChange={(e) => setProfileB(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter a name"
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>Attribute Value</FieldLabel>
                <Badge variant="outline" className="text-sm">
                  {selectedAttribute ? 'Value B (e.g., Female / Low income / Non-German name)' : 'Select attribute below'}
                </Badge>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      {/* Shared Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            Both profiles will have identical skills - only the selected attribute will differ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="attribute">Differing Attribute</FieldLabel>
              <Select value={selectedAttribute} onValueChange={setSelectedAttribute}>
                <SelectTrigger id="attribute">
                  <SelectValue placeholder="Select the attribute to test" />
                </SelectTrigger>
                <SelectContent>
                  {differingAttributes.map((attr) => (
                    <SelectItem key={attr.value} value={attr.value}>
                      {attr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="skills">Skills (identical for both)</FieldLabel>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., Reading: B2, Writing: B1"
              />
            </Field>
          </FieldGroup>

          <div className="flex gap-3">
            <Button 
              onClick={handleCompare} 
              disabled={isComparing || !selectedAttribute}
              className="gap-2"
            >
              {isComparing ? (
                <>Processing...</>
              ) : (
                <>
                  <FlaskConical className="h-4 w-4" />
                  Compare AI Suggestions
                </>
              )}
            </Button>
            {showResults && (
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <Card className="border-success/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              AI Suggestion Comparison
            </CardTitle>
            <CardDescription>
              Results of the fairness test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-success/30 bg-success/5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertTitle className="text-success">Fair Treatment Confirmed</AlertTitle>
              <AlertDescription>
                The AI suggestions are identical for both profiles, demonstrating that COPA{"'"}s recommendations 
                do not change based on the selected sensitive attribute alone.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile A Results */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-chart-1" />
                  Suggestions for {mockFairnessResults.profileA.name}
                </h4>
                <ul className="space-y-2">
                  {mockFairnessResults.profileA.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Profile B Results */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-chart-2" />
                  Suggestions for {mockFairnessResults.profileB.name}
                </h4>
                <ul className="space-y-2">
                  {mockFairnessResults.profileB.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
