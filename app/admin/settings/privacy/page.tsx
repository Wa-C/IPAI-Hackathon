'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Shield,
  Lock,
  Eye,
  Database,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react'

export default function PrivacySettings() {
  const [isSaving, setIsSaving] = useState(false)

  const complianceItems = [
    { name: 'Data Processing Agreement', status: 'complete', date: '2024-01-01' },
    { name: 'Privacy Policy Published', status: 'complete', date: '2024-01-01' },
    { name: 'Consent Management', status: 'complete', date: '2024-01-05' },
    { name: 'Data Retention Policy', status: 'complete', date: '2024-01-01' },
    { name: 'Annual Privacy Audit', status: 'pending', date: 'Due: 2024-12-31' },
  ]

  const dataCategories = [
    { name: 'Student Learning Data', retention: '3 years', description: 'Progress, scores, and learning analytics' },
    { name: 'User Accounts', retention: 'Until deletion', description: 'Usernames, emails, and preferences' },
    { name: 'AI Interaction Logs', retention: '90 days', description: 'Prompts and responses from AI features' },
    { name: 'System Logs', retention: '30 days', description: 'Technical logs for debugging' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Privacy & Data Protection</h1>
        <p className="text-muted-foreground">GDPR compliance and data management settings</p>
      </div>

      {/* Compliance Overview */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                GDPR Compliance Status
              </CardTitle>
              <CardDescription>Your organization compliance score</CardDescription>
            </div>
            <Badge className="bg-success text-success-foreground">98% Compliant</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={98} className="h-2" />
          <div className="space-y-2">
            {complianceItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {item.status === 'complete' ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <Badge variant={item.status === 'complete' ? 'secondary' : 'outline'}>
                  {item.status === 'complete' ? 'Complete' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Data Retention */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Data Retention Policies
            </CardTitle>
            <CardDescription>How long different types of data are stored</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataCategories.map((category) => (
              <div key={category.name} className="p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-foreground">{category.name}</p>
                  <Badge variant="secondary">{category.retention}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy Controls */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Privacy Controls
            </CardTitle>
            <CardDescription>Configure privacy settings for your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label className="font-medium">Anonymize Learning Analytics</Label>
                <p className="text-xs text-muted-foreground">Remove personal identifiers from analytics</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label className="font-medium">Require Parental Consent</Label>
                <p className="text-xs text-muted-foreground">For students under 16 years old</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label className="font-medium">Allow Data Export Requests</Label>
                <p className="text-xs text-muted-foreground">Users can download their data</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label className="font-medium">Log AI Interactions</Label>
                <p className="text-xs text-muted-foreground">Store AI prompts for quality review</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Data Processing */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            AI Data Processing
          </CardTitle>
          <CardDescription>Control how AI features process student data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>AI Processing Location</Label>
              <Select defaultValue="eu">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu">EU Data Centers Only</SelectItem>
                  <SelectItem value="de">Germany Only</SelectItem>
                  <SelectItem value="global">Global (Fastest)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Choose where AI processing occurs</p>
            </div>
            <div className="space-y-2">
              <Label>AI Model Provider</Label>
              <Select defaultValue="eu-compliant">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu-compliant">EU-Compliant Provider</SelectItem>
                  <SelectItem value="on-premise">On-Premise (Enterprise)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select AI service provider</p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Federated Learning Enabled</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Student data never leaves your servers. AI models are trained on anonymized, aggregated data only. Individual student information is never used for model training.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Management
          </CardTitle>
          <CardDescription>Export, audit, or delete organizational data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Download className="h-5 w-5" />
              <span className="text-sm">Export All Data</span>
              <span className="text-xs text-muted-foreground">Download complete backup</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Generate Audit Log</span>
              <span className="text-xs text-muted-foreground">View all data access</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 text-destructive hover:text-destructive">
              <Trash2 className="h-5 w-5" />
              <span className="text-sm">Purge Old Data</span>
              <span className="text-xs text-muted-foreground">Remove expired records</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
