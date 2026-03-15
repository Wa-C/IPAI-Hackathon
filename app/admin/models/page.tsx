'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Globe,
  ArrowUpRight,
  Cpu,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react'

interface ModelEntry {
  id: string
  name: string
  version: string
  type: 'recommendation' | 'genai'
  baseModel?: string
  accuracy: number
  f1Score: number
  flRounds: number
  createdAt: string
  status: 'active' | 'deprecated' | 'training'
  description: string
  improvementFromPrev: number
}

const globalModels: ModelEntry[] = [
  // Learning Recommendation System models (oldest to newest)
  {
    id: 'recsys-1',
    name: 'RecSys-FL',
    version: 'v1.0',
    type: 'recommendation',
    accuracy: 78.3,
    f1Score: 0.76,
    flRounds: 120,
    createdAt: '2024-03-15',
    status: 'deprecated',
    description: 'Initial federated collaborative filtering model for learning path recommendations',
    improvementFromPrev: 0,
  },
  {
    id: 'recsys-2',
    name: 'RecSys-FL',
    version: 'v1.5',
    type: 'recommendation',
    accuracy: 83.7,
    f1Score: 0.81,
    flRounds: 210,
    createdAt: '2024-07-22',
    status: 'deprecated',
    description: 'Improved feature engineering with student engagement signals',
    improvementFromPrev: 5.4,
  },
  {
    id: 'recsys-3',
    name: 'RecSys-FL',
    version: 'v2.0',
    type: 'recommendation',
    accuracy: 88.2,
    f1Score: 0.86,
    flRounds: 340,
    createdAt: '2024-11-10',
    status: 'deprecated',
    description: 'Added multi-modal learning preference detection with differential privacy',
    improvementFromPrev: 4.5,
  },
  {
    id: 'recsys-4',
    name: 'RecSys-FL',
    version: 'v2.5',
    type: 'recommendation',
    accuracy: 91.8,
    f1Score: 0.90,
    flRounds: 430,
    createdAt: '2025-04-18',
    status: 'deprecated',
    description: 'Introduced attention mechanism for temporal learning patterns',
    improvementFromPrev: 3.6,
  },
  {
    id: 'recsys-5',
    name: 'RecSys-FL',
    version: 'v3.0',
    type: 'recommendation',
    accuracy: 94.5,
    f1Score: 0.93,
    flRounds: 490,
    createdAt: '2025-09-05',
    status: 'active',
    description: 'Transformer-based architecture with federated attention aggregation',
    improvementFromPrev: 2.7,
  },
  {
    id: 'recsys-6',
    name: 'RecSys-FL',
    version: 'v3.2',
    type: 'recommendation',
    accuracy: 96.1,
    f1Score: 0.95,
    flRounds: 523,
    createdAt: '2026-01-20',
    status: 'active',
    description: 'Latest model with cross-school knowledge distillation and enhanced privacy guarantees',
    improvementFromPrev: 1.6,
  },
  // GenAI fine-tuned models (oldest to newest)
  {
    id: 'genai-1',
    name: 'DistilGPT-FL',
    version: 'v1.0',
    type: 'genai',
    baseModel: 'DistilGPT-2',
    accuracy: 74.2,
    f1Score: 0.71,
    flRounds: 80,
    createdAt: '2024-06-01',
    status: 'deprecated',
    description: 'First federated fine-tuned DistilGPT for educational content generation',
    improvementFromPrev: 0,
  },
  {
    id: 'genai-2',
    name: 'DistilGPT-FL',
    version: 'v1.4',
    type: 'genai',
    baseModel: 'DistilGPT-2',
    accuracy: 82.1,
    f1Score: 0.79,
    flRounds: 150,
    createdAt: '2024-10-15',
    status: 'deprecated',
    description: 'Improved with curriculum-aligned training data and LoRA adapters',
    improvementFromPrev: 7.9,
  },
  {
    id: 'genai-3',
    name: 'DistilGPT-FL',
    version: 'v1.8',
    type: 'genai',
    baseModel: 'DistilGPT-2',
    accuracy: 91.5,
    f1Score: 0.89,
    flRounds: 245,
    createdAt: '2025-06-20',
    status: 'active',
    description: 'Enhanced with RLHF from teacher feedback and federated adapter merging',
    improvementFromPrev: 9.4,
  },
  {
    id: 'genai-4',
    name: 'TinyLlama-FL',
    version: 'v1.0',
    type: 'genai',
    baseModel: 'TinyLlama-1.1B',
    accuracy: 85.6,
    f1Score: 0.83,
    flRounds: 100,
    createdAt: '2025-02-10',
    status: 'deprecated',
    description: 'First TinyLlama federated fine-tune for multilingual educational Q&A',
    improvementFromPrev: 0,
  },
  {
    id: 'genai-5',
    name: 'TinyLlama-FL',
    version: 'v1.5',
    type: 'genai',
    baseModel: 'TinyLlama-1.1B',
    accuracy: 89.9,
    f1Score: 0.87,
    flRounds: 180,
    createdAt: '2025-08-01',
    status: 'active',
    description: 'Added bias-aware training with inclusive content generation',
    improvementFromPrev: 4.3,
  },
  {
    id: 'genai-6',
    name: 'TinyLlama-FL',
    version: 'v2.1',
    type: 'genai',
    baseModel: 'TinyLlama-1.1B',
    accuracy: 93.8,
    f1Score: 0.92,
    flRounds: 324,
    createdAt: '2026-02-01',
    status: 'active',
    description: 'Latest model with cross-lingual federated fine-tuning (DE/EN/FR) and safety guardrails',
    improvementFromPrev: 3.9,
  },
]

export default function GlobalModelsPage() {
  const recModels = globalModels.filter(m => m.type === 'recommendation').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const genaiModels = globalModels.filter(m => m.type === 'genai').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Globe className="h-6 w-6 text-violet-500" />
          Global Model Registry
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete timeline of all federated models from oldest to newest
        </p>
      </div>

      {/* Learning Recommendation Models */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-violet-500/10">
            <BookOpen className="h-4 w-4 text-violet-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Learning Recommendation System</h2>
          <Badge variant="secondary" className="text-xs">{recModels.length} models</Badge>
        </div>

        <div className="space-y-3">
          {recModels.map((model, idx) => (
            <ModelCard key={model.id} model={model} index={idx} />
          ))}
        </div>
      </section>

      {/* GenAI Fine-tuned Models */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-cyan-500/10">
            <Cpu className="h-4 w-4 text-cyan-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Federated Fine-tuned GenAI Models</h2>
          <Badge variant="secondary" className="text-xs">{genaiModels.length} models</Badge>
        </div>

        <div className="space-y-3">
          {genaiModels.map((model, idx) => (
            <ModelCard key={model.id} model={model} index={idx} />
          ))}
        </div>
      </section>
    </div>
  )
}

function ModelCard({ model, index }: { model: ModelEntry; index: number }) {
  const statusColors = {
    active: 'bg-emerald-500/10 text-emerald-600',
    deprecated: 'bg-slate-500/10 text-slate-500',
    training: 'bg-amber-500/10 text-amber-600',
  }

  return (
    <Card className="border-border/50 hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Timeline indicator */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className={`w-3 h-3 rounded-full ${model.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <div className="w-px h-full bg-border" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground">{model.name} {model.version}</h3>
              <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 ${statusColors[model.status]}`}>
                {model.status}
              </Badge>
              {model.baseModel && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  {model.baseModel}
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-1">{model.description}</p>

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Accuracy:</span>
                <span className="text-xs font-bold text-foreground">{model.accuracy}%</span>
                {model.improvementFromPrev > 0 && (
                  <span className="text-[10px] text-emerald-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3" />+{model.improvementFromPrev}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">F1:</span>
                <span className="text-xs font-bold text-foreground">{model.f1Score}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{model.flRounds} FL rounds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{model.createdAt}</span>
              </div>
            </div>

            <div className="mt-2">
              <Progress value={model.accuracy} className="h-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
