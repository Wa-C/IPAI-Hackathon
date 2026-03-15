"""
Tutoring Agent — COPA conversational tutor adapted for the EdCopilot platform.

Reads student/lesson data from Supabase instead of SQLAlchemy.
Writes knowledge updates to chat_knowledge and messages to chat_sessions.

Includes the full task system from the original chatbot:
  - Teacher's learning_objective is parsed into trackable tasks
  - Each task has a label (hint badge) and done flag
  - LLM evaluates task completion each turn
  - Task instructions are injected into the system prompt
  - Tasks are persisted in chat_sessions.tasks_state

Pedagogical techniques: PRIME, ANCHOR, FLIP, GAME
Session flow: warmup -> chat -> exercise -> wrapup
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone

from app.db.supabase_client import get_supabase_admin
from app.services.chatbot.llm_client import ask_llm
from app.services.chatbot.rag import ensure_lesson_indexed, retrieve


# ── Badge definitions ────────────────────────────────

BADGE_CHECKS = [
    {
        "type": "first_chat",
        "title": "First Steps",
        "desc": "Started your first conversation!",
        "min_sessions": 1,
    },
    {
        "type": "streak_3",
        "title": "3-Day Streak",
        "desc": "Practiced 3 sessions!",
        "min_sessions": 3,
    },
    {
        "type": "streak_7",
        "title": "Weekly Warrior",
        "desc": "Completed 7 sessions!",
        "min_sessions": 7,
    },
    {
        "type": "concepts_10",
        "title": "Knowledge Spark",
        "desc": "Touched 10 concepts!",
        "min_mastery": 0.4,
        "min_concepts": 10,
    },
    {
        "type": "concepts_25",
        "title": "Language Pro",
        "desc": "Mastered 25 concepts!",
        "min_mastery": 0.7,
        "min_concepts": 25,
    },
]


async def check_and_award_badges(student_id: str) -> list[dict]:
    """Check badge criteria and award any new badges earned."""
    sb = get_supabase_admin()

    existing = sb.table("chat_badges").select("badge_type").eq(
        "student_id", student_id
    ).execute()
    existing_types = {b["badge_type"] for b in (existing.data or [])}

    sessions = sb.table("chat_sessions").select("id").eq(
        "student_id", student_id
    ).execute()
    session_count = len(sessions.data or [])

    knowledge = sb.table("chat_knowledge").select("concept, mastery").eq(
        "student_id", student_id
    ).execute()
    knowledge_entries = knowledge.data or []

    new_badges = []
    for b in BADGE_CHECKS:
        if b["type"] in existing_types:
            continue

        earned = False
        if "min_sessions" in b:
            earned = session_count >= b["min_sessions"]
        elif "min_concepts" in b:
            count = len([k for k in knowledge_entries if (k.get("mastery") or 0) >= b["min_mastery"]])
            earned = count >= b["min_concepts"]

        if earned:
            sb.table("chat_badges").insert({
                "student_id": student_id,
                "badge_type": b["type"],
                "title": b["title"],
                "description": b["desc"],
            }).execute()
            new_badges.append({
                "type": b["type"],
                "title": b["title"],
                "description": b["desc"],
            })

    return new_badges


# ── Task system ──────────────────────────────────────

async def parse_tasks(
    lesson_objective: str,
    lesson_topic: str,
    student_name: str,
    base_material: str = "",
) -> list[dict]:
    """
    Parse learning tasks from two sources (priority order):
      1. Teacher's learning_objective — if provided, this is the primary task prompt
      2. Lesson base_material (PDF) — key concepts are extracted and used as task basis

    If both exist: objective drives the tasks, material grounds them in real content.
    If only material exists: tasks are extracted from the material itself.
    If neither exists: returns empty list.

    Each task has: id, description (for COPA), label (hint for student), done, attempts.
    """
    has_objective = bool(lesson_objective and lesson_objective.strip())
    has_material = bool(base_material and base_material.strip())

    if not has_objective and not has_material:
        return []

    # Build the source block depending on what's available
    if has_objective and has_material:
        source_block = f"""The teacher set this learning objective:
"{lesson_objective}"

The lesson material (from uploaded PDF) covers:
{base_material[:3000]}

Use the learning objective as the PRIMARY guide for what the student must demonstrate.
Ground each task in SPECIFIC content from the lesson material — reference actual concepts,
terms, or ideas from the material, not generic goals."""

    elif has_objective:
        source_block = f"""The teacher set this learning objective:
"{lesson_objective}"

No additional lesson material was uploaded. Create tasks based on the objective and topic."""

    else:
        source_block = f"""No explicit learning objective was set by the teacher.
The lesson material (from uploaded PDF) covers:
{base_material[:3000]}

Extract the 2-5 most important concepts or ideas from this material and turn them into
learning checkpoints the student should demonstrate understanding of."""

    prompt = f"""Lesson topic: "{lesson_topic}"
Student name: {student_name}

{source_block}

Create 2-5 trackable learning checkpoints. For each produce:
1. "description" — detailed instruction for the tutor (internal, not shown to student).
   Must reference SPECIFIC content from the material or objective.
   BAD: "Guide the student to explain the main concept"
   GOOD: "Guide the student to explain how photosynthesis converts CO2 and water into glucose"
2. "label" — a short hint badge for the student, 3-6 words + ✦ symbol.
   Should feel like a conversation prompt, not a test instruction.
   Good: "How plants make food ✦", "Real-world example ✦", "Connect to daily life ✦"
   Bad: "Define photosynthesis ✦", "Answer question 1 ✦", "Task 3 ✦"

Respond ONLY with a JSON array:
[
  {{"id": 1, "description": "Guide the student to explain ...", "label": "How it works ✦", "type": "demonstrate_understanding", "done": false}},
  {{"id": 2, "description": "Get the student to give ...", "label": "A real example ✦", "type": "demonstrate_understanding", "done": false}}
]

Rules:
- 2-5 tasks, no more
- Tasks must be SPECIFIC to the lesson content, not generic
- "description" is detailed, for the tutor only
- "label" is a conversational hint shown to student
- done: false for all"""

    result_text = await ask_llm(
        system_prompt="You are an educational content parser. Respond ONLY with valid JSON array.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000,
    )
    try:
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        tasks = json.loads(result_text)
        if not isinstance(tasks, list):
            raise ValueError
        for i, t in enumerate(tasks):
            if "label" not in t or not t["label"]:
                t["label"] = f"Goal {i+1} ✦"
            if "attempts" not in t:
                t["attempts"] = 0
            if "done" not in t:
                t["done"] = False
        return tasks
    except (json.JSONDecodeError, ValueError):
        fallback_text = lesson_objective if has_objective else lesson_topic
        return [{
            "id": 1,
            "description": (fallback_text or "Demonstrate understanding of the lesson")[:200],
            "label": "Show your understanding ✦",
            "type": "demonstrate_understanding",
            "done": False,
            "attempts": 0,
        }]


async def evaluate_task_completion(
    task: dict,
    student_message: str,
    conversation_history: list[dict],
) -> bool:
    """
    Ask the LLM whether the student's latest message completed a given task.
    Generous — a good-faith attempt counts.
    Adapted from the original chatbot's evaluate_task_completion.
    """
    recent = conversation_history[-6:] if len(conversation_history) > 6 else conversation_history
    context = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in recent)

    prompt = f"""Did the student demonstrate completion of this learning task in their latest message?

TASK: {task['description']}
TASK TYPE: {task.get('type', 'demonstrate_understanding')}

RECENT CONVERSATION:
{context}

STUDENT'S LATEST MESSAGE: {student_message}

Answer ONLY "yes" or "no". Be generous — if the student made a good-faith attempt at the task, say yes."""

    result = await ask_llm(
        system_prompt="You evaluate whether a student completed a learning task. Answer only 'yes' or 'no'.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=10,
    )
    return result.strip().lower().startswith("yes")


# ── Helpers ──────────────────────────────────────────

def extract_tag_content(text: str, tag: str) -> list[str]:
    return re.findall(f"<{tag}>(.*?)</{tag}>", text, re.DOTALL)


def build_system_prompt(
    student_name: str,
    lesson_title: str,
    lesson_topic: str,
    lesson_objective: str,
    content_format: str,
    knowledge_entries: list[dict],
    session_phase: str,
    turn_count: int,
    base_material_snippet: str = "",
    tasks: list[dict] | None = None,
    about_me: dict | None = None,
) -> str:
    """Build the COPA system prompt adapted for EdCopilot lessons."""

    known = [k for k in knowledge_entries if (k.get("mastery") or 0) >= 0.4]
    struggling = [k for k in knowledge_entries if k.get("struggles")]

    knowledge_note = ""
    if known:
        knowledge_note += f"\nAlready comfortable with: {', '.join(k['concept'] for k in known[:8])}"
    if struggling:
        knowledge_note += f"\nRecent struggles: {', '.join(k['concept'] for k in struggling[:4])}"

    # Build student profile from about_me
    student_profile_block = ""
    if about_me:
        profile_parts = []
        if about_me.get("age"):
            profile_parts.append(f"Age: {about_me['age']}")
        if about_me.get("native_language"):
            profile_parts.append(f"Native language: {about_me['native_language']}")
        if about_me.get("hobbies"):
            profile_parts.append(f"Hobbies: {about_me['hobbies']}")
        if about_me.get("interests"):
            profile_parts.append(f"Interests: {about_me['interests']}")
        if about_me.get("learning_challenges"):
            profile_parts.append(f"Learning challenges: {about_me['learning_challenges']}")
        if about_me.get("fun_fact"):
            profile_parts.append(f"Fun fact: {about_me['fun_fact']}")
        if profile_parts:
            student_profile_block = "\n" + "\n".join(f"- {p}" for p in profile_parts)
            student_profile_block += "\nUse their hobbies and interests to make examples and analogies relatable."

    material_block = ""
    if base_material_snippet:
        material_block = f"""

LESSON MATERIAL (reference only — do not quote directly):
{base_material_snippet[:2000]}"""

    # Task block — teacher's exercise tasks
    task_block = ""
    if tasks:
        pending = [t for t in tasks if not t.get("done")]
        done_tasks = [t for t in tasks if t.get("done")]
        if pending:
            next_task = pending[0]
            task_block = f"""

TEACHER'S LEARNING TASKS ({len(done_tasks)}/{len(tasks)} completed):
Next task: {next_task['description']}
Remaining after that: {len(pending) - 1} more

HOW TO HANDLE TASKS:
- Work toward the next task naturally through conversation — never name it or say "now do task X"
- Create a scenario, question, or game that makes the student demonstrate what the task requires
- When they complete it, move on to the next task seamlessly
- The student should feel like they're just chatting, not doing exercises"""
        else:
            task_block = f"\n\nAll {len(tasks)} learning tasks completed! Continue the conversation freely."

    if session_phase == "warmup":
        phase_text = f"""
WARMUP — greet {student_name} and introduce the topic naturally.
Mention you'll be exploring "{lesson_title}" together.
Ask a genuine question to gauge their prior knowledge about {lesson_topic}.
Keep it brief and friendly — one question max."""
    elif session_phase == "exercise":
        phase_text = """
EXERCISE PHASE — the student is working on an exercise.
Provide encouragement and hints if they struggle, but don't give away answers.
After they answer, give feedback and transition back to chat."""
    elif session_phase == "wrapup":
        phase_text = f"""
WRAPUP — summarize what {student_name} learned this session.
Mention 1-2 concepts they did well on. Encourage them to come back.
Keep it warm and brief."""
    else:
        phase_text = f"""
CONVERSATION PHASE — turn {turn_count} of this session.

You are COPA — a friendly, curious tutor having a genuine conversation with {student_name}
about "{lesson_title}" ({lesson_topic}).

Learning objective: {lesson_objective}

TECHNIQUES (use naturally, not as a rotation):
- MODEL IT: Use target concepts in your own sentences first
- CREATE A REASON: Build scenarios where they naturally use lesson concepts
- FLIP IT: Pretend you don't know something they can explain
- GAME: Drop a casual 2-line challenge tied to what they just said

RULES:
- ONE question per response max
- React to what they say before moving on
- Short, natural responses — not essays
- If they give short answers, acknowledge what they said before continuing
- Recast errors naturally instead of correcting directly

Tag concepts introduced: <concepts>["concept name"]</concepts>"""

    return f"""You are COPA — {student_name}'s personal tutor for the lesson "{lesson_title}".

Your role: help them understand the lesson material through genuine conversation.
Never say "as your tutor" or "let's do an exercise." Keep it natural.

STUDENT: {student_name}
Preferred content format: {content_format}{student_profile_block}
{knowledge_note}
{material_block}
{task_block}

{phase_text}

Always be encouraging, warm, and age-appropriate."""


# ── Main chat function ───────────────────────────────

async def chat(
    student_id: str,
    lesson_id: str,
    message: str,
    session_id: str | None = None,
) -> dict:
    """
    Process a student message and return the tutor's response.
    Creates/updates chat_sessions and chat_knowledge in Supabase.
    Includes the full task system: parse, evaluate, persist, return.
    """
    sb = get_supabase_admin()

    # Fetch student profile
    student_resp = sb.table("student_profiles").select("*").eq(
        "id", student_id
    ).maybe_single().execute()
    student = student_resp.data
    if not student:
        return {"response": "Student not found.", "session_id": None, "concepts_touched": [], "tasks": []}

    student_name = student.get("name", "Student")

    # Fetch learning preferences + about_me
    prefs_resp = sb.table("learning_preferences").select("content_format, about_me").eq(
        "student_id", student_id
    ).maybe_single().execute()
    prefs_data = prefs_resp.data or {}
    content_format = prefs_data.get("content_format", "reading")
    about_me = prefs_data.get("about_me") or {}

    # Fetch lesson
    lesson_resp = sb.table("lessons").select("*").eq("id", lesson_id).maybe_single().execute()
    lesson = lesson_resp.data
    if not lesson:
        return {"response": "Lesson not found.", "session_id": None, "concepts_touched": [], "tasks": []}

    lesson_title = lesson.get("title", "")
    lesson_topic = lesson.get("topic", "")
    lesson_objective = lesson.get("learning_objective", "")
    base_material = lesson.get("base_material", "") or ""

    # RAG: ensure lesson material is indexed, retrieve relevant chunks
    context_text = ""
    if base_material:
        ensure_lesson_indexed(lesson_id, base_material)
        chunks = retrieve(lesson_id, message, n_results=3)
        if chunks:
            context_text = "\n---\n".join(c["text"] for c in chunks)

    # If no RAG results, use a snippet of base_material directly
    if not context_text and base_material:
        context_text = base_material[:2000]

    # Fetch existing knowledge for this student+lesson
    knowledge_resp = sb.table("chat_knowledge").select("*").eq(
        "student_id", student_id
    ).eq("lesson_id", lesson_id).execute()
    knowledge_entries = knowledge_resp.data or []

    # Session management
    session = None
    current_messages = []
    session_phase = "warmup"

    if session_id:
        session_resp = sb.table("chat_sessions").select("*").eq(
            "id", session_id
        ).maybe_single().execute()
        if session_resp.data:
            session = session_resp.data
            current_messages = session.get("messages") or []
            session_phase = session.get("phase", "warmup")

    if not session:
        insert_resp = sb.table("chat_sessions").insert({
            "student_id": student_id,
            "lesson_id": lesson_id,
            "phase": "warmup",
            "messages": [],
            "exercises_given": 0,
            "exercises_correct": 0,
            "tasks_state": None,
        }).execute()
        session = insert_resp.data[0]
        session_id = session["id"]
        current_messages = []
        session_phase = "warmup"

    turn_count = sum(1 for m in current_messages if m.get("role") == "assistant")

    # ── Task system ──────────────────────────
    # Tasks are generated from learning_objective AND/OR base_material (PDF).
    # Priority: objective first, then PDF content, or both combined.
    tasks = []

    # Load persisted tasks from session
    stored_tasks = session.get("tasks_state")
    if stored_tasks and isinstance(stored_tasks, list):
        tasks = stored_tasks
    elif stored_tasks and isinstance(stored_tasks, str):
        try:
            tasks = json.loads(stored_tasks)
        except (json.JSONDecodeError, TypeError):
            tasks = []

    # If no persisted tasks, generate from objective + material
    if not tasks and (lesson_objective or base_material):
        tasks = await parse_tasks(
            lesson_objective=lesson_objective,
            lesson_topic=lesson_topic,
            student_name=student_name,
            base_material=base_material,
        )

    # Evaluate completion of the next pending task (only in chat phase)
    if tasks and session_phase == "chat":
        for task in tasks:
            if not task.get("done"):
                if await evaluate_task_completion(
                    task, message, current_messages
                ):
                    task["done"] = True
                else:
                    task["attempts"] = task.get("attempts", 0) + 1
                break  # One at a time, sequential

    # Build system prompt
    system_prompt = build_system_prompt(
        student_name=student_name,
        lesson_title=lesson_title,
        lesson_topic=lesson_topic,
        lesson_objective=lesson_objective,
        content_format=content_format,
        knowledge_entries=knowledge_entries,
        session_phase=session_phase,
        turn_count=turn_count,
        base_material_snippet=context_text,
        tasks=tasks,
        about_me=about_me,
    )

    # Build message history (cap at 16 for context window)
    history_window = current_messages[-16:] if len(current_messages) > 16 else current_messages
    messages = [{"role": m["role"], "content": m["content"]} for m in history_window]

    # Inject RAG context every 3 turns
    user_content = message
    if context_text and session_phase in ("chat", "warmup") and turn_count % 3 == 0:
        user_content = (
            f"<lesson_reference>\n{context_text}\n</lesson_reference>\n\n"
            f"[Background reference only — do not quote directly.]\n\nStudent: {message}"
        )

    messages.append({"role": "user", "content": user_content})

    # Call LLM
    assistant_text = await ask_llm(
        system_prompt=system_prompt,
        messages=messages,
        temperature=0.7,
        max_tokens=500,
    )

    # Parse tags
    concepts_tags = extract_tag_content(assistant_text, "concepts")
    concepts_touched = []
    for tag in concepts_tags:
        try:
            concepts_touched.extend(json.loads(tag))
        except json.JSONDecodeError:
            pass

    # Clean response (remove tags)
    clean_response = assistant_text
    for tag in ["concepts", "red_flag", "discovered_interests", "suggest_mastery_check"]:
        clean_response = re.sub(f"<{tag}>.*?</{tag}>", "", clean_response, flags=re.DOTALL)
    clean_response = clean_response.strip()

    # Update session messages
    current_messages.append({"role": "user", "content": user_content})
    current_messages.append({"role": "assistant", "content": clean_response})

    # Phase transitions
    if session_phase == "warmup":
        user_msg_count = sum(1 for m in current_messages if m.get("role") == "user")
        if user_msg_count >= 2:
            session_phase = "chat"

    now = datetime.now(timezone.utc).isoformat()
    sb.table("chat_sessions").update({
        "messages": current_messages,
        "phase": session_phase,
        "tasks_state": tasks if tasks else None,
        "ended_at": now,
    }).eq("id", session_id).execute()

    # Update knowledge map
    for concept_name in concepts_touched:
        existing = sb.table("chat_knowledge").select("*").eq(
            "student_id", student_id
        ).eq("lesson_id", lesson_id).eq("concept", concept_name).maybe_single().execute()

        if existing.data:
            entry = existing.data
            new_mastery = min((entry.get("mastery") or 0) + 0.05, 0.65)
            sb.table("chat_knowledge").update({
                "mastery": new_mastery,
                "attempts": (entry.get("attempts") or 0) + 1,
                "last_seen": now,
            }).eq("id", entry["id"]).execute()
        else:
            sb.table("chat_knowledge").insert({
                "student_id": student_id,
                "lesson_id": lesson_id,
                "concept": concept_name,
                "mastery": 0.1,
                "attempts": 1,
                "correct": 0,
                "struggles": [],
                "last_seen": now,
            }).execute()

    # Check badges
    new_badges = await check_and_award_badges(student_id)

    return {
        "response": clean_response,
        "session_id": session_id,
        "phase": session_phase,
        "concepts_touched": concepts_touched,
        "badges": new_badges if new_badges else None,
        "tasks": tasks,
    }
