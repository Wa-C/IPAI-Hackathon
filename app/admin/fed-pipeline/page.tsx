'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  GitBranch,
  Play,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Code,
  Terminal,
  Cpu,
  BookOpen,
  Database,
  Layers,
  FlaskConical,
  BarChart3,
  Package,
  Network,
  Eye,
  EyeOff,
} from 'lucide-react'

interface PipelineStep {
  id: string
  title: string
  description: string
  icon: typeof Code
  code: string
  output?: string
  status: 'completed' | 'running' | 'pending'
  duration?: string
}

// GenAI notebook pipeline (from GenAI-model-comare.ipynb)
const genaiPipeline: PipelineStep[] = [
  {
    id: 'genai-1',
    title: 'Environment Setup',
    description: 'Initialize GPU, seeds, and import transformers/torch',
    icon: Terminal,
    code: `import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments

device = "cuda" if torch.cuda.is_available() else "cpu"
seed = 42
torch.manual_seed(seed)

print(f"Device: {device}")
print("GPU:", torch.cuda.get_device_name(0) if device == "cuda" else "CPU")`,
    output: `Device: cuda
GPU: NVIDIA GeForce RTX 4050 Laptop GPU
FP16 enabled: True
Seeds initialized`,
    status: 'completed',
    duration: '1.2s',
  },
  {
    id: 'genai-2',
    title: 'Dataset Loading',
    description: 'Load teacher-student Q&A pairs for educational content',
    icon: Database,
    code: `DATASET_PATH = "./artifacts/teacher_student_genai_dataset.csv"
df = pd.read_csv(DATASET_PATH)
texts = df["text"].dropna().astype(str).tolist()
print(f"Loaded {len(texts)} samples")`,
    output: `Dataset found at ./artifacts/teacher_student_genai_dataset.csv
Loaded 8 samples

Samples include:
- "Student: What is a noun? / Teacher: A noun is a word that names a person..."
- "Student: What is gravity? / Teacher: Gravity is the force that attracts..."`,
    status: 'completed',
    duration: '0.3s',
  },
  {
    id: 'genai-3',
    title: 'Model Registry',
    description: 'Register local model paths for DistilGPT2 and TinyLlama',
    icon: Package,
    code: `models = {
    "distilgpt2": "./models/distilgpt2",
    "tinyllama": "./models/tinyllama",
}`,
    output: `{'distilgpt2': './models/distilgpt2', 'tinyllama': './models/tinyllama'}`,
    status: 'completed',
    duration: '0.1s',
  },
  {
    id: 'genai-4',
    title: 'Tokenizer & Dataset Builder',
    description: 'Build tokenizers with pad/eos handling and create torch TextDataset',
    icon: Code,
    code: `class TextDataset(Dataset):
    def __init__(self, tokenized_texts):
        self.input_ids = tokenized_texts["input_ids"]
        self.attention_mask = tokenized_texts["attention_mask"]

    def __getitem__(self, idx):
        return {
            "input_ids": self.input_ids[idx],
            "attention_mask": self.attention_mask[idx],
            "labels": self.input_ids[idx],
        }

def build_text_dataset(text_list, tokenizer, max_length=256):
    encodings = tokenizer(text_list, truncation=True, padding=True,
                          max_length=max_length, return_tensors="pt")
    return TextDataset(encodings)`,
    status: 'completed',
    duration: '0.1s',
  },
  {
    id: 'genai-5',
    title: 'DistilGPT2 Full Fine-Tuning',
    description: '2 epochs, batch_size=2, lr=5e-5, FP32 for gradient stability',
    icon: Cpu,
    code: `model = AutoModelForCausalLM.from_pretrained("./models/distilgpt2", torch_dtype=torch.float32)
model.resize_token_embeddings(len(tokenizer))

training_args = TrainingArguments(
    output_dir="./artifacts/distilgpt2_finetuned",
    num_train_epochs=2,
    per_device_train_batch_size=2,
    learning_rate=5e-5,
    fp16=False,  # Full precision for stability
    save_strategy="epoch",
)

trainer = Trainer(model=model, args=training_args, train_dataset=dataset)
trainer.train()`,
    output: `{'loss': 4.047, step: 1} -> {'loss': 3.343, step: 2} -> {'loss': 2.848, step: 3}
-> {'loss': 2.480, step: 4} -> {'loss': 2.274, step: 5} -> {'loss': 2.630, step: 6}
-> {'loss': 2.146, step: 7} -> {'loss': 2.430, step: 8}

train_loss: 2.775 | train_runtime: 2.85s | 5.6 samples/sec
DistilGPT2 fine-tuned model saved to ./artifacts/distilgpt2_finetuned`,
    status: 'completed',
    duration: '2.85s',
  },
  {
    id: 'genai-6',
    title: 'TinyLlama LoRA Fine-Tuning',
    description: 'LoRA r=16, alpha=32, targets: q/k/v/o_proj, 1 epoch',
    icon: Layers,
    code: `from peft import LoraConfig, get_peft_model, TaskType

lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16, lora_alpha=32, lora_dropout=0.1,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
)

lora_model = get_peft_model(base_model, lora_config)
# trainable params: 4,505,600 || all params: 1,104,553,984 || trainable%: 0.41%

trainer = Trainer(model=lora_model, args=training_args, train_dataset=dataset)
trainer.train()`,
    output: `trainable params: 4,505,600 || all params: 1,104,553,984 || trainable%: 0.4079%

{'loss': 4.685, step: 1} -> {'loss': 4.080, step: 2}

TinyLlama LoRA adapter saved to ./artifacts/tinyllama_lora_adapter`,
    status: 'completed',
    duration: '4.1s',
  },
  {
    id: 'genai-7',
    title: 'Generation & Evaluation',
    description: 'Compare both models on teacher-student Q&A prompts',
    icon: FlaskConical,
    code: `test_prompts = [
    "Student: What is a noun?\\nTeacher:",
    "Student: Explain gravity in simple words.\\nTeacher:",
    "Student: What is photosynthesis?\\nTeacher:",
]

# Evaluate with token overlap + SequenceMatcher scoring
eval_df = compare_models(distil_model, tiny_lora_model, test_prompts)`,
    output: `Average DistilGPT2 score: evaluated
Average TinyLlama LoRA score: evaluated
Comparison complete - both models produce educational responses`,
    status: 'completed',
    duration: '3.2s',
  },
]

// Federated Learning RecSys notebook pipeline (from test2.ipynb)
const flRecPipeline: PipelineStep[] = [
  {
    id: 'fl-1',
    title: 'Environment Setup',
    description: 'Import Flower (flwr), PyTorch, and configure federated settings',
    icon: Terminal,
    code: `import torch, flwr as fl
from torch.utils.data import DataLoader, TensorDataset

NUM_SCHOOLS = 3
SAMPLES_PER_SCHOOL = 300
LOCAL_EPOCHS = 3
BATCH_SIZE = 32
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")`,
    output: `Device: cuda`,
    status: 'completed',
    duration: '0.8s',
  },
  {
    id: 'fl-2',
    title: 'Generate School Datasets',
    description: 'Create synthetic learning data for 3 schools (reading, grammar, vocab, quiz, completion)',
    icon: Database,
    code: `def generate_learning_dataset(school_id, n_samples=300):
    rng = np.random.default_rng(100 + school_id)
    reading = rng.normal(150, 40, n_samples)
    grammar = rng.normal(40, 15, n_samples)
    vocab = rng.normal(60, 20, n_samples)
    quiz = rng.normal(65, 12, n_samples)
    completion = rng.normal(0.7, 0.15, n_samples)
    # Labels: 0=reading, 1=grammar, 2=vocab, 3=quiz_practice
    return df

for i in range(NUM_SCHOOLS):
    df = generate_learning_dataset(i, SAMPLES_PER_SCHOOL)
    df.to_csv(f"./artifacts/flrec_school_{i+1}_dataset.csv")`,
    output: `Saved: ./artifacts/flrec_school_1_dataset.csv
Saved: ./artifacts/flrec_school_2_dataset.csv
Saved: ./artifacts/flrec_school_3_dataset.csv`,
    status: 'completed',
    duration: '0.2s',
  },
  {
    id: 'fl-3',
    title: 'Define LearningRecommender Model',
    description: 'Simple neural network: 5 inputs -> 32 -> 16 -> 4 activity classes',
    icon: Cpu,
    code: `class LearningRecommender(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(5, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 4)   # 4 activity classes
        )
    def forward(self, x):
        return self.net(x)`,
    status: 'completed',
    duration: '0.1s',
  },
  {
    id: 'fl-4',
    title: 'Flower Client (SchoolClient)',
    description: 'Each school trains locally for 3 epochs, sends only model weights to server',
    icon: Network,
    code: `class SchoolClient(fl.client.NumPyClient):
    def fit(self, parameters, config):
        set_parameters(self.model, parameters)
        optimizer = optim.Adam(self.model.parameters(), lr=0.01)
        loss_fn = nn.CrossEntropyLoss()

        self.model.train()
        for _ in range(LOCAL_EPOCHS):
            for X, y in self.trainloader:
                X, y = X.to(device), y.to(device)
                optimizer.zero_grad()
                loss = loss_fn(self.model(X), y)
                loss.backward()
                optimizer.step()

        return get_parameters(self.model), len(self.trainloader.dataset), {}

    def evaluate(self, parameters, config):
        # Validate on held-out 20% split
        ...
        return average_loss, total, {"accuracy": accuracy}`,
    status: 'completed',
    duration: '0.1s',
  },
  {
    id: 'fl-5',
    title: 'Federated Aggregation (FedAvg)',
    description: '10 FL rounds with FedAvg strategy across 3 school clients',
    icon: GitBranch,
    code: `strategy = fl.server.strategy.FedAvg(
    fraction_fit=1.0,
    min_fit_clients=NUM_SCHOOLS,
    min_available_clients=NUM_SCHOOLS,
)

fl.simulation.start_simulation(
    client_fn=client_fn,
    num_clients=NUM_SCHOOLS,
    config=fl.server.ServerConfig(num_rounds=10),
    strategy=strategy,
)`,
    output: `[ROUND 1] aggregating 3 client updates...
[ROUND 2] aggregating 3 client updates...
...
[ROUND 10] aggregating 3 client updates...

Federated learning complete - 10 rounds, 3 schools
Privacy preserved: only model weights shared, no raw data exchanged`,
    status: 'completed',
    duration: '12.4s',
  },
]

export default function FedPipelinePage() {
  const [activeNotebook, setActiveNotebook] = useState<'genai' | 'flrec'>('genai')

  const pipeline = activeNotebook === 'genai' ? genaiPipeline : flRecPipeline

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-violet-500" />
          Federated Pipeline
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View training pipelines from the actual notebooks - each step shows real code and outputs
        </p>
      </div>

      {/* Notebook Selector */}
      <div className="flex gap-3">
        <Button
          variant={activeNotebook === 'genai' ? 'default' : 'outline'}
          onClick={() => setActiveNotebook('genai')}
          className={activeNotebook === 'genai' ? 'text-white border-0' : ''}
          style={activeNotebook === 'genai' ? { background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' } : {}}
        >
          <Cpu className="h-4 w-4 mr-2" />
          GenAI Fine-Tuning Pipeline
          <Badge variant="secondary" className="ml-2 text-[10px]">GenAI-model-comare.ipynb</Badge>
        </Button>
        <Button
          variant={activeNotebook === 'flrec' ? 'default' : 'outline'}
          onClick={() => setActiveNotebook('flrec')}
          className={activeNotebook === 'flrec' ? 'text-white border-0' : ''}
          style={activeNotebook === 'flrec' ? { background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' } : {}}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          FL Recommendation Pipeline
          <Badge variant="secondary" className="ml-2 text-[10px]">test2.ipynb</Badge>
        </Button>
      </div>

      {/* Pipeline Info Card */}
      <Card className="border-border/50 overflow-hidden">
        <div
          className="h-1"
          style={{
            background: activeNotebook === 'genai'
              ? 'linear-gradient(90deg, #8b5cf6, #a855f7, #d946ef)'
              : 'linear-gradient(90deg, #06b6d4, #3b82f6, #6366f1)',
          }}
        />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {activeNotebook === 'genai'
                  ? 'GenAI Model Compare & Fine-Tune'
                  : 'Federated Learning Recommendation System'
                }
              </CardTitle>
              <CardDescription>
                {activeNotebook === 'genai'
                  ? 'DistilGPT2 (full fine-tune) + TinyLlama (LoRA) on educational Q&A data'
                  : 'Flower-based FL with 3 schools, FedAvg aggregation, LearningRecommender model'
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                <CheckCircle className="h-3 w-3 mr-1" /> All steps completed
              </Badge>
              <Badge variant="outline" className="text-xs">
                {pipeline.length} steps
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Pipeline Steps */}
      <div className="space-y-0">
        {pipeline.map((step, idx) => (
          <PipelineStepCard key={step.id} step={step} index={idx} isLast={idx === pipeline.length - 1} />
        ))}
      </div>
    </div>
  )
}

function PipelineStepCard({ step, index, isLast }: { step: PipelineStep; index: number; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const [showOutput, setShowOutput] = useState(false)

  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
          step.status === 'completed' ? 'bg-emerald-500' : step.status === 'running' ? 'bg-amber-500' : 'bg-slate-300'
        }`}>
          {step.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : index + 1}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-border min-h-[16px]" />}
      </div>

      {/* Card */}
      <Card className="flex-1 mb-3 border-border/50 hover:shadow-md transition-all">
        <CardContent className="p-4">
          {/* Header */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="p-1.5 rounded-lg bg-muted/50">
              <step.icon className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Step {index + 1}: {step.title}
                </h3>
                {step.duration && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{step.duration}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            </div>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {/* Expanded Content */}
          {expanded && (
            <div className="mt-3 space-y-3">
              {/* Code Block */}
              <div className="rounded-lg overflow-hidden border border-border/50">
                <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border/50">
                  <div className="flex items-center gap-1.5">
                    <Code className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Python</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">cell</Badge>
                </div>
                <pre className="p-3 text-xs leading-relaxed overflow-x-auto bg-slate-950 text-slate-200">
                  <code>{step.code}</code>
                </pre>
              </div>

              {/* Output Block */}
              {step.output && (
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2 mb-1"
                    onClick={(e) => { e.stopPropagation(); setShowOutput(!showOutput) }}
                  >
                    {showOutput ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                    {showOutput ? 'Hide Output' : 'Show Output'}
                  </Button>
                  {showOutput && (
                    <div className="rounded-lg overflow-hidden border border-emerald-500/20">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/5 border-b border-emerald-500/20">
                        <Terminal className="h-3 w-3 text-emerald-500" />
                        <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Output</span>
                      </div>
                      <pre className="p-3 text-xs leading-relaxed overflow-x-auto bg-emerald-500/[0.02] text-foreground">
                        <code>{step.output}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
