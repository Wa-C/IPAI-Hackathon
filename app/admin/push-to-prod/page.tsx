'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Rocket,
  Cpu,
  Layers,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  FileCode,
  HardDrive,
  GitBranch,
  ArrowRight,
  Loader2,
  Package,
  Server,
  Globe,
} from 'lucide-react'

type DeployStatus = 'idle' | 'validating' | 'deploying' | 'deployed' | 'error'

interface TrainedModel {
  id: string
  name: string
  type: 'full-finetune' | 'lora-adapter'
  baseModel: string
  architecture: string
  path: string
  checkpoints: string[]
  finalLoss: number
  epochs: number
  trainableParams: string
  totalParams: string
  trainablePercent: string
  fileSize: string
  trainingTime: string
  loraConfig?: {
    r: number
    alpha: number
    dropout: number
    targetModules: string[]
  }
  trainingLog: { step: number; loss: number; epoch: number }[]
}

const trainedModels: TrainedModel[] = [
  {
    id: 'distilgpt2-ft',
    name: 'DistilGPT2-FL Fine-tuned',
    type: 'full-finetune',
    baseModel: 'DistilGPT2 (GPT2LMHeadModel)',
    architecture: '6 layers, 768 embed dim, 12 heads, 50257 vocab',
    path: 'Fine Tuning/distilgpt2_finetuned/',
    checkpoints: ['checkpoint-4 (epoch 1)', 'checkpoint-8 (epoch 2)', 'final'],
    finalLoss: 2.430,
    epochs: 2,
    trainableParams: '81,912,576',
    totalParams: '81,912,576',
    trainablePercent: '100%',
    fileSize: '~328 MB',
    trainingTime: '2.85s',
    trainingLog: [
      { step: 1, loss: 4.047, epoch: 0.25 },
      { step: 2, loss: 3.343, epoch: 0.50 },
      { step: 3, loss: 2.848, epoch: 0.75 },
      { step: 4, loss: 2.480, epoch: 1.00 },
      { step: 5, loss: 2.274, epoch: 1.25 },
      { step: 6, loss: 2.630, epoch: 1.50 },
      { step: 7, loss: 2.146, epoch: 1.75 },
      { step: 8, loss: 2.430, epoch: 2.00 },
    ],
  },
  {
    id: 'tinyllama-lora',
    name: 'TinyLlama-FL LoRA Adapter',
    type: 'lora-adapter',
    baseModel: 'TinyLlama-1.1B (LlamaForCausalLM)',
    architecture: '22 layers, 2048 embed dim, 32 heads, 32000 vocab',
    path: 'Fine Tuning/tinyllama_lora_adapter/',
    checkpoints: ['checkpoint-2 (epoch 1)', 'final'],
    finalLoss: 4.080,
    epochs: 1,
    trainableParams: '4,505,600',
    totalParams: '1,104,553,984',
    trainablePercent: '0.41%',
    fileSize: '~18 MB (adapter only)',
    trainingTime: '4.1s',
    loraConfig: {
      r: 16,
      alpha: 32,
      dropout: 0.1,
      targetModules: ['q_proj', 'k_proj', 'v_proj', 'o_proj'],
    },
    trainingLog: [
      { step: 1, loss: 4.685, epoch: 0.50 },
      { step: 2, loss: 4.080, epoch: 1.00 },
    ],
  },
]

export default function PushToProdPage() {
  const [deployStatus, setDeployStatus] = useState<Record<string, DeployStatus>>({
    'distilgpt2-ft': 'idle',
    'tinyllama-lora': 'idle',
  })

  const handleDeploy = (modelId: string) => {
    setDeployStatus(prev => ({ ...prev, [modelId]: 'validating' }))

    setTimeout(() => {
      setDeployStatus(prev => ({ ...prev, [modelId]: 'deploying' }))
    }, 1500)

    setTimeout(() => {
      setDeployStatus(prev => ({ ...prev, [modelId]: 'deployed' }))
    }, 4000)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Rocket className="h-6 w-6 text-orange-500" />
          Push to Production
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Deploy fine-tuned models from the training pipeline to the federated production environment
        </p>
      </div>

      {/* Deployment Flow Overview */}
      <Card className="border-border/50 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500" />
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {[
              { icon: FileCode, label: 'Notebook Training', sublabel: 'Fine-tune complete' },
              { icon: Package, label: 'Model Artifacts', sublabel: 'Checkpoints saved' },
              { icon: Shield, label: 'Validation', sublabel: 'Privacy & safety checks' },
              { icon: Server, label: 'Staging', sublabel: 'Test deployment' },
              { icon: Globe, label: 'Production', sublabel: 'Live FL network' },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    i <= 1 ? 'bg-emerald-500/10' : 'bg-muted/50'
                  }`}>
                    <step.icon className={`h-5 w-5 ${i <= 1 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="text-[10px] font-semibold text-foreground mt-1">{step.label}</p>
                  <p className="text-[9px] text-muted-foreground">{step.sublabel}</p>
                </div>
                {i < 4 && (
                  <ArrowRight className={`h-4 w-4 shrink-0 mx-1 ${i < 1 ? 'text-emerald-500' : 'text-muted-foreground/30'}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Cards */}
      <div className="space-y-4">
        {trainedModels.map((model) => (
          <ModelDeployCard
            key={model.id}
            model={model}
            status={deployStatus[model.id]}
            onDeploy={() => handleDeploy(model.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ModelDeployCard({
  model,
  status,
  onDeploy,
}: {
  model: TrainedModel
  status: DeployStatus
  onDeploy: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  const statusConfig = {
    idle: { label: 'Ready to deploy', color: 'bg-slate-500/10 text-slate-500', icon: Clock },
    validating: { label: 'Validating...', color: 'bg-amber-500/10 text-amber-600', icon: Loader2 },
    deploying: { label: 'Deploying...', color: 'bg-blue-500/10 text-blue-600', icon: Loader2 },
    deployed: { label: 'Deployed to Production', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle },
    error: { label: 'Deployment failed', color: 'bg-red-500/10 text-red-600', icon: AlertTriangle },
  }

  const currentStatus = statusConfig[status]
  const StatusIcon = currentStatus.icon
  const isAnimating = status === 'validating' || status === 'deploying'

  return (
    <Card className="border-border/50 overflow-hidden hover:shadow-md transition-all">
      <div
        className="h-1"
        style={{
          background: model.type === 'full-finetune'
            ? 'linear-gradient(90deg, #8b5cf6, #a855f7, #d946ef)'
            : 'linear-gradient(90deg, #06b6d4, #3b82f6, #6366f1)',
        }}
      />
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Model icon */}
          <div className={`p-3 rounded-xl shrink-0 ${
            model.type === 'full-finetune' ? 'bg-violet-500/10' : 'bg-cyan-500/10'
          }`}>
            <Cpu className={`h-6 w-6 ${model.type === 'full-finetune' ? 'text-violet-500' : 'text-cyan-500'}`} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-foreground">{model.name}</h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                    {model.type === 'full-finetune' ? 'Full Fine-tune' : 'LoRA Adapter'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{model.baseModel}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={`text-xs border-0 ${currentStatus.color}`}>
                  <StatusIcon className={`h-3 w-3 mr-1 ${isAnimating ? 'animate-spin' : ''}`} />
                  {currentStatus.label}
                </Badge>
              </div>
            </div>

            {/* Key metrics */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">Final Loss:</span>
                <span className="text-xs font-bold text-foreground">{model.finalLoss}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">Epochs:</span>
                <span className="text-xs font-bold text-foreground">{model.epochs}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">Trainable:</span>
                <span className="text-xs font-bold text-foreground">{model.trainableParams} ({model.trainablePercent})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HardDrive className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-foreground">{model.fileSize}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-foreground">{model.trainingTime}</span>
              </div>
            </div>

            {/* Training loss mini chart */}
            <div className="mt-3 p-3 rounded-lg bg-muted/30">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Training Loss Curve</p>
              <div className="flex items-end gap-1 h-12">
                {model.trainingLog.map((entry, i) => {
                  const maxLoss = Math.max(...model.trainingLog.map(e => e.loss))
                  const heightPercent = (entry.loss / maxLoss) * 100
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className="text-[8px] text-muted-foreground">{entry.loss.toFixed(1)}</span>
                      <div
                        className="w-full rounded-sm transition-all"
                        style={{
                          height: `${heightPercent}%`,
                          minHeight: '4px',
                          background: model.type === 'full-finetune'
                            ? `rgba(139, 92, 246, ${0.3 + (1 - i / model.trainingLog.length) * 0.7})`
                            : `rgba(6, 182, 212, ${0.3 + (1 - i / model.trainingLog.length) * 0.7})`,
                        }}
                      />
                      <span className="text-[7px] text-muted-foreground">s{entry.step}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Expandable details */}
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-6 text-[10px] px-2"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </Button>

            {showDetails && (
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-muted/20">
                    <span className="text-[10px] text-muted-foreground">Architecture</span>
                    <p className="font-medium text-foreground">{model.architecture}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/20">
                    <span className="text-[10px] text-muted-foreground">Artifact Path</span>
                    <p className="font-medium text-foreground font-mono text-[11px]">{model.path}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/20">
                    <span className="text-[10px] text-muted-foreground">Checkpoints</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {model.checkpoints.map(cp => (
                        <Badge key={cp} variant="outline" className="text-[9px] px-1 py-0 h-3.5">{cp}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/20">
                    <span className="text-[10px] text-muted-foreground">Total Params</span>
                    <p className="font-medium text-foreground">{model.totalParams}</p>
                  </div>
                </div>

                {model.loraConfig && (
                  <div className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                    <span className="text-[10px] font-medium text-cyan-600 uppercase tracking-wider">LoRA Configuration</span>
                    <div className="grid grid-cols-4 gap-2 mt-1.5">
                      <div>
                        <span className="text-[10px] text-muted-foreground">Rank (r)</span>
                        <p className="text-xs font-bold text-foreground">{model.loraConfig.r}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground">Alpha</span>
                        <p className="text-xs font-bold text-foreground">{model.loraConfig.alpha}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground">Dropout</span>
                        <p className="text-xs font-bold text-foreground">{model.loraConfig.dropout}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground">Targets</span>
                        <p className="text-[10px] font-medium text-foreground">{model.loraConfig.targetModules.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Deploy button */}
            <div className="mt-4 flex items-center gap-3">
              {status === 'idle' && (
                <Button
                  onClick={onDeploy}
                  className="text-white border-0 shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
                  style={{
                    background: model.type === 'full-finetune'
                      ? 'linear-gradient(135deg, #8b5cf6, #a855f7, #d946ef)'
                      : 'linear-gradient(135deg, #06b6d4, #3b82f6, #6366f1)',
                  }}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Push to Production
                </Button>
              )}

              {(status === 'validating' || status === 'deploying') && (
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">
                      {status === 'validating' ? 'Running privacy & safety checks...' : 'Deploying to FL network...'}
                    </span>
                    <span className="font-medium text-foreground">
                      {status === 'validating' ? '40%' : '80%'}
                    </span>
                  </div>
                  <Progress value={status === 'validating' ? 40 : 80} className="h-2" />
                </div>
              )}

              {status === 'deployed' && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-semibold">Successfully deployed to production</span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-xs">
                    <Globe className="h-3 w-3 mr-1" /> Live on 3 schools
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
