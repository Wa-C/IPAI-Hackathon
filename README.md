# COPA - Federated AI Education Platform

COPA is a privacy-first, AI-powered education platform built for European schools. It combines federated learning with personalized teaching tools, ensuring student data never leaves the school while AI models get smarter together.

## Final Code

**The final code is in the `final-code` branch.**

```
git checkout final-code
```

## What is COPA?

COPA operates two types of federated learning pipelines:

1. **Learning Recommendation System** - Federated collaborative filtering trained on student learning data across schools (using Flower/flwr)
2. **Federated Fine-tuned GenAI Models** - DistilGPT2 (full fine-tune) and TinyLlama (LoRA adapter) fine-tuned on educational Q&A data

All training happens locally at each school. Only model weights are shared — never raw student data.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, Python, Supabase |
| AI/ML | PyTorch, Hugging Face Transformers, PEFT (LoRA), Flower (Federated Learning) |
| Database | Supabase (PostgreSQL), ChromaDB (Vector Store) |
| LLM | Mistral AI (tailored for education) |
| Chatbot | RAG pipeline with Mistral AI integration |

## Features

### For Students
- Personalized learning paths (Read, Play, Watch modes)
- Gamification with achievements and streaks
- AI-powered chatbot tutor

### For Teachers
- AI Lesson Builder with differentiated content generation
- Bias Scanner for inclusive materials
- Fairness Lab to verify AI recommendation equity
- Analytics dashboard

### For Admins
- **Global Model Registry** — Timeline of all federated models (oldest to newest)
- **School-wise Model Overview** — Per-school model deployment with local vs global accuracy
- **Model Performance Rankings** — Leaderboard ranked by accuracy, F1, precision, recall, latency
- **Fed Pipeline Viewer** — Visual step-by-step view of actual training notebook cells with code and outputs
- **Push to Production** — Deploy fine-tuned models (DistilGPT2, TinyLlama LoRA) to the federated network

### Privacy & Compliance
- GDPR compliant
- EU data centers
- Federated learning — data stays at each school
- Differential privacy budgets tracked per model

## Project Structure

```
├── app/                    # Next.js pages (admin, auth, student, teacher)
├── backend/                # FastAPI backend
│   ├── app/                # API routes, models, services
│   ├── supabase/           # Database schemas
│   └── data/               # ChromaDB vector store
├── chatbot/                # Standalone chatbot module
├── components/             # React components (UI, shell, logo)
├── Fine Tuning/            # ML notebooks and model artifacts
│   ├── GenAI-model-comare.ipynb   # DistilGPT2 + TinyLlama fine-tuning
│   ├── test2.ipynb                # Federated learning RecSys with Flower
│   ├── distilgpt2_finetuned/      # Trained model weights (gitignored)
│   └── tinyllama_lora_adapter/    # LoRA adapter weights (gitignored)
├── lib/                    # Auth context, types, mock data, i18n
└── public/                 # Static assets
```

## Getting Started

### Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env    # Fill in your Supabase and API keys
python run.py
```

API runs at [http://localhost:8000](http://localhost:8000)

## Login Roles

| Role | What you see |
|------|-------------|
| **Student** | Learning dashboard, lessons, achievements, preferences |
| **Teacher** | Lesson builder, bias scanner, fairness lab, analytics |
| **Admin** | FL model management, pipelines, push to production |

## AI Models

### General LLM - Mistral AI

COPA uses **Mistral AI** as its general-purpose language model, tailored specifically for the education system. Mistral powers:

- **Lesson content generation** — Creating differentiated learning materials aligned to curriculum standards
- **Bias scanning** — Detecting cultural, gender, and accessibility bias in teaching materials
- **Chatbot tutor** — RAG-powered conversational AI that helps students with Q&A, exercises, and explanations
- **Content differentiation** — Adapting materials for struggling, on-track, and advanced learners

The Mistral integration runs through the FastAPI backend and is combined with a ChromaDB-based RAG pipeline for context-aware, document-grounded responses.

### Fine-Tuned Models

| Model | Type | Params | Method |
|-------|------|--------|--------|
| DistilGPT2-FL | GPT2LMHeadModel | 81.9M (100% trainable) | Full fine-tune, 2 epochs |
| TinyLlama-FL | LlamaForCausalLM | 4.5M / 1.1B (0.41% trainable) | LoRA r=16, alpha=32, 1 epoch |

## Team

COPA was produced by **EduBridge**
