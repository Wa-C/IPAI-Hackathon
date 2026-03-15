'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Network,
  Building2,
  Cpu,
  BookOpen,
  Users,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react'

interface SchoolModel {
  modelName: string
  version: string
  type: 'recommendation' | 'genai'
  localAccuracy: number
  globalAccuracy: number
  flContributions: number
  lastSync: string
  status: 'synced' | 'training' | 'pending'
  dataPoints: number
}

interface School {
  id: string
  name: string
  code: string
  location: string
  studentCount: number
  teacherCount: number
  joinedFL: string
  privacyStatus: 'compliant' | 'review'
  models: SchoolModel[]
}

const schools: School[] = [
  {
    id: 'school-1',
    name: 'Heinrich-Heine-Gymnasium Berlin',
    code: 'HHG-BER',
    location: 'Berlin, Germany',
    studentCount: 850,
    teacherCount: 62,
    joinedFL: '2024-03-01',
    privacyStatus: 'compliant',
    models: [
      {
        modelName: 'RecSys-FL',
        version: 'v3.2',
        type: 'recommendation',
        localAccuracy: 97.2,
        globalAccuracy: 96.1,
        flContributions: 189,
        lastSync: '2 hours ago',
        status: 'synced',
        dataPoints: 42500,
      },
      {
        modelName: 'RecSys-FL',
        version: 'v3.0',
        type: 'recommendation',
        localAccuracy: 95.1,
        globalAccuracy: 94.5,
        flContributions: 156,
        lastSync: '1 day ago',
        status: 'synced',
        dataPoints: 38200,
      },
      {
        modelName: 'TinyLlama-FL',
        version: 'v2.1',
        type: 'genai',
        localAccuracy: 94.5,
        globalAccuracy: 93.8,
        flContributions: 112,
        lastSync: '4 hours ago',
        status: 'synced',
        dataPoints: 28000,
      },
      {
        modelName: 'DistilGPT-FL',
        version: 'v1.8',
        type: 'genai',
        localAccuracy: 92.3,
        globalAccuracy: 91.5,
        flContributions: 87,
        lastSync: '1 day ago',
        status: 'synced',
        dataPoints: 22400,
      },
    ],
  },
  {
    id: 'school-2',
    name: 'Grundschule am Park Hamburg',
    code: 'GAP-HH',
    location: 'Hamburg, Germany',
    studentCount: 420,
    teacherCount: 35,
    joinedFL: '2024-08-15',
    privacyStatus: 'compliant',
    models: [
      {
        modelName: 'RecSys-FL',
        version: 'v3.2',
        type: 'recommendation',
        localAccuracy: 95.8,
        globalAccuracy: 96.1,
        flContributions: 134,
        lastSync: '6 hours ago',
        status: 'synced',
        dataPoints: 18700,
      },
      {
        modelName: 'RecSys-FL',
        version: 'v2.5',
        type: 'recommendation',
        localAccuracy: 92.0,
        globalAccuracy: 91.8,
        flContributions: 98,
        lastSync: '3 days ago',
        status: 'synced',
        dataPoints: 15200,
      },
      {
        modelName: 'TinyLlama-FL',
        version: 'v2.1',
        type: 'genai',
        localAccuracy: 93.1,
        globalAccuracy: 93.8,
        flContributions: 78,
        lastSync: '12 hours ago',
        status: 'synced',
        dataPoints: 12500,
      },
      {
        modelName: 'DistilGPT-FL',
        version: 'v1.8',
        type: 'genai',
        localAccuracy: 90.8,
        globalAccuracy: 91.5,
        flContributions: 65,
        lastSync: '2 days ago',
        status: 'training',
        dataPoints: 10800,
      },
    ],
  },
  {
    id: 'school-3',
    name: 'Realschule Stuttgart',
    code: 'RS-STG',
    location: 'Stuttgart, Germany',
    studentCount: 620,
    teacherCount: 48,
    joinedFL: '2025-11-01',
    privacyStatus: 'compliant',
    models: [
      {
        modelName: 'RecSys-FL',
        version: 'v3.2',
        type: 'recommendation',
        localAccuracy: 94.3,
        globalAccuracy: 96.1,
        flContributions: 45,
        lastSync: '1 hour ago',
        status: 'synced',
        dataPoints: 8900,
      },
      {
        modelName: 'TinyLlama-FL',
        version: 'v2.1',
        type: 'genai',
        localAccuracy: 91.7,
        globalAccuracy: 93.8,
        flContributions: 32,
        lastSync: '3 hours ago',
        status: 'training',
        dataPoints: 6200,
      },
      {
        modelName: 'DistilGPT-FL',
        version: 'v1.8',
        type: 'genai',
        localAccuracy: 88.4,
        globalAccuracy: 91.5,
        flContributions: 21,
        lastSync: '8 hours ago',
        status: 'pending',
        dataPoints: 4100,
      },
    ],
  },
]

export default function SchoolModelsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Network className="h-6 w-6 text-cyan-500" />
          School-wise Model Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Federated learning models deployed per school - data never leaves the school
        </p>
      </div>

      {/* School Cards */}
      <div className="space-y-6">
        {schools.map((school) => (
          <Card key={school.id} className="border-border/50 overflow-hidden">
            <div
              className="h-1"
              style={{
                background: school.id === 'school-1'
                  ? 'linear-gradient(90deg, #8b5cf6, #6366f1)'
                  : school.id === 'school-2'
                  ? 'linear-gradient(90deg, #06b6d4, #3b82f6)'
                  : 'linear-gradient(90deg, #10b981, #14b8a6)',
              }}
            />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted/50">
                    <Building2 className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{school.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-0.5">
                      <span>{school.location}</span>
                      <span>|</span>
                      <span>{school.code}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    GDPR {school.privacyStatus}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Joined FL: {school.joinedFL}
                  </Badge>
                </div>
              </div>

              {/* School stats */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{school.studentCount} students</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{school.teacherCount} teachers</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" />
                  <span>{school.models.length} models deployed</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                {/* Table header */}
                <div className="grid grid-cols-7 gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <span className="col-span-2">Model</span>
                  <span>Local Acc.</span>
                  <span>Global Acc.</span>
                  <span>FL Contributions</span>
                  <span>Last Sync</span>
                  <span>Status</span>
                </div>

                {school.models.map((model, i) => {
                  const statusColors = {
                    synced: 'bg-emerald-500/10 text-emerald-600',
                    training: 'bg-amber-500/10 text-amber-600',
                    pending: 'bg-slate-500/10 text-slate-500',
                  }
                  const delta = model.localAccuracy - model.globalAccuracy

                  return (
                    <div
                      key={`${model.modelName}-${model.version}-${i}`}
                      className="grid grid-cols-7 gap-2 px-3 py-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors items-center"
                    >
                      <div className="col-span-2 flex items-center gap-2">
                        {model.type === 'recommendation' ? (
                          <BookOpen className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                        ) : (
                          <Cpu className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-foreground">{model.modelName} {model.version}</p>
                          <p className="text-[10px] text-muted-foreground">{model.dataPoints.toLocaleString()} data points</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{model.localAccuracy}%</p>
                        <div className="w-full mt-1">
                          <Progress value={model.localAccuracy} className="h-1" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{model.globalAccuracy}%</p>
                      </div>
                      <div className="text-xs text-foreground">{model.flContributions}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {model.lastSync}
                      </div>
                      <div>
                        <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 ${statusColors[model.status]}`}>
                          {model.status}
                        </Badge>
                        {delta > 0 && (
                          <span className="text-[10px] text-emerald-500 flex items-center mt-0.5">
                            <ArrowUpRight className="h-2.5 w-2.5" />+{delta.toFixed(1)}% local
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
