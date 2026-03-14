# COPA — AI-Powered Language Tutoring Backend

COPA (Conversational Partner) is a multi-agent AI backend for adaptive English language tutoring. It manages student sessions, exercises, knowledge tracking, prerequisite checking, and weekly reporting. This document covers everything needed to understand and integrate the backend with a new frontend.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Agent Modules](#agent-modules)
   - [Tutor Agent (`tutor.py`)](#tutor-agent)
   - [Exercise Generator (`exercise_gen.py`)](#exercise-generator)
   - [Evaluator (`evaluator.py`)](#evaluator)
   - [Prerequisite Checker (`prereq_checker.py`)](#prerequisite-checker)
   - [Reporter (`reporter.py`)](#reporter)
   - [LLM Client (`llm_client.py`)](#llm-client)
3. [Data Models](#data-models)
4. [Session Flow](#session-flow)
5. [API Reference](#api-reference)
6. [Frontend Integration Guide](#frontend-integration-guide)
7. [Configuration](#configuration)
8. [LLM Provider Setup](#llm-provider-setup)

---

## Architecture Overview

```
Frontend
   │
   ▼
[ REST API Layer ]
   │
   ├── tutor.py          ← Main chat loop, session management, badges
   ├── exercise_gen.py   ← Adaptive exercise creation
   ├── evaluator.py      ← Answer grading and feedback
   ├── prereq_checker.py ← Knowledge gap detection
   ├── reporter.py       ← Weekly teacher reports
   └── llm_client.py     ← Unified LLM abstraction (Mistral / Gemini / Claude)
         │
   [ Database (SQLAlchemy) ]
         │
   Student, KnowledgeEntry, TutoringSession, Course, CourseProgress, Badge
```

All agents communicate through a shared database layer (SQLAlchemy ORM). The LLM client provides a unified interface so the underlying model can be swapped without touching agent code.

---

## Agent Modules

### Tutor Agent

**File:** `tutor.py`  
**Purpose:** Orchestrates the full student conversation loop using the COPA pedagogical model.

#### Pedagogical Model

COPA uses four techniques to embed target language naturally in conversation — never as explicit grammar drills:

| Technique | Description |
|-----------|-------------|
| **PRIME** | COPA uses the target structure itself first; the student mirrors it |
| **ANCHOR** | COPA builds a scenario that forces the student to use the target language |
| **FLIP** | COPA pretends not to know something; the student explains in English |
| **GAME** | A quick 2-line playful challenge tied to what the student just said |

#### Session Phases

Sessions progress through four phases automatically:

| Phase | Trigger | Behavior |
|-------|---------|----------|
| `onboarding` | First-ever session (`student.onboarded == False`) | Warm introduction, learns student interests |
| `warmup` | After onboarding, or start of new session | Light chat, natural weave of first course language |
| `chat` | After 2+ warmup turns | Full COPA conversation with task-directed goals |
| `wrapup` | (handled externally) | Session summary |

#### Task System

Teachers can assign exercise prompts to a course. COPA parses these into discrete tasks and completes them invisibly through natural conversation.

**How it works:**
1. Teacher writes a free-text `exercise_prompt` on a course (e.g. "Get the student to produce three present perfect sentences: one positive, one negative, one question").
2. `parse_exercise_prompt()` breaks this into structured tasks with internal `description` (for COPA) and a student-facing `label` hint badge (e.g. `"Something you've done ✦"`).
3. On each turn during `chat` phase, `evaluate_task_completion()` checks whether the student's message completed the next pending task.
4. Task state is persisted as JSON on the session record (`tasks_state` column).

**Task object shape:**
```json
{
  "id": 1,
  "description": "Elicit an affirmative present perfect sentence about their sports experience",
  "label": "Something you've done ✦",
  "type": "produce_sentence",
  "done": false,
  "attempts": 0
}
```

#### Badge System

Badges are awarded automatically by `check_and_award_badges()`. Currently defined badges:

| Badge Type | Title | Condition |
|------------|-------|-----------|
| `first_chat` | First Steps | 1+ session completed |
| `streak_3` | 3-Day Streak | 3+ sessions |
| `streak_7` | Weekly Warrior | 7+ sessions |
| `concepts_10` | Knowledge Spark | 10+ concepts at ≥40% mastery |
| `concepts_25` | Language Pro | 25+ concepts at ≥70% mastery |
| `course_complete` | Course Champion | Any course at 100% completion |

#### Knowledge Map Updates

Each conversational turn nudges concept mastery upward (max +0.05 per turn, capped at 0.65). Full mastery (0.7+) requires explicit exercise evaluation through the Evaluator agent. Concepts are tagged in the LLM response using XML tags: `<concepts>["present perfect positive"]</concepts>`.

#### Main Function

```python
def chat(db: Session, student_id: int, message: str, session_id: int = None) -> dict
```

**Returns:**
```json
{
  "response": "COPA's reply text",
  "session_id": 42,
  "exercise": null,
  "concepts_touched": ["present perfect positive"],
  "phase": "chat",
  "new_badges": [{"type": "first_chat", "title": "First Steps", "description": "..."}],
  "vocab_used": [],
  "vocab_introduced": [],
  "course_changed": false,
  "suggest_mastery_check": false,
  "course_complete": false,
  "tasks": [...]
}
```

**Key fields for the frontend:**

- `response` — display this as COPA's chat message
- `phase` — can drive UI state (e.g. show different UI for onboarding)
- `new_badges` — trigger badge award animation if non-empty
- `suggest_mastery_check` — show a "Ready for a quiz?" prompt if `true`
- `course_complete` — trigger course completion screen if `true`
- `tasks` — render task hint badges showing progress (e.g. "2/5 done")
- `course_changed` — optionally notify the student that the course has changed

#### RAG Integration

The tutor retrieves relevant course material via `app.rag.pipeline.retrieve()` and injects it into the prompt every 3 turns (to avoid crowding out conversation history). The frontend does not need to manage this.

---

### Exercise Generator

**File:** `exercise_gen.py`  
**Purpose:** Creates personalized exercises adapted to the student's age, interests, learning style, and recent history.

#### Exercise Types

| Type | Description | Best For |
|------|-------------|----------|
| `quiz` | 4-option multiple choice | Quick checks, younger students |
| `open` | Free-text answer requiring explanation | Deeper understanding, older students |
| `game` | Interactive: fill-in-the-blank, matching, ordering | Engagement, younger students |

#### Type Auto-Selection

When `preferred_type="auto"`, the generator picks based on:
- **Age ≤12:** Weighted toward games
- **Age 13–16:** Weighted toward quizzes
- **Age 17+:** Weighted toward open questions
- Recent type history is used to avoid repetition

#### Main Function

```python
def generate_exercise(
    student_profile: dict,
    concept: str,
    difficulty: str,         # "easy" | "medium" | "hard"
    course_context: str = "",
    preferred_type: str = "auto",
    recent_types: list[str] = []
) -> dict
```

**Returns (quiz example):**
```json
{
  "type": "quiz",
  "question": "Which sentence uses the present perfect correctly?",
  "options": ["A) I go there yesterday", "B) I have been there", "C) I was go there", "D) I been there"],
  "correct_answer": "B",
  "explanation": "B is correct because...",
  "hints": ["Think about actions with a connection to now"],
  "concept": "present perfect positive",
  "difficulty": "medium"
}
```

**Returns (game example):**
```json
{
  "type": "game",
  "game_type": "fill_blank",
  "question": "Fill in the blanks:",
  "items": "I ___ never ___ sushi before.",
  "correct_answer": "have / eaten",
  "hints": ["Use have/has + past participle"],
  "concept": "present perfect negative",
  "difficulty": "easy"
}
```

---

### Evaluator

**File:** `evaluator.py`  
**Purpose:** Grades student answers with nuanced feedback.

#### Grading Scale

| Score | Grade | Meaning |
|-------|-------|---------|
| `1.0` | `correct` | Full understanding demonstrated |
| `0.5` | `partial` | Some understanding, but gaps or imprecision |
| `0.0` | `wrong` | Fundamental misunderstanding |

For `quiz` type exercises, exact-match checking is done first (fast, no LLM call). All other types use the LLM for nuanced grading.

#### Single Answer Evaluation

```python
def evaluate_answer(
    student_profile: dict,
    exercise: dict,
    student_answer: str
) -> dict
```

**Returns:**
```json
{
  "score": 0.5,
  "grade": "partial",
  "feedback": "Great start, Ahmed! You got the structure right but forgot the past participle...",
  "misconception": "Student used simple past instead of past participle after 'have'",
  "should_review": ["past participles", "present perfect formation"],
  "correct_answer": "I have eaten sushi before."
}
```

**Key fields for the frontend:**
- `feedback` — display directly to the student (already personalized and encouraging)
- `grade` — drive visual feedback (green/yellow/red indicator)
- `should_review` — optionally display "You might want to review: X"
- `misconception` — for teacher-facing views or analytics

#### Batch Mastery Check Evaluation

```python
def evaluate_mastery_batch(
    student_profile: dict,
    answers: list[dict]  # [{question: {...}, answer: "student's text"}, ...]
) -> dict
```

**Returns:**
```json
{
  "score_pct": 75,
  "correct": 3,
  "total": 4,
  "evaluations": [
    {"grade": "correct", "score": 1.0, "feedback": "...", "correct_answer": "..."},
    ...
  ]
}
```

---

### Prerequisite Checker

**File:** `prereq_checker.py`  
**Purpose:** Determines whether a student has sufficient background knowledge before moving to a new concept.

#### Readiness Check

```python
def check_prerequisites(
    concept: str,
    knowledge_map: list[dict],
    struggle_log: list[dict],
    course_context: str = ""
) -> dict
```

A student is considered "ready" if they have >40% mastery on all prerequisite concepts.

**Returns:**
```json
{
  "ready": false,
  "missing_prerequisites": [
    {
      "concept": "simple past tense",
      "mastery": 0.25,
      "reason": "Present perfect builds on simple past — student needs this first"
    }
  ],
  "review_summary": "Before tackling present perfect, it's worth brushing up on simple past formation..."
}
```

#### Mini-Lesson Generation

```python
def generate_review(
    student_profile: dict,
    concept: str,
    reason: str,
    course_context: str = ""
) -> str
```

Generates a short (≤150 word) refresher lesson with analogy, example, and one practice question. Framed as a "quick refresher," not a setback.

---

### Reporter

**File:** `reporter.py`  
**Purpose:** Generates weekly teacher reports summarizing student progress.

#### Main Function

```python
def generate_weekly_report(db: Session, student_id: int, weeks_back: int = 1) -> dict
```

**Returns:**
```json
{
  "student_id": 7,
  "student_name": "Ahmed",
  "period": "Last 1 week(s)",
  "total_sessions": 4,
  "total_time_minutes": 52.0,
  "text_time_minutes": 30.0,
  "voice_time_minutes": 22.0,
  "exercises_attempted": 14,
  "exercises_correct": 10,
  "strengths": ["Consistent use of present perfect in conversation", "Strong vocabulary recall"],
  "weaknesses": ["Past participle irregulars", "Question formation with 'have'"],
  "achievements": ["Completed Unit 3", "Earned 'Knowledge Spark' badge"],
  "red_flags": ["Repeated avoidance of writing tasks"],
  "recommendations": ["Assign 2 open-ended writing exercises next week", "Review irregular verbs list"]
}
```

This endpoint is intended for a **teacher dashboard**, not the student-facing UI.

---

### LLM Client

**File:** `llm_client.py`  
**Purpose:** Unified interface for swapping between LLM providers with a single config change.

#### Supported Providers

| Provider | Config Value | Cost | Notes |
|----------|-------------|------|-------|
| Mistral | `"mistral"` | Free tier available | Good for development |
| Google Gemini | `"gemini"` | Free tier available | Good for development |
| Anthropic Claude | `"claude"` | Paid | Best quality |

#### Interface

```python
llm.generate(
    system_prompt: str,
    messages: list[dict],   # [{"role": "user"|"assistant", "content": "..."}]
    max_tokens: int = 2000
) -> str
```

The singleton `llm` instance is imported by all agents: `from app.agents.llm_client import llm`.

---

## Data Models

The following SQLAlchemy models are used across all agents. These are defined in `app/models/database.py`.

### `Student`

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Primary key |
| `name` | str | Student's display name |
| `age` | int | Used for exercise type selection and tone |
| `interests` | list[str] | Discovered during onboarding; used for analogies |
| `issues` | list[str] | Learning needs (e.g. dyslexia, ADHD) |
| `learning_style` | str | e.g. "visual", "auditory" |
| `onboarded` | bool | False until interests are discovered |
| `badges` | relationship | Awarded badges |
| `sessions` | relationship | All tutoring sessions |
| `knowledge` | relationship | Knowledge map entries |
| `course_progress` | relationship | Per-course progress records |

### `TutoringSession`

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Primary key |
| `student_id` | int | FK → Student |
| `course_id` | int | FK → Course (nullable) |
| `mode` | str | "text" or "voice" |
| `phase` | str | "onboarding" / "warmup" / "chat" |
| `messages` | JSON | Full message history `[{role, content}]` |
| `tasks_state` | str | JSON string of task objects |
| `topic` | str | Course title or topic label |
| `summary` | str | LLM-generated summary (set at wrapup) |
| `red_flags` | list[str] | Detected concerns |
| `exercises_given` | int | Count of exercises in this session |
| `exercises_correct` | int | Count of correct answers |
| `duration_minutes` | float | Auto-calculated |
| `started_at` | datetime | UTC |
| `ended_at` | datetime | UTC, updated every turn |

### `KnowledgeEntry`

| Field | Type | Description |
|-------|------|-------------|
| `student_id` | int | FK → Student |
| `course_id` | int | FK → Course (nullable) |
| `concept` | str | Concept name (e.g. "present perfect positive") |
| `mastery_level` | float | 0.0–1.0 |
| `attempts` | int | Total exposures |
| `correct` | int | Times answered correctly |
| `struggles` | list[str] | Logged misconceptions |
| `last_seen` | datetime | Last mention in conversation |

### `Course`

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Primary key |
| `title` | str | Display title |
| `subject` | str | e.g. "Present Perfect" |
| `concepts` | list[str] | Target language items |
| `vocabulary` | list[str] | Target vocabulary words |
| `exercise_prompt` | str | Teacher's free-text task instructions |
| `is_current` | bool | Only one course is "current" at a time |

### `CourseProgress`

| Field | Type | Description |
|-------|------|-------------|
| `student_id` | int | FK → Student |
| `course_id` | int | FK → Course |
| `concepts_total` | int | Total concepts in the course |
| `concepts_mastered` | int | Concepts at ≥70% mastery |
| `completion_pct` | float | 0.0–1.0 |
| `status` | str | "in_progress" or "completed" |
| `vocab_total` | int | Total vocabulary items |
| `last_activity` | datetime | UTC |

### `Badge`

| Field | Type | Description |
|-------|------|-------------|
| `student_id` | int | FK → Student |
| `badge_type` | str | Unique type key (see badge list above) |
| `title` | str | Display title |
| `description` | str | Short description |
| `awarded_at` | datetime | UTC |

---

## Session Flow

```
New Student
    │
    ▼
chat() called with no session_id
    │
    ├── student.onboarded == False
    │       └── phase = "onboarding"
    │              COPA introduces itself, learns interests
    │              → interests tagged → student.onboarded = True
    │              → phase transitions to "warmup"
    │
    ├── phase = "warmup"
    │       COPA reacts naturally, weaves in first course language
    │       → after 2 user turns → phase transitions to "chat"
    │
    └── phase = "chat"
            COPA works through teacher tasks via natural conversation
            Each turn:
              1. RAG retrieves course context
              2. Tasks evaluated for completion
              3. LLM generates COPA response
              4. XML tags parsed (concepts, red_flags, interests, suggest_mastery)
              5. Knowledge map updated
              6. Course progress recalculated
              7. Badges checked and awarded
              8. Response returned to frontend
```

---

## API Reference

The agents expose the following callable functions. The REST API layer (not in these files) wraps them as HTTP endpoints.

### Chat

```
POST /api/chat
Body: { student_id, message, session_id? }
→ Calls: tutor.chat()
→ Returns: ChatResponse (see Tutor Agent section)
```

### Generate Exercise

```
POST /api/exercise/generate
Body: { student_profile, concept, difficulty, preferred_type?, course_context? }
→ Calls: exercise_gen.generate_exercise()
→ Returns: Exercise object
```

### Evaluate Answer

```
POST /api/exercise/evaluate
Body: { student_profile, exercise, student_answer }
→ Calls: evaluator.evaluate_answer()
→ Returns: EvaluationResult
```

### Mastery Check (Batch Evaluation)

```
POST /api/mastery/evaluate
Body: { student_profile, answers: [{question, answer}] }
→ Calls: evaluator.evaluate_mastery_batch()
→ Returns: { score_pct, correct, total, evaluations }
```

### Prerequisite Check

```
POST /api/prereq/check
Body: { concept, knowledge_map, struggle_log, course_context? }
→ Calls: prereq_checker.check_prerequisites()
→ Returns: { ready, missing_prerequisites, review_summary }
```

### Generate Review Lesson

```
POST /api/prereq/review
Body: { student_profile, concept, reason, course_context? }
→ Calls: prereq_checker.generate_review()
→ Returns: { review_text: str }
```

### Weekly Report

```
GET /api/report/weekly?student_id={id}&weeks_back={n}
→ Calls: reporter.generate_weekly_report()
→ Returns: WeeklyReport (see Reporter section)
```

### Vocab Progress

```
GET /api/vocab/progress?student_id={id}
→ Calls: tutor.get_vocab_progress()
→ Returns: { total, learned, remaining, recent_words, next_words }
```

---

## Frontend Integration Guide

### Core Chat Loop

The minimum integration is a chat interface that calls `/api/chat` on each user message:

```javascript
const res = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ student_id, message, session_id })
});
const data = await res.json();

// Always persist the session_id for continuity
sessionId = data.session_id;

// Render the bot message
renderMessage('copa', data.response);

// Handle special events
if (data.new_badges.length > 0) showBadgeAnimation(data.new_badges);
if (data.suggest_mastery_check) showMasteryPrompt();
if (data.course_complete) showCourseCompleteScreen();
```

### Rendering Task Hints

The `tasks` array can drive a progress widget showing the student what kinds of things to express:

```javascript
// Show only labels (not internal descriptions)
data.tasks.forEach(task => {
  renderTaskBadge({
    label: task.label,      // e.g. "Something you've done ✦"
    done: task.done,
    attempts: task.attempts
  });
});
```

**Never show `task.description` to the student** — it contains the pedagogical intent and will break the natural conversation experience.

### Exercise Flow

When `suggest_mastery_check` is `true`, the frontend can trigger a focused exercise session:

1. Call `/api/exercise/generate` with the relevant concept and student profile
2. Render the exercise based on its `type`:
   - `quiz` → render 4 radio buttons from `options`
   - `open` → render a text area
   - `game` with `game_type: "fill_blank"` → render blanked sentence with input fields
   - `game` with `game_type: "match"` → render two-column drag-and-drop
   - `game` with `game_type: "order"` → render draggable ordered list
3. On submission, call `/api/exercise/evaluate`
4. Display `result.feedback` to the student
5. Use `result.grade` to show green/yellow/red visual feedback

### Phases and UI State

| Phase | Suggested UI |
|-------|-------------|
| `onboarding` | Minimal chrome, no task badges, friendly intro tone |
| `warmup` | Standard chat, no task widget yet |
| `chat` | Full UI: task badge strip, vocab counter, mastery prompt trigger |

### Student Profile Object

Many agent functions take a `student_profile` dict. Fetch this from your student endpoint and pass it through:

```json
{
  "name": "Ahmed",
  "age": 15,
  "interests": ["football", "gaming"],
  "learning_style": "visual"
}
```

---

## Configuration

All settings are read from environment variables via `app.config.settings`. Required variables:

```env
# LLM Provider — choose one: "mistral", "gemini", or "claude"
LLM_PROVIDER=mistral

# Mistral (if using)
MISTRAL_API_KEY=your_key_here
MISTRAL_MODEL=mistral-small-latest

# Gemini (if using)
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash

# Anthropic Claude (if using)
ANTHROPIC_API_KEY=your_key_here
CLAUDE_MODEL=claude-sonnet-4-20250514

# Database
DATABASE_URL=postgresql://user:pass@localhost/copa
```

---

## LLM Provider Setup

### Mistral (Free — Recommended for Development)
1. Sign up at [mistral.ai](https://mistral.ai)
2. Create an API key (no credit card required for experiment tier)
3. Set `LLM_PROVIDER=mistral` and `MISTRAL_API_KEY`

### Google Gemini (Free — Alternative)
1. Sign up at [aistudio.google.com](https://aistudio.google.com)
2. Create an API key (free tier, no credit card)
3. Set `LLM_PROVIDER=gemini` and `GEMINI_API_KEY`

### Anthropic Claude (Paid — Best Quality)
1. Sign up at [anthropic.com](https://anthropic.com)
2. Add billing and create an API key
3. Set `LLM_PROVIDER=claude` and `ANTHROPIC_API_KEY`

Switching providers requires only a config change — no code changes needed.

---

## Key Design Principles for Frontend Developers

**Privacy by design:** Student messages are private. The teacher dashboard only sees aggregated scores and the reporter's insights — never raw conversation content. This is enforced at the system prompt level and should be reflected in the UI (e.g. "Your messages are private" in the student view).

**Never expose task descriptions:** The `task.description` field is COPA's internal pedagogical instruction. Only `task.label` should ever be shown to students.

**Session continuity:** Always pass `session_id` back on subsequent requests within the same session. A missing or wrong `session_id` creates a new session and resets the phase to `warmup`.

**Course changes:** When `course_changed: true` is returned, the session has been reset internally (new course, fresh warmup). The frontend should reflect this — e.g. clear the message history display.

**Mastery ceiling:** Conversational exposure can only raise mastery to 65%. The remaining 35% (to reach full mastery at 70%+) requires explicit exercise completion through the Evaluator. This is intentional — use `suggest_mastery_check` to prompt exercise sessions at the right time.