'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Database,
  Users,
  Shield,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Settings,
  RefreshCw
} from 'lucide-react'

const integrations = [
  {
    id: 'iserv',
    name: 'IServ',
    description: 'School management and communication platform',
    category: 'LMS',
    status: 'connected',
    lastSync: '5 minutes ago',
    icon: '🏫',
  },
  {
    id: 'moodle',
    name: 'Moodle',
    description: 'Open-source learning management system',
    category: 'LMS',
    status: 'available',
    icon: '📚',
  },
  {
    id: 'untis',
    name: 'Untis',
    description: 'Timetable and scheduling software',
    category: 'Scheduling',
    status: 'connected',
    lastSync: '1 hour ago',
    icon: '📅',
  },
  {
    id: 'ms365',
    name: 'Microsoft 365',
    description: 'Microsoft Office and Teams integration',
    category: 'Productivity',
    status: 'connected',
    lastSync: '10 minutes ago',
    icon: '📊',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Google Classroom and Drive integration',
    category: 'Productivity',
    status: 'available',
    icon: '🔵',
  },
  {
    id: 'ldap',
    name: 'LDAP/Active Directory',
    description: 'User directory and authentication',
    category: 'Authentication',
    status: 'connected',
    lastSync: '2 hours ago',
    icon: '🔐',
  },
]

export default function AdminIntegrations() {
  const [syncingId, setSyncingId] = useState<string | null>(null)

  const connectedIntegrations = integrations.filter(i => i.status === 'connected')
  const availableIntegrations = integrations.filter(i => i.status === 'available')

  const handleSync = async (id: string) => {
    setSyncingId(id)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSyncingId(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Integrations</h1>
        <p className="text-muted-foreground">Connect COPA with your existing school systems</p>
      </div>

      {/* Data Privacy Notice */}
      <Card className="border-border/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Federated Data Privacy</p>
              <p className="text-sm text-muted-foreground mt-1">
                All integrations use secure, encrypted connections. Student data remains within your jurisdiction and is never shared with third parties. COPA follows GDPR and German data protection regulations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Integrations */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Connected Integrations
          </CardTitle>
          <CardDescription>
            Active integrations syncing data with COPA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {connectedIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">{integration.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{integration.name}</h3>
                    <Badge variant="secondary" className="text-xs">{integration.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last synced: {integration.lastSync}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSync(integration.id)}
                  disabled={syncingId === integration.id}
                  className="gap-1.5"
                >
                  <RefreshCw className={`h-4 w-4 ${syncingId === integration.id ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>
            Connect additional systems to enhance COPA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl opacity-60">{integration.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{integration.name}</h3>
                    <Badge variant="outline" className="text-xs">{integration.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <Button size="sm" className="gap-1.5">
                Connect
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Sync Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Sync Settings</CardTitle>
          <CardDescription>Configure how data is synchronized between systems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <Label className="font-medium">Auto-sync Users</Label>
                <p className="text-xs text-muted-foreground">Automatically import new users from connected LMS</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <Label className="font-medium">Sync Class Rosters</Label>
                <p className="text-xs text-muted-foreground">Keep class memberships in sync with source system</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-primary" />
              <div>
                <Label className="font-medium">Real-time Sync</Label>
                <p className="text-xs text-muted-foreground">Enable instant data synchronization (may increase API usage)</p>
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
