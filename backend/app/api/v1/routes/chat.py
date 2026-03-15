"""
Chat API routes — chatbot integration endpoints.

All new routes under /api/v1/chat/*
No modifications to existing routes.
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.db.supabase_client import get_supabase_admin
from app.services.chatbot.tutor import chat as tutor_chat
from app.services.chatbot.exercise_gen import generate_exercise
from app.services.chatbot.evaluator import evaluate_and_update_knowledge

router = APIRouter(prefix="/chat")


# ── Request / Response models ────────────────────────

class ChatRequest(BaseModel):
    student_id: str
    lesson_id: str
    message: str
    session_id: str | None = None


class TaskItem(BaseModel):
    id: int = 0
    label: str = ""
    done: bool = False
    attempts: int = 0


class ChatResponse(BaseModel):
    response: str
    session_id: str | None
    phase: str
    concepts_touched: list[str] = []
    badges: list[dict] | None = None
    tasks: list[TaskItem] = []


class ExerciseRequest(BaseModel):
    student_id: str
    lesson_id: str
    session_id: str
    concept: str | None = None


class EvaluateRequest(BaseModel):
    student_id: str
    lesson_id: str
    session_id: str
    answer: str
    exercise: dict


class EvaluateResponse(BaseModel):
    score: float
    grade: str
    feedback: str
    misconception: str | None = None
    should_review: list[str] = []
    correct_answer: str = ""
    mastery_update: str = ""


class KnowledgeEntry(BaseModel):
    lesson_id: str
    concept: str
    mastery: float
    last_seen: str | None = None


class BadgeEntry(BaseModel):
    badge_type: str
    title: str
    description: str
    earned_at: str | None = None


# ── Routes ───────────────────────────────────────────

@router.post("", response_model=ChatResponse)
async def send_message(body: ChatRequest):
    """Send a message to the COPA tutor and get a response."""
    result = await tutor_chat(
        student_id=body.student_id,
        lesson_id=body.lesson_id,
        message=body.message,
        session_id=body.session_id,
    )
    raw_tasks = result.get("tasks") or []
    task_items = [
        TaskItem(
            id=t.get("id", i),
            label=t.get("label", ""),
            done=bool(t.get("done", False)),
            attempts=t.get("attempts", 0),
        )
        for i, t in enumerate(raw_tasks)
    ]

    return ChatResponse(
        response=result["response"],
        session_id=result["session_id"],
        phase=result["phase"],
        concepts_touched=result.get("concepts_touched", []),
        badges=result.get("badges"),
        tasks=task_items,
    )


@router.post("/exercise")
async def create_exercise(body: ExerciseRequest):
    """Generate an exercise for the student based on the lesson."""
    sb = get_supabase_admin()

    # Get lesson info
    lesson_resp = sb.table("lessons").select("title, topic, base_material").eq(
        "id", body.lesson_id
    ).maybe_single().execute()
    lesson = lesson_resp.data
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Get student name and content format
    student_resp = sb.table("student_profiles").select("name").eq(
        "id", body.student_id
    ).maybe_single().execute()
    student_name = (student_resp.data or {}).get("name", "Student")

    prefs_resp = sb.table("learning_preferences").select("content_format").eq(
        "student_id", body.student_id
    ).maybe_single().execute()
    content_format = (prefs_resp.data or {}).get("content_format", "reading")

    concept = body.concept or lesson.get("topic", "the lesson topic")

    exercise = await generate_exercise(
        student_name=student_name,
        content_format=content_format,
        concept=concept,
        lesson_title=lesson.get("title", ""),
        lesson_context=(lesson.get("base_material") or "")[:1000],
    )

    return exercise


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_exercise(body: EvaluateRequest):
    """Evaluate a student's answer to an exercise."""
    try:
        result = await evaluate_and_update_knowledge(
            student_id=body.student_id,
            lesson_id=body.lesson_id,
            session_id=body.session_id,
            exercise=body.exercise,
            student_answer=body.answer,
        )
        return EvaluateResponse(**result)
    except Exception as e:
        # Return a graceful fallback instead of crashing
        return EvaluateResponse(
            score=0.5,
            grade="partial",
            feedback=f"I had trouble evaluating your answer. Please try again.",
            misconception=None,
            should_review=[],
            correct_answer=body.exercise.get("correct_answer", ""),
            mastery_update="",
        )


@router.get("/history")
async def get_history(student_id: str, lesson_id: str):
    """Get chat history for a student + lesson."""
    sb = get_supabase_admin()

    sessions = sb.table("chat_sessions").select("*").eq(
        "student_id", student_id
    ).eq("lesson_id", lesson_id).order(
        "started_at", desc=True
    ).limit(1).execute()

    if not sessions.data:
        return {"messages": [], "session_id": None}

    session = sessions.data[0]
    raw_tasks = session.get("tasks_state") or []
    task_items = [
        {
            "id": t.get("id", i),
            "label": t.get("label", ""),
            "done": bool(t.get("done", False)),
            "attempts": t.get("attempts", 0),
        }
        for i, t in enumerate(raw_tasks) if isinstance(t, dict)
    ]
    return {
        "messages": session.get("messages") or [],
        "session_id": session["id"],
        "phase": session.get("phase", "warmup"),
        "tasks": task_items,
    }


@router.get("/knowledge", response_model=list[KnowledgeEntry])
async def get_knowledge(student_id: str):
    """Get a student's knowledge/mastery map across all lessons."""
    sb = get_supabase_admin()

    resp = sb.table("chat_knowledge").select(
        "lesson_id, concept, mastery, last_seen"
    ).eq("student_id", student_id).execute()

    return [KnowledgeEntry(**entry) for entry in (resp.data or [])]


@router.get("/badges", response_model=list[BadgeEntry])
async def get_badges(student_id: str):
    """Get all badges earned by a student."""
    sb = get_supabase_admin()

    resp = sb.table("chat_badges").select(
        "badge_type, title, description, earned_at"
    ).eq("student_id", student_id).execute()

    return [BadgeEntry(**entry) for entry in (resp.data or [])]
