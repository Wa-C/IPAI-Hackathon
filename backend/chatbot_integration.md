# Chatbot Integration Plan

## Status: PLANNING (do not implement until approved)

---

## 1. Overview

Integrate the COPA chatbot system into the main EdCopilot platform as a **floating chat widget** available on lesson pages. The chatbot becomes a tutoring companion for students working through lessons created by teachers.

### Guiding Principle
> **Keep the main system untouched. Add the chatbot alongside it.**

No existing frontend components, backend routes, or database tables will be modified. The chatbot is added as a new layer that reads from the existing data.

---

## 2. Feature Overlap Analysis

| Feature | Main System | Chatbot | Decision |
|---------|------------|---------|----------|
| Lesson creation | Lesson Builder (teacher) | Course upload (PDF) | **KEEP MAIN** - teacher creates lessons via builder |
| Student profiles | `student_profiles` + `learning_preferences` | `students` (SQLAlchemy) | **KEEP MAIN** - Supabase is source of truth |
| Learning modes | read/play/watch/flashcard | visual/auditory/kinesthetic/reading | **KEEP MAIN** - map to chatbot at runtime |
| Assessments | `assessments` table | exercise evaluation | **KEEP MAIN** for storage, use chatbot evaluator |
| Knowledge tracking | Not implemented | `knowledge_entries` with mastery | **ADD FROM CHATBOT** - new capability |
| AI content gen | Grok API (flashcard/reading) | Multi-LLM (tutor/exercises) | **KEEP BOTH** - different purposes |
| Bias scanning | Bias scanner | Not present | **KEEP MAIN** - no overlap |
| RAG / PDF search | PDF upload → base_material text | PDF → ChromaDB chunks | **ADD FROM CHATBOT** - enhances chat context |
| Gamification | Mock badges/points | Real badges with criteria | **ADD FROM CHATBOT** - real badge system |
| Dashboard | Teacher + Student dashboards | Teacher dashboard (basic) | **KEEP MAIN** - already richer |
| Reports | Not implemented | Weekly report generation | **ADD FROM CHATBOT** - new capability |

### Summary: What to integrate from chatbot
1. **Chat conversation engine** (tutor agent + COPA pedagogy)
2. **Exercise generation + evaluation** (quiz, open, game types)
3. **Knowledge tracking** (per-concept mastery)
4. **RAG pipeline** (ChromaDB for lesson material retrieval)
5. **Badge system** (real criteria-based awards)
6. **Report generation** (weekly student reports)

### What to NOT bring over
- Student CRUD (use existing Supabase student_profiles)
- Course upload UI (use existing lesson builder)
- Dashboard (use existing teacher/student dashboards)
- Frontend app shell (use existing Next.js app)

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────┐
│                   NEXT.JS FRONTEND                   │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Lesson       │  │ Student      │  │ Teacher   │ │
│  │ Builder      │  │ Lessons      │  │ Dashboard │ │
│  └──────────────┘  └──────┬───────┘  └───────────┘ │
│                           │                          │
│              ┌────────────┴────────────┐             │
│              │   FLOATING CHAT WIDGET  │             │
│              │   (ChatBubble component)│             │
│              └────────────┬────────────┘             │
│                           │                          │
└───────────────────────────┼──────────────────────────┘
                            │ REST API
┌───────────────────────────┼──────────────────────────┐
│              FASTAPI BACKEND (port 8000)             │
│                           │                          │
│  ┌────────────────────────┴───────────────────────┐  │
│  │          NEW: /api/v1/chat/* routes            │  │
│  │  POST /chat           - send message           │  │
│  │  POST /chat/exercise  - generate exercise      │  │
│  │  POST /chat/evaluate  - evaluate answer        │  │
│  │  GET  /chat/history   - session messages       │  │
│  │  GET  /chat/knowledge - student mastery map    │  │
│  │  GET  /chat/badges    - earned badges          │  │
│  └────────────────────────┬───────────────────────┘  │
│                           │                          │
│  ┌────────────────────────┴───────────────────────┐  │
│  │         NEW: app/services/chatbot/             │  │
│  │  tutor.py        - COPA conversation agent     │  │
│  │  exercise_gen.py - exercise generator          │  │
│  │  evaluator.py    - answer evaluator            │  │
│  │  llm_client.py   - Grok API wrapper            │  │
│  │  rag.py          - ChromaDB RAG pipeline       │  │
│  └────────────────────────────────────────────────┘  │
│                           │                          │
│           ┌───────────────┼───────────────┐          │
│           │               │               │          │
│       SUPABASE        CHROMADB        GROK API       │
│    (existing tables)  (new, local)   (existing key)  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 4. Database Changes

### 4a. New Supabase tables (NO changes to existing tables)

```sql
-- ============================================================
-- CHATBOT: KNOWLEDGE TRACKING
-- ============================================================
CREATE TABLE chat_knowledge (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    concept     TEXT NOT NULL,
    mastery     NUMERIC DEFAULT 0.0 CHECK (mastery >= 0.0 AND mastery <= 1.0),
    attempts    INT DEFAULT 0,
    correct     NUMERIC DEFAULT 0.0,
    struggles   JSONB DEFAULT '[]'::jsonb,
    last_seen   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (student_id, lesson_id, concept)
);

CREATE INDEX idx_chat_knowledge_student ON chat_knowledge(student_id);
CREATE INDEX idx_chat_knowledge_lesson  ON chat_knowledge(lesson_id);

-- ============================================================
-- CHATBOT: SESSIONS
-- ============================================================
CREATE TABLE chat_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    phase           TEXT DEFAULT 'warmup' CHECK (phase IN ('warmup', 'chat', 'exercise', 'wrapup')),
    messages        JSONB DEFAULT '[]'::jsonb,
    exercises_given INT DEFAULT 0,
    exercises_correct INT DEFAULT 0,
    started_at      TIMESTAMPTZ DEFAULT now(),
    ended_at        TIMESTAMPTZ,
    duration_minutes INT DEFAULT 0
);

CREATE INDEX idx_chat_sessions_student ON chat_sessions(student_id);

-- ============================================================
-- CHATBOT: BADGES
-- ============================================================
CREATE TABLE chat_badges (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    badge_type  TEXT NOT NULL,
    title       TEXT NOT NULL,
    description TEXT DEFAULT '',
    earned_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (student_id, badge_type)
);

-- RLS (same pattern as existing tables)
ALTER TABLE chat_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_badges    ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_knowledge_select ON chat_knowledge FOR SELECT USING (TRUE);
CREATE POLICY chat_knowledge_insert ON chat_knowledge FOR INSERT WITH CHECK (TRUE);
CREATE POLICY chat_knowledge_update ON chat_knowledge FOR UPDATE USING (TRUE);

CREATE POLICY chat_sessions_select ON chat_sessions FOR SELECT USING (TRUE);
CREATE POLICY chat_sessions_insert ON chat_sessions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY chat_sessions_update ON chat_sessions FOR UPDATE USING (TRUE);

CREATE POLICY chat_badges_select ON chat_badges FOR SELECT USING (TRUE);
CREATE POLICY chat_badges_insert ON chat_badges FOR INSERT WITH CHECK (TRUE);
```

### 4b. ChromaDB (local, no Supabase changes)

ChromaDB stores vector embeddings for lesson materials. Stored locally at `./data/chroma/`.
- Collection per lesson: `lesson_{lesson_id}`
- Each chunk: lesson material text split into ~800 char paragraphs
- Used for RAG context injection during chat

### 4c. Existing tables used (READ ONLY from chatbot)

| Table | How chatbot reads it |
|-------|---------------------|
| `lessons` | Get lesson title, topic, objective, base_material for context |
| `student_profiles` | Get student name, performance_status |
| `learning_preferences` | Get content_format to adapt chat style |
| `classes` | Get class info for the lesson |
| `assessments` | Write exercise results back (INSERT only) |

---

## 5. Backend Implementation

### 5a. New files to create

```
backend/
├── app/
│   ├── services/
│   │   └── chatbot/
│   │       ├── __init__.py
│   │       ├── llm_client.py      # Grok API wrapper (xAI OpenAI-compatible)
│   │       ├── tutor.py           # COPA conversation agent (adapted)
│   │       ├── exercise_gen.py    # Exercise generator (adapted)
│   │       ├── evaluator.py       # Answer evaluator (adapted)
│   │       └── rag.py             # ChromaDB pipeline (adapted)
│   └── api/
│       └── v1/
│           └── routes/
│               └── chat.py        # New chat API routes
├── data/
│   └── chroma/                    # ChromaDB persistent storage
```

### 5b. Adaptation from chatbot codebase

**llm_client.py** - Simplify to Grok-only:
- Original supports Mistral/Gemini/Claude via httpx
- New version: use `openai` library pointing at `https://api.x.ai/v1` with `GROK_API_KEY`
- Single function: `async def ask_llm(system_prompt, messages, temperature=0.7) -> str`

**tutor.py** - Adapt COPA agent:
- Replace SQLAlchemy student lookup with Supabase query
- Replace `Course` model with `lessons` table lookup
- Keep COPA pedagogy prompts (PRIME, ANCHOR, FLIP, GAME)
- Inject lesson `base_material` as context instead of ChromaDB chunks (fallback to RAG if material is long)
- Write knowledge updates to `chat_knowledge` table
- Write messages to `chat_sessions` table

**exercise_gen.py** - Adapt exercise generator:
- Replace SQLAlchemy models with Supabase queries
- Read student's `content_format` preference to pick exercise type:
  - `reading` preference → open-ended questions
  - `flashcard` preference → quiz (multiple choice)
- Exercise content drawn from lesson's `base_material`

**evaluator.py** - Adapt evaluator:
- Keep LLM grading logic as-is
- Write results to main `assessments` table (INSERT)
- Update `chat_knowledge` mastery levels

**rag.py** - Adapt RAG pipeline:
- Keep ChromaDB for vector storage
- On lesson open: check if lesson material is chunked, if not → chunk and embed
- Collection name: `lesson_{lesson_id}`
- Retrieval: top 3 chunks by similarity to student message

### 5c. New API routes (`chat.py`)

```python
router = APIRouter(prefix="/chat")

# Core chat
POST /chat
  Body: { student_id, lesson_id, message, session_id? }
  Returns: { response, session_id, exercise?, phase, badges?, concepts_touched }

# Exercises
POST /chat/exercise
  Body: { student_id, lesson_id, session_id }
  Returns: { exercise_type, question, options?, correct_answer? }

POST /chat/evaluate
  Body: { student_id, lesson_id, session_id, answer, exercise }
  Returns: { score, feedback, mastery_update }

# Data
GET /chat/history?student_id=X&lesson_id=Y
  Returns: { messages[], session_id }

GET /chat/knowledge?student_id=X
  Returns: [{ lesson_id, concept, mastery, last_seen }]

GET /chat/badges?student_id=X
  Returns: [{ badge_type, title, description, earned_at }]
```

### 5d. Config additions (.env)

```env
# No new API keys needed - reuses GROK_API_KEY
# ChromaDB storage path
CHROMA_PATH=./data/chroma
```

---

## 6. Frontend Implementation

### 6a. New components to create

```
components/
├── chat/
│   ├── chat-widget.tsx        # Floating button + expandable chat panel
│   ├── chat-messages.tsx      # Message bubbles (student/AI)
│   ├── chat-input.tsx         # Text input + send button
│   ├── chat-exercise.tsx      # Exercise display (quiz/open)
│   ├── chat-badges.tsx        # Badge notification popup
│   └── chat-knowledge.tsx     # Mastery progress display
```

### 6b. Chat Widget Behavior

**Where it appears:**
- Student lesson viewer (`/student/lessons/[lessonId]`)
- Optionally: student dashboard (global floating button)

**NOT shown on:**
- Teacher pages (teachers don't chat with the tutor)
- Auth pages
- Landing page

**UI Design:**
```
┌─────────────────────────┐
│  Student Lesson Page    │
│                         │
│  [Flashcard/Reading     │
│   content here]         │
│                         │
│                    ┌────┤
│                    │ 💬 │  ← Floating circle button (bottom-right)
│                    └────┤
└─────────────────────────┘

When clicked, expands to:

┌─────────────────────────┐
│  Student Lesson Page    │
│               ┌─────────┤
│               │ COPA    │
│               │ Tutor   │
│               │─────────│
│               │ messages│
│               │ ...     │
│               │─────────│
│               │ [type]  │
│               │ [send]  │
│               └─────────┤
└─────────────────────────┘
```

**Panel dimensions:** 380px wide, 520px tall, fixed bottom-right
**States:** collapsed (circle), expanded (panel), exercise-mode (panel + exercise UI)

### 6c. Chat Flow (Student perspective)

1. Student opens a lesson → sees lesson content (flashcard/reading)
2. Clicks chat bubble → panel opens
3. COPA sends a warmup message about the lesson topic
4. Student types questions or discusses the lesson
5. After a few turns, COPA may suggest an exercise
6. Exercise appears inline in chat (quiz or open question)
7. Student answers → gets graded feedback
8. Mastery progress shown for concepts covered
9. Badge earned → notification pops up

### 6d. Integration with existing pages

**No existing component modifications.** The chat widget is injected via:

```tsx
// In app/student/lessons/[lessonId]/page.tsx
// Add at the bottom of the page, after existing content:
<ChatWidget studentId={studentId} lessonId={lessonId} />
```

This is the ONLY change to an existing page — one line added.

---

## 7. Implementation Order

### Phase 1: Backend chat service (no frontend yet)
1. Create `app/services/chatbot/llm_client.py` (Grok wrapper)
2. Create `app/services/chatbot/tutor.py` (adapted COPA agent)
3. Create `app/services/chatbot/exercise_gen.py`
4. Create `app/services/chatbot/evaluator.py`
5. Create `app/api/v1/routes/chat.py` (REST endpoints)
6. Run new SQL migration for `chat_knowledge`, `chat_sessions`, `chat_badges`
7. Test via `/docs` Swagger UI

### Phase 2: RAG pipeline
1. Install `chromadb` in requirements.txt
2. Create `app/services/chatbot/rag.py`
3. Auto-chunk lesson `base_material` on first chat open
4. Test retrieval quality

### Phase 3: Frontend chat widget
1. Build `components/chat/chat-widget.tsx` (floating button + panel)
2. Build `components/chat/chat-messages.tsx` (message display)
3. Build `components/chat/chat-input.tsx` (input + send)
4. Build `components/chat/chat-exercise.tsx` (quiz/open inline)
5. Add `<ChatWidget>` to student lesson viewer page
6. Test full flow

### Phase 4: Polish
1. Badge notifications with animation
2. Knowledge/mastery progress bar in chat panel
3. Exercise scoring display
4. Session persistence (resume conversation on page reload)
5. Loading states and error handling

---

## 8. Dependencies to Add

### requirements.txt additions
```
chromadb>=0.5.0        # Vector store for RAG
```

No other new packages needed — the existing `openai` package handles Grok API calls.

### package.json additions
None — all UI built with existing shadcn/radix components.

---

## 9. Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Chat adds latency to lesson pages | Widget loads lazily, doesn't block lesson content |
| Grok API rate limits | Queue messages, show "thinking..." state |
| ChromaDB storage grows large | One collection per lesson, delete on lesson delete |
| Chat messages stored in JSONB grow large | Cap at 100 messages per session, archive old sessions |
| Conflicting student IDs between systems | Chatbot uses Supabase student_profiles.id exclusively |
| LLM generates off-topic content | System prompt strictly scoped to lesson material |

---

## 10. What This Does NOT Change

- **No changes** to existing Supabase tables
- **No changes** to existing backend routes
- **No changes** to existing frontend components (except 1 line in lesson viewer)
- **No changes** to teacher lesson builder, bias scanner, analytics, or dashboard
- **No changes** to auth system
- **No changes** to the Grok-based flashcard/reading generation (that stays separate)

The chatbot is a **pure addition** — a new service layer, new routes, new tables, and one new frontend component.
