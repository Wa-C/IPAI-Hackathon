'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { sampleBiasMaterial, sampleBiasIssues } from '@/lib/mock-data'
import type { BiasIssue, BiasCategory } from '@/lib/types'
import { 
  Sparkles, 
  ScanSearch, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw
} from 'lucide-react'

const categoryLabels: Record<BiasCategory, string> = {
  gender: 'Gender & Stereotypes',
  culture: 'Cultural Assumptions',
  socioeconomic: 'Socio-economic Bias',
  ableism: 'Ableism / Neurodiversity',
}

const categoryColors: Record<BiasCategory, string> = {
  gender: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
  culture: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
  socioeconomic: 'bg-chart-3/10 text-chart-3 border-chart-3/30',
  ableism: 'bg-chart-4/10 text-chart-4 border-chart-4/30',
}

const severityColors = {
  low: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning-foreground',
  high: 'bg-destructive/10 text-destructive',
}

function IssueCard({ 
  issue, 
  onReplace 
}: { 
  issue: BiasIssue
  onReplace: (issue: BiasIssue) => void 
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={categoryColors[issue.category]}>
            {categoryLabels[issue.category]}
          </Badge>
          <Badge variant="secondary" className={severityColors[issue.severity]}>
            {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} severity
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Original phrase</p>
          <p className="text-sm font-medium text-destructive bg-destructive/5 p-2 rounded border border-destructive/20">
            {'"'}{issue.originalPhrase}{'"'}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Why it{"'"}s problematic</p>
          <p className="text-sm text-muted-foreground">{issue.explanation}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Suggested alternative</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-success bg-success/5 p-2 rounded border border-success/20 flex-1">
              {'"'}{issue.suggestion}{'"'}
            </p>
            <Button 
              size="sm" 
              onClick={() => onReplace(issue)}
              className="gap-1 shrink-0"
            >
              <ArrowRight className="h-3 w-3" />
              Replace
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BiasScannerPage() {
  const [material, setMaterial] = useState(sampleBiasMaterial)
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [issues, setIssues] = useState<BiasIssue[]>([])
  const [resolvedCount, setResolvedCount] = useState(0)

  const handleScan = () => {
    setIsScanning(true)
    // Simulate scanning
    setTimeout(() => {
      setIsScanning(false)
      setScanComplete(true)
      setIssues(sampleBiasIssues)
      setResolvedCount(0)
    }, 1500)
  }

  const handleReplace = (issue: BiasIssue) => {
    // Replace the phrase in the material
    setMaterial(prev => prev.replace(issue.originalPhrase, issue.suggestion))
    // Remove the issue from the list
    setIssues(prev => prev.filter(i => i.id !== issue.id))
    setResolvedCount(prev => prev + 1)
  }

  const handleReset = () => {
    setMaterial(sampleBiasMaterial)
    setScanComplete(false)
    setIssues([])
    setResolvedCount(0)
  }

  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = []
    }
    acc[issue.category].push(issue)
    return acc
  }, {} as Record<BiasCategory, BiasIssue[]>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Bias & Inclusion Scanner</h1>
        <p className="text-muted-foreground">Scan teaching materials for potential bias and inclusion issues</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Input Material */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Material</CardTitle>
              <CardDescription>Paste or edit your material to scan for bias and inclusion issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Paste your teaching material here..."
                rows={15}
                className="font-mono text-sm leading-relaxed"
              />
              <div className="flex gap-3">
                <Button 
                  onClick={handleScan} 
                  disabled={isScanning || !material.trim()}
                  className="gap-2"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <ScanSearch className="h-4 w-4" />
                      Scan for Bias & Inclusion Issues
                    </>
                  )}
                </Button>
                {scanComplete && (
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Scan Results
              </CardTitle>
              <CardDescription>
                {!scanComplete 
                  ? 'Click scan to analyze your material'
                  : issues.length === 0 
                    ? 'No issues found!'
                    : `Found ${issues.length} issue${issues.length !== 1 ? 's' : ''} to review`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!scanComplete ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <ScanSearch className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Paste your teaching material and click Scan to check for bias and inclusion issues
                  </p>
                </div>
              ) : issues.length === 0 ? (
                <Alert className="border-success/30 bg-success/5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertTitle className="text-success">All clear!</AlertTitle>
                  <AlertDescription>
                    {resolvedCount > 0 
                      ? `Great job! You resolved ${resolvedCount} issue${resolvedCount !== 1 ? 's' : ''}. Your material now looks inclusive.`
                      : 'No issues found. Your material looks inclusive!'
                    }
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {issues.length} issue{issues.length !== 1 ? 's' : ''} found
                      </span>
                      {resolvedCount > 0 && (
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          {resolvedCount} resolved
                        </Badge>
                      )}
                    </div>
                    <Progress 
                      value={(resolvedCount / (issues.length + resolvedCount)) * 100} 
                      className="h-2"
                    />

                    {/* Category breakdown */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {Object.entries(groupedIssues).map(([category, catIssues]) => (
                        <Badge 
                          key={category} 
                          variant="outline" 
                          className={categoryColors[category as BiasCategory]}
                        >
                          {categoryLabels[category as BiasCategory]}: {catIssues.length}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Issue Legend */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-success/30" />
                      <span>Low</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-warning/30" />
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-destructive/30" />
                      <span>High</span>
                    </div>
                  </div>

                  {/* Issues List */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {issues.map((issue) => (
                      <IssueCard 
                        key={issue.id} 
                        issue={issue} 
                        onReplace={handleReplace}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
