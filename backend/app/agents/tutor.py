"""
Tutoring Agent — COPA conversational language partner.

Pedagogical model:
  PRIME    — use target structures yourself first; student mirrors
  ANCHOR   — build a scenario that forces the student to use the language
  FLIP     — play dumb about something they know; they explain in English
  GAME     — 2-line playful challenge tied to what they just said

Session flow: ONBOARDING → WARMUP → CHAT → WRAPUP
Teacher exercise prompt → parsed into tasks → completed conversationally
"""

import json
import re
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.database import (
    Student, KnowledgeEntry, TutoringSession, Course, CourseProgress, Badge
)
from app.rag.pipeline import retrieve
from app.agents.llm_client import llm


# ──────────────────────────────────────────
# Badges
# ──────────────────────────────────────────

BADGE_CHECKS = [
    {"type": "first_chat",      "title": "First Steps",    "desc": "Started your first conversation!",
     "check": lambda s, db: len(s.sessions) >= 1},
    {"type": "streak_3",        "title": "3-Day Streak",   "desc": "Practiced 3 sessions!",
     "check": lambda s, db: len(s.sessions) >= 3},
    {"type": "streak_7",        "title": "Weekly Warrior", "desc": "Completed 7 sessions!",
     "check": lambda s, db: len(s.sessions) >= 7},
    {"type": "concepts_10",     "title": "Knowledge Spark","desc": "Touched 10 language concepts!",
     "check": lambda s, db: len([k for k in s.knowledge if k.mastery_level >= 0.4]) >= 10},
    {"type": "concepts_25",     "title": "Language Pro",   "desc": "Mastered 25 concepts!",
     "check": lambda s, db: len([k for k in s.knowledge if k.mastery_level >= 0.7]) >= 25},
    {"type": "course_complete", "title": "Course Champion","desc": "Completed a full course!",
     "check": lambda s, db: any(cp.completion_pct >= 1.0 for cp in s.course_progress)},
]


def check_and_award_badges(db: Session, student: Student) -> list[dict]:
    existing = {b.badge_type for b in student.badges}
    new_badges = []
    for b in BADGE_CHECKS:
        if b["type"] not in existing:
            try:
                if b["check"](student, db):
                    badge = Badge(student_id=student.id, badge_type=b["type"],
                                  title=b["title"], description=b["desc"])
                    db.add(badge)
                    new_badges.append({"type": b["type"], "title": b["title"], "description": b["desc"]})
            except Exception:
                pass
    if new_badges:
        db.commit()
    return new_badges


# ──────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────

def extract_tag_content(text: str, tag: str) -> list[str]:
    return re.findall(f"<{tag}>(.*?)</{tag}>", text, re.DOTALL)


def get_student_context(db: Session, student_id: int):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return None, None, None
    knowledge = db.query(KnowledgeEntry).filter(
        KnowledgeEntry.student_id == student_id).all()
    recent_sessions = db.query(TutoringSession).filter(
        TutoringSession.student_id == student_id
    ).order_by(TutoringSession.started_at.desc()).limit(5).all()
    return student, knowledge, list(reversed(recent_sessions))


def parse_exercise_prompt(exercise_prompt: str, student_profile: dict) -> list[dict]:
    """
    Parse the teacher's prompt into trackable tasks.
    Each task has:
    - description: full instruction for COPA (internal)
    - label: short hint badge for the student (e.g. "Say something positive ✦")
    """
    if not exercise_prompt or not exercise_prompt.strip():
        return []

    interests = ", ".join(student_profile.get("interests", [])) or "general topics"

    prompt = f"""A teacher wrote this exercise instruction:

"{exercise_prompt}"

Student: {student_profile.get('name')}, age {student_profile.get('age', 16)}, interests: {interests}

Parse into individual trackable tasks. For each produce:
1. "description" — full instruction for COPA (e.g. "Elicit an affirmative present perfect sentence about their football experience")
2. "label" — a short hint that tells the student roughly what kind of thing they need to express, without giving away the grammar form. Think of it as a teaser badge.
   Good labels: "Something you've done ✦", "Something you haven't tried yet ✦", "Ask about an experience ✦", "A goal you've had ✦"
   Bad labels: "Affirmative sentence ✦", "Write negative form ✦", "Grammar task ✦"
   The label should feel like a conversation prompt hint, not a grammar instruction.

Respond ONLY with a JSON array:
[
  {{"id": 1, "description": "Elicit an affirmative present perfect sentence about their football or sports experience", "label": "Something you've done ✦", "type": "produce_sentence", "done": false}},
  {{"id": 2, "description": "Elicit a negative present perfect sentence about something they haven't done", "label": "Something you haven't tried yet ✦", "type": "produce_sentence", "done": false}},
  {{"id": 3, "description": "Elicit a present perfect question about someone else's experience", "label": "Ask about an experience ✦", "type": "produce_sentence", "done": false}}
]

Rules:
- Split compound instructions into individual tasks
- "description" is detailed, for COPA only
- "label" is a conversational hint, 3-6 words + ✦, no grammar jargon
- done: false for all
- Max 10 tasks"""

    result_text = llm.generate(
        system_prompt="You are an educational content parser. Respond ONLY with valid JSON array.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800
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
        return tasks
    except (json.JSONDecodeError, ValueError):
        return [{"id": 1, "description": exercise_prompt[:200], "label": "Express yourself ✦", "type": "produce_sentence", "done": False, "attempts": 0}]


def evaluate_task_completion(
    task: dict,
    student_message: str,
    conversation_history: list[dict],
    student_profile: dict
) -> bool:
    """
    Ask the LLM whether the student's latest message completed a given task.
    Generous — a good-faith attempt counts.
    """
    recent = conversation_history[-6:] if len(conversation_history) > 6 else conversation_history
    context = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in recent)

    prompt = f"""Did the student complete this task in their latest message?

TASK: {task['description']}
TASK TYPE: {task.get('type', 'produce_sentence')}

RECENT CONVERSATION:
{context}

STUDENT'S LATEST MESSAGE: {student_message}

Answer ONLY "yes" or "no". Minor grammar errors are fine — if the structure/form was attempted, say yes."""

    result = llm.generate(
        system_prompt="You evaluate whether a student completed a language task. Answer only 'yes' or 'no'.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=10
    )
    return result.strip().lower().startswith("yes")


# ──────────────────────────────────────────
# System prompt
# ──────────────────────────────────────────

def build_system_prompt(
    student: Student,
    knowledge: list[KnowledgeEntry],
    recent_sessions: list[TutoringSession],
    is_onboarding: bool,
    session_phase: str,
    current_course: Course = None,
    turn_count: int = 0,
    tasks: list[dict] = None,
) -> str:

    interests_list = student.interests or []
    interests_str = ", ".join(interests_list) if interests_list else "not yet known"

    issues_text = ""
    if student.issues:
        issues_text = f"\nLearner needs: {', '.join(student.issues)} — adapt accordingly."

    known = [k for k in knowledge if k.mastery_level >= 0.4]
    struggling = [k for k in knowledge if k.struggles]
    knowledge_note = ""
    if known:
        knowledge_note += f"\nAlready comfortable with: {', '.join(k.concept for k in known[:8])}"
    if struggling:
        knowledge_note += f"\nRecent struggles: {', '.join(k.concept for k in struggling[:4])}"

    history = ""
    for s in recent_sessions[-3:]:
        d = s.started_at.strftime('%b %d') if s.started_at else "?"
        history += f"  - {d}: {s.topic or 'General'}\n"
    if not history:
        history = "  No previous sessions.\n"

    course_block = ""
    if current_course:
        course_block = f"\nCurrent course: {current_course.title}"
        if current_course.subject:
            course_block += f" ({current_course.subject})"
        if current_course.concepts:
            course_block += f"\nTarget language items: {', '.join(current_course.concepts[:20])}"

    # Task block — teacher's exercises
    task_block = ""
    if tasks:
        pending = [t for t in tasks if not t.get("done")]
        done_tasks = [t for t in tasks if t.get("done")]
        if pending:
            next_task = pending[0]
            task_block = f"""

TEACHER'S EXERCISE TASKS ({len(done_tasks)}/{len(tasks)} completed):
Next task: {next_task['description']}
Remaining after that: {len(pending) - 1} more

HOW TO HANDLE TASKS:
- Work toward the next task naturally through conversation — never name it or say "now do task X"
- Create a scenario, question, or game that makes the student produce what the task requires
- When they complete it, move on to the next task seamlessly
- The student should feel like they're just chatting, not doing exercises"""
        else:
            task_block = f"\n\nAll {len(tasks)} teacher tasks completed! Continue the conversation freely."

    # ── Phase instructions ──────────────────

    if is_onboarding:
        phase_text = f"""
FIRST MEETING.
1. Greet {student.name} warmly. Introduce yourself as COPA — their personal English conversation partner.
2. Mention briefly: what they say stays private; their teacher only sees progress scores.
3. Have a real flowing chat. Learn 1-2 things about them from what they naturally share.
4. ONE question at a time max. Never repeat a question.
5. Once you know something about them, tag it and keep talking:
   <discovered_interests>["interest"]</discovered_interests>
Vibe: cool older friend, not a registration form."""

    elif session_phase == "warmup":
        phase_text = f"""
WARMUP — short genuine chat, then weave in the first piece of course language naturally.

React to what the student says. Find the grammar/vocab hook in whatever they share.
GOOD: student says "I went to Ifrane" → you respond, then say "I've never been there actually — I've heard it's stunning in winter" (you just used present perfect, naturally)
BAD: "OK! Let's start our lesson on present perfect."

If student gives dead-end replies → use a known interest ({interests_str}) to spark a topic first.
Never ask a 3rd question if the first two got short replies — just transition.
Tag new interests: <discovered_interests>["interest"]</discovered_interests>"""

    else:
        # Core conversation phase
        phase_text = f"""
CONVERSATION PHASE — turn {turn_count} of this session.

You are COPA — a friendly, curious person having a genuine conversation with {student.name}.
Your hidden goal: make the course's target language appear naturally in the conversation.

━━━ TONE FIRST ━━━
Be warm, genuinely interested, and reactive. You are not running a lesson.
React to what the student says before doing anything else.
If they say "yes I did" — react to THAT specifically, not to something unrelated.
If they give short answers ("no", "nothing") — don't interrogate, just keep it light and follow their energy.
ONE question per response maximum. Short, natural responses — not essays.

━━━ HOW TO BRING IN THE TARGET LANGUAGE ━━━
Use these techniques naturally, as opportunities arise — not as a mandatory rotation:

• MODEL IT YOURSELF: Use the target structure in your own sentences first. Don't announce it.
  Student mentions going somewhere → "Oh I've never been there actually — have you been in summer too?"
  The structure is there. You said it. They heard it. That's enough.

• CREATE A REASON: Build a scenario where they naturally need to use the target language.
  "I'm trying to plan a trip — which cities in Morocco have you already visited? I want to avoid suggesting places you've been to."
  They answer using present perfect because the situation calls for it.

• FLIP IT: Occasionally pretend you don't know something they're good at.
  "Wait, you play volleyball? I genuinely don't understand the scoring — how does it work?"
  Now they explain in English. Rich, motivated output.

• SLIP IN A GAME: Every few turns, drop a casual 2-line challenge tied to what they just said.
  "Quick one — how would you say that using 'have'? Like 'I ___ already ___...'"
  Keep it playful. React to their answer and move on immediately.

━━━ HARD RULES ━━━
SHORT ANSWERS ("yes", "no", "nothing", single words) — this is the most important rule:
  When the student gives a short answer, look at YOUR OWN last message to understand what they answered.
  "yes" after you asked about football → they said yes about football. React to that. Don't jump topics.
  "no" after you asked about games → they don't play games. React: "fair enough, what do you do to chill?"
  NEVER respond to a short answer by asking about a completely different topic.
  ALWAYS acknowledge what they just confirmed/denied before moving on.

Read the full conversation before responding — never re-ask something already answered.
Never ask more than one question per turn.
Follow topic switches — if they move on, go with them.
Recasts not corrections: if they make a target-language error, echo it correctly in your own next sentence without flagging it.
  They: "I have went to Fes" → You: "Oh you've been to Fes! What was it like?"

Tag course concepts introduced: <concepts>["present perfect positive"]</concepts>
Tag new interests discovered: <discovered_interests>["volleyball"]</discovered_interests>
Red flags: <red_flag>description</red_flag>"""

    return f"""You are COPA — {student.name}'s English conversation partner. Age {student.age}.

Your role: have genuine conversations. The course content gets absorbed through the conversation itself.
Never break the fourth wall. Never say "as your tutor" or "let's do an exercise."
{issues_text}

STUDENT PROFILE:
- Interests: {interests_str}
{knowledge_note}

RECENT SESSIONS:
{history}{course_block}{task_block}

{phase_text}

PRIVACY: Student messages are private. Teacher only sees progress metrics."""


# ──────────────────────────────────────────
# Vocab / mastery helpers (kept for API endpoints)
# ──────────────────────────────────────────

def get_vocab_progress(db: Session, student_id: int) -> dict:
    current_course = db.query(Course).filter(Course.is_current == True).first()
    if not current_course or not current_course.vocabulary:
        return {"total": 0, "learned": 0, "remaining": 0, "recent_words": [], "next_words": []}
    all_vocab = [w.strip().lower() for w in current_course.vocabulary if w.strip()]
    total = len(all_vocab)
    if total == 0:
        return {"total": 0, "learned": 0, "remaining": 0, "recent_words": [], "next_words": []}
    vocab_set = set(all_vocab)
    vocab_entries = {
        k.concept.lower(): k.mastery_level
        for k in db.query(KnowledgeEntry).filter(
            KnowledgeEntry.student_id == student_id,
            KnowledgeEntry.course_id == current_course.id
        ).all()
        if k.concept.lower() in vocab_set
    }
    learned = [w for w in all_vocab if vocab_entries.get(w, 0.0) >= 0.5]
    remaining = [w for w in all_vocab if vocab_entries.get(w, 0.0) < 0.5]
    return {"total": total, "learned": len(learned), "remaining": len(remaining),
            "recent_words": learned[-6:], "next_words": remaining[:4]}


def generate_adapted_mastery_questions(
    student_profile: dict,
    raw_questions: list[dict],
    course_context: str = ""
) -> list[dict]:
    if not raw_questions:
        return []
    interests = ", ".join(student_profile.get("interests", [])) or "general topics"
    questions_block = "\n".join(
        f"{i+1}. [{q.get('difficulty','medium')}] {q['text']}"
        for i, q in enumerate(raw_questions)
    )
    prompt = f"""Adapt these questions into personalised exercises.
STUDENT: {student_profile.get('name')}, age {student_profile.get('age', 16)}, interests: {interests}
QUESTIONS:
{questions_block}
{f'COURSE CONTEXT: {course_context[:600]}' if course_context else ''}
Respond ONLY with a JSON array:
[{{"type":"quiz"|"open","question":"...","correct_answer":"...","key_points":[],"options":[],"hints":[],"difficulty":"medium","concept":"..."}}]"""
    result_text = llm.generate(
        system_prompt="You are an educational content designer. Respond ONLY with valid JSON array.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1500
    )
    try:
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        exercises = json.loads(result_text)
        if not isinstance(exercises, list):
            raise ValueError
        return exercises
    except (json.JSONDecodeError, ValueError):
        return [{"type": "open", "question": q["text"], "correct_answer": "",
                 "key_points": [], "hints": [], "difficulty": q.get("difficulty", "medium"),
                 "concept": ""} for q in raw_questions]


# ──────────────────────────────────────────
# Main chat function
# ──────────────────────────────────────────

def chat(db: Session, student_id: int, message: str, session_id: int = None) -> dict:
    student, knowledge, recent_sessions = get_student_context(db, student_id)
    if not student:
        return {"response": "Student not found.", "session_id": 0, "concepts_touched": []}

    # Phase
    is_onboarding = not student.onboarded
    if is_onboarding:
        session_phase = "onboarding"
    elif session_id:
        existing = db.query(TutoringSession).filter(TutoringSession.id == session_id).first()
        session_phase = existing.phase if existing else "warmup"
    else:
        session_phase = "warmup"

    # Current course (always fresh)
    current_course = db.query(Course).filter(Course.is_current == True).first()

    # RAG — retrieve relevant course chunks, filtered to current course
    context_text = ""
    if current_course:
        chunks = retrieve(query=message, n_results=5, course_filter=current_course.title)
        if not chunks:
            chunks = retrieve(query=message, n_results=20)
            chunks = [c for c in chunks
                      if c.get("course_title", "").strip().lower() == current_course.title.strip().lower()]
        if chunks:
            context_text = "\n---\n".join(
                f"[{c['course_title']}, p.{c['page']}]\n{c['text']}" for c in chunks[:5]
            )

    # Session — detect course change
    course_changed = False
    session = None
    if session_id:
        session = db.query(TutoringSession).filter(TutoringSession.id == session_id).first()
        if session:
            new_course_id = current_course.id if current_course else None
            if session.course_id != new_course_id:
                course_changed = True
                session.course_id = new_course_id
                session.topic = current_course.title if current_course else ""
                session.phase = "warmup"
                session.messages = []
                session_phase = "warmup"
        else:
            session_id = None

    if not session_id:
        session = TutoringSession(
            student_id=student_id,
            course_id=current_course.id if current_course else None,
            mode="text", phase=session_phase,
            topic=current_course.title if current_course else "",
            messages=[]
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    current_messages = session.messages or []
    turn_count = sum(1 for m in current_messages if m["role"] == "assistant")

    # ── Task system ──────────────────────────
    tasks = []
    if current_course and getattr(current_course, "exercise_prompt", None):
        student_profile_for_tasks = {
            "name": student.name, "age": student.age,
            "interests": student.interests or []
        }

        # Load persisted tasks or parse fresh
        stored_tasks = None
        if hasattr(session, "tasks_state") and session.tasks_state:
            try:
                stored_tasks = json.loads(session.tasks_state)
            except (json.JSONDecodeError, TypeError):
                stored_tasks = None

        if stored_tasks is None:
            tasks = parse_exercise_prompt(
                current_course.exercise_prompt, student_profile_for_tasks
            )
        else:
            tasks = stored_tasks

        # Evaluate completion of the next pending task
        if tasks and session_phase == "chat":
            for task in tasks:
                if not task.get("done"):
                    if evaluate_task_completion(
                        task, message, current_messages, student_profile_for_tasks
                    ):
                        task["done"] = True
                        task["attempts"] = task.get("attempts", 0)
                    else:
                        # Increment attempt count for the current pending task
                        task["attempts"] = task.get("attempts", 0) + 1
                    break  # One at a time, sequential

        # Persist task state as JSON string (column is Text)
        if hasattr(session, "tasks_state"):
            session.tasks_state = json.dumps(tasks)

    # Build prompt
    system_prompt = build_system_prompt(
        student=student, knowledge=knowledge, recent_sessions=recent_sessions,
        is_onboarding=is_onboarding, session_phase=session_phase,
        current_course=current_course, turn_count=turn_count,
        tasks=tasks,
    )

    # Message history — cap to last 16 messages to prevent context overflow
    # Full history is kept in DB, but we only send a window to the LLM
    history_window = current_messages[-16:] if len(current_messages) > 16 else current_messages
    messages = [{"role": m["role"], "content": m["content"]} for m in history_window]

    # Inject course context only on lesson/chat turns, not every single message
    # This reduces noise that crowds out conversation history
    user_content = message
    if context_text and session_phase in ("chat", "warmup") and turn_count % 3 == 0:
        # Only inject course context every 3 turns to save context space
        user_content = (
            f"<course_reference>\n{context_text}\n</course_reference>\n\n"
            f"[Background reference only — do not quote or teach from directly.]\n\nStudent: {message}"
        )

    messages.append({"role": "user", "content": user_content})

    assistant_text = llm.generate(
        system_prompt=system_prompt,
        messages=messages,
        max_tokens=500
    )

    # Parse tags
    concepts_tags   = extract_tag_content(assistant_text, "concepts")
    red_flags       = extract_tag_content(assistant_text, "red_flag")
    new_interests   = extract_tag_content(assistant_text, "discovered_interests")
    suggest_mastery = bool(extract_tag_content(assistant_text, "suggest_mastery_check"))

    concepts_touched = []
    for tag in concepts_tags:
        try:
            concepts_touched.extend(json.loads(tag))
        except json.JSONDecodeError:
            pass

    # Update interests
    if new_interests:
        try:
            discovered = json.loads(new_interests[0])
            current_interests = student.interests or []
            for interest in discovered:
                if interest.lower() not in [i.lower() for i in current_interests]:
                    current_interests.append(interest)
            student.interests = current_interests
            if is_onboarding:
                student.onboarded = True
        except json.JSONDecodeError:
            pass

    # Clean response
    clean_response = assistant_text
    for tag in ["concepts", "red_flag", "discovered_interests", "suggest_mastery_check"]:
        clean_response = re.sub(f"<{tag}>.*?</{tag}>", "", clean_response, flags=re.DOTALL)
    clean_response = clean_response.strip()

    # Update session — store user_content so course context is in history for continuity
    current_messages.append({"role": "user", "content": user_content})
    current_messages.append({"role": "assistant", "content": clean_response})
    session.messages = current_messages
    session.ended_at = datetime.now(timezone.utc)
    if session.started_at:
        started = session.started_at.replace(tzinfo=None)
        ended = session.ended_at.replace(tzinfo=None)
        session.duration_minutes = (ended - started).total_seconds() / 60

    # Phase transitions
    if session_phase == "onboarding" and student.onboarded:
        session.phase = "warmup"
    elif session_phase == "warmup":
        if sum(1 for m in current_messages if m["role"] == "user") >= 2:
            session.phase = "chat"

    if red_flags:
        flags = session.red_flags or []
        flags.extend(red_flags)
        session.red_flags = flags

    # Knowledge map — update concepts touched with gradual mastery increment
    for concept_name in concepts_touched:
        entry = db.query(KnowledgeEntry).filter(
            KnowledgeEntry.student_id == student_id,
            KnowledgeEntry.concept == concept_name
        ).first()
        if not entry:
            entry = KnowledgeEntry(
                student_id=student_id,
                course_id=current_course.id if current_course else None,
                concept=concept_name,
                mastery_level=0.1,
                attempts=1,
                correct=0
            )
            db.add(entry)
        else:
            # Each conversational exposure nudges mastery up, capped at 0.65
            # (full mastery 0.7+ requires explicit exercise evaluation)
            entry.attempts = (entry.attempts or 0) + 1
            exposure_boost = 0.05
            entry.mastery_level = min(entry.mastery_level + exposure_boost, 0.65)
        entry.last_seen = datetime.now(timezone.utc)

    # Course progress
    if current_course:
        progress = db.query(CourseProgress).filter(
            CourseProgress.student_id == student_id,
            CourseProgress.course_id == current_course.id
        ).first()
        if not progress:
            progress = CourseProgress(
                student_id=student_id, course_id=current_course.id,
                concepts_total=len(current_course.concepts or []) or 1,
                vocab_total=len(current_course.vocabulary or []),
                status="in_progress"
            )
            db.add(progress)

        course_knowledge = db.query(KnowledgeEntry).filter(
            KnowledgeEntry.student_id == student_id,
            KnowledgeEntry.course_id == current_course.id
        ).all()
        mastered = len([k for k in course_knowledge if k.mastery_level >= 0.7])
        total = progress.concepts_total or 1
        progress.concepts_mastered = mastered
        progress.completion_pct = min(mastered / total, 1.0)
        progress.status = "completed" if progress.completion_pct >= 1.0 else "in_progress"
        progress.last_activity = datetime.now(timezone.utc)

    new_badges = check_and_award_badges(db, student)
    db.commit()

    course_complete = False
    if current_course:
        p = db.query(CourseProgress).filter(
            CourseProgress.student_id == student_id,
            CourseProgress.course_id == current_course.id
        ).first()
        course_complete = bool(p and p.status == "completed")

    return {
        "response": clean_response,
        "session_id": session.id,
        "exercise": None,
        "concepts_touched": concepts_touched,
        "phase": session.phase,
        "new_badges": new_badges,
        "vocab_used": [],
        "vocab_introduced": [],
        "course_changed": course_changed,
        "suggest_mastery_check": suggest_mastery,
        "course_complete": course_complete,
        "tasks": tasks,
    }