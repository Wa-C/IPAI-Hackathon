from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
import shutil
from pathlib import Path
from datetime import datetime, timezone, timedelta

from app.models.database import (
    Student, KnowledgeEntry, TutoringSession, Course,
    CourseProgress, Badge, get_db
)
from app.models.schemas import StudentCreate, StudentResponse, ChatMessage, ChatResponse, CourseResponse, WeeklyReport
from app.rag.pipeline import ingest_pdf, retrieve, delete_course_chunks
from app.agents.tutor import chat as tutor_chat, generate_adapted_mastery_questions, get_vocab_progress
from app.agents.exercise_gen import generate_exercise
from app.agents.evaluator import evaluate_answer, evaluate_mastery_batch
from app.agents.prereq_checker import check_prerequisites, generate_review
from app.agents.reporter import generate_weekly_report
from app.config import settings

router = APIRouter()


# ──────────────────────────────────────────
# Students
# ──────────────────────────────────────────

@router.post("/students", response_model=StudentResponse)
def create_student(student: StudentCreate, db: DBSession = Depends(get_db)):
    db_student = Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.get("/students", response_model=list[StudentResponse])
def list_students(db: DBSession = Depends(get_db)):
    return db.query(Student).all()

@router.get("/students/{student_id}")
def get_student(student_id: int, db: DBSession = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return {
        "id": student.id, "name": student.name, "age": student.age,
        "interests": student.interests, "learning_style": student.learning_style,
        "issues": student.issues, "notes": student.notes, "onboarded": student.onboarded,
        "weekly_goal_minutes": student.weekly_goal_minutes,
        "created_at": student.created_at.isoformat() if student.created_at else None
    }

@router.get("/students/{student_id}/knowledge")
def get_knowledge(student_id: int, db: DBSession = Depends(get_db)):
    entries = db.query(KnowledgeEntry).filter(KnowledgeEntry.student_id == student_id).all()
    return [{"concept": e.concept, "mastery_level": e.mastery_level, "attempts": e.attempts,
             "correct": e.correct, "struggles": e.struggles, "course_id": e.course_id,
             "last_seen": e.last_seen.isoformat() if e.last_seen else None} for e in entries]


# ──────────────────────────────────────────
# Courses
# ──────────────────────────────────────────

@router.post("/courses/upload", response_model=CourseResponse)
async def upload_course(
    file: UploadFile = File(...), title: str = Form(...),
    subject: str = Form(""), week_number: int = Form(0),
    vocabulary: str = Form(""),
    db: DBSession = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    upload_dir = Path(settings.upload_path)
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        chunk_count = ingest_pdf(str(file_path), title, subject)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

    vocab_list = [v.strip() for v in vocabulary.split(",") if v.strip()] if vocabulary else []

    # New upload becomes the current course
    db.query(Course).update({Course.is_current: False})
    db.commit()

    course = Course(
        title=title, subject=subject, filename=file.filename,
        chunk_count=chunk_count, week_number=week_number,
        vocabulary=vocab_list, is_current=True
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.get("/courses", response_model=list[CourseResponse])
def list_courses(db: DBSession = Depends(get_db)):
    return db.query(Course).order_by(Course.week_number).all()

@router.delete("/courses/{course_id}")
def delete_course(course_id: int, db: DBSession = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    was_current = course.is_current
    try:
        delete_course_chunks(course.title)
    except Exception:
        pass
    file_path = Path(settings.upload_path) / course.filename
    if file_path.exists():
        file_path.unlink()
    # Remove all progress and knowledge entries tied to this course
    db.query(CourseProgress).filter(CourseProgress.course_id == course_id).delete()
    db.query(KnowledgeEntry).filter(KnowledgeEntry.course_id == course_id).delete()
    db.delete(course)
    db.commit()
    # If we deleted the current course, make the most recent remaining course current
    if was_current:
        next_course = db.query(Course).order_by(Course.week_number.desc()).first()
        if next_course:
            next_course.is_current = True
            db.commit()
    return {"status": "deleted", "title": course.title}

@router.patch("/courses/{course_id}/set-current")
def set_current_course(course_id: int, db: DBSession = Depends(get_db)):
    db.query(Course).update({Course.is_current: False})
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.is_current = True
    db.commit()
    return {"status": "ok", "current_course": course.title}


class ExercisePromptRequest(BaseModel):
    prompt: str

@router.get("/courses/{course_id}/exercise-prompt")
def get_exercise_prompt(course_id: int, db: DBSession = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"prompt": getattr(course, "exercise_prompt", "") or ""}

@router.put("/courses/{course_id}/exercise-prompt")
def save_exercise_prompt(
    course_id: int,
    body: ExercisePromptRequest,
    db: DBSession = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.exercise_prompt = body.prompt.strip()
    db.commit()
    return {"saved": True, "course_id": course_id}


# ──────────────────────────────────────────
# Mastery questions (teacher sets, student answers)
# ──────────────────────────────────────────

class RawQuestion(BaseModel):
    text: str
    difficulty: str = "medium"

class SaveMasteryQuestionsRequest(BaseModel):
    questions: list[RawQuestion]

class AnswerItem(BaseModel):
    question_index: int
    question: dict
    answer: str

class EvaluateMasteryRequest(BaseModel):
    student_id: int
    answers: list[AnswerItem]

@router.get("/courses/{course_id}/mastery-questions-raw")
def get_raw_mastery_questions(course_id: int, db: DBSession = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course.mastery_questions or []

@router.put("/courses/{course_id}/mastery-questions-raw")
def save_raw_mastery_questions(
    course_id: int,
    body: SaveMasteryQuestionsRequest,
    db: DBSession = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.mastery_questions = [q.model_dump() for q in body.questions]
    db.commit()
    return {"saved": len(body.questions)}

@router.get("/courses/{course_id}/mastery-questions")
def get_adapted_mastery_questions(
    course_id: int,
    student_id: int,
    db: DBSession = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    raw_questions = course.mastery_questions or []
    if not raw_questions:
        return []

    student_profile = {
        "name": student.name, "age": student.age,
        "interests": student.interests or [],
        "learning_style": student.learning_style or "visual"
    }
    course_context = ""
    if hasattr(course, "chunks") and course.chunks:
        course_context = " ".join(c.get("text", "") for c in course.chunks[:3])

    return generate_adapted_mastery_questions(
        student_profile=student_profile,
        raw_questions=raw_questions,
        course_context=course_context
    )

@router.post("/courses/{course_id}/mastery-evaluate")
def evaluate_mastery(
    course_id: int,
    body: EvaluateMasteryRequest,
    db: DBSession = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == body.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_profile = {
        "name": student.name, "age": student.age,
        "interests": student.interests or [],
        "learning_style": student.learning_style or "visual"
    }
    result = evaluate_mastery_batch(
        student_profile=student_profile,
        answers=[a.model_dump() for a in body.answers]
    )

    if result["score_pct"] >= 80:
        progress = db.query(CourseProgress).filter(
            CourseProgress.student_id == body.student_id,
            CourseProgress.course_id == course_id
        ).first()
        if progress and hasattr(progress, "mastery_validated"):
            progress.mastery_validated = True
            db.commit()

    return result


# ──────────────────────────────────────────
# Vocabulary progress
# ──────────────────────────────────────────

@router.get("/students/{student_id}/vocab-progress")
def vocab_progress(student_id: int, db: DBSession = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return get_vocab_progress(db, student_id)


# ──────────────────────────────────────────
# Course progress timeline
# ──────────────────────────────────────────

@router.get("/students/{student_id}/progress")
def get_progress(student_id: int, db: DBSession = Depends(get_db)):
    courses = db.query(Course).order_by(Course.week_number).all()
    progress_records = db.query(CourseProgress).filter(
        CourseProgress.student_id == student_id
    ).all()
    progress_map = {p.course_id: p for p in progress_records}

    timeline = []
    for course in courses:
        p = progress_map.get(course.id)
        timeline.append({
            "course_id": course.id,
            "title": course.title,
            "subject": course.subject,
            "week_number": course.week_number,
            "is_current": course.is_current,
            "completion_pct": round(p.completion_pct * 100) if p else 0,
            "concepts_mastered": p.concepts_mastered if p else 0,
            "concepts_total": p.concepts_total if p else (len(course.concepts) if course.concepts else 0),
            "status": p.status if p else "not_started",
            "last_activity": p.last_activity.isoformat() if p and p.last_activity else None
        })
    return timeline


# ──────────────────────────────────────────
# Weekly time tracking
# ──────────────────────────────────────────

@router.get("/students/{student_id}/weekly-time")
def get_weekly_time(student_id: int, db: DBSession = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    week_start = datetime.now(timezone.utc) - timedelta(days=datetime.now(timezone.utc).weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)

    sessions = db.query(TutoringSession).filter(
        TutoringSession.student_id == student_id,
        TutoringSession.started_at >= week_start
    ).all()

    total_minutes = sum(s.duration_minutes or 0 for s in sessions)

    return {
        "total_minutes": round(total_minutes, 1),
        "goal_minutes": student.weekly_goal_minutes,
        "max_minutes": student.weekly_max_minutes,
        "pct_complete": round(min(total_minutes / max(student.weekly_goal_minutes, 1), 1.0) * 100),
        "sessions_this_week": len(sessions)
    }


# ──────────────────────────────────────────
# Badges
# ──────────────────────────────────────────

@router.get("/students/{student_id}/badges")
def get_badges(student_id: int, db: DBSession = Depends(get_db)):
    badges = db.query(Badge).filter(Badge.student_id == student_id).order_by(Badge.earned_at.desc()).all()
    return [{"type": b.badge_type, "title": b.title, "description": b.description,
             "earned_at": b.earned_at.isoformat()} for b in badges]


# ──────────────────────────────────────────
# Chat
# ──────────────────────────────────────────

@router.post("/chat")
def send_message(msg: ChatMessage, db: DBSession = Depends(get_db)):
    result = tutor_chat(db=db, student_id=msg.student_id, message=msg.message, session_id=msg.session_id)
    return result


# ──────────────────────────────────────────
# Exercises
# ──────────────────────────────────────────

class ExerciseRequest(BaseModel):
    student_id: int
    concept: str
    difficulty: str = "medium"
    preferred_type: str = "auto"

class AnswerRequest(BaseModel):
    student_id: int
    session_id: int
    exercise: dict
    answer: str

@router.post("/exercises/generate")
def gen_exercise(req: ExerciseRequest, db: DBSession = Depends(get_db)):
    student = db.query(Student).filter(Student.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    current_course = db.query(Course).filter(Course.is_current == True).first()
    chunks = retrieve(query=req.concept, n_results=3, course_filter=current_course.title if current_course else None)
    context = "\n".join(c["text"] for c in chunks) if chunks else ""
    profile = {"name": student.name, "age": student.age, "interests": student.interests or [],
               "learning_style": student.learning_style, "issues": student.issues or []}
    return generate_exercise(student_profile=profile, concept=req.concept, difficulty=req.difficulty,
                             course_context=context, preferred_type=req.preferred_type, recent_types=[])

@router.post("/exercises/evaluate")
def eval_answer(req: AnswerRequest, db: DBSession = Depends(get_db)):
    student = db.query(Student).filter(Student.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    profile = {"name": student.name, "age": student.age, "interests": student.interests or [],
               "learning_style": student.learning_style}
    result = evaluate_answer(student_profile=profile, exercise=req.exercise, student_answer=req.answer)

    concept = req.exercise.get("concept", "general")
    entry = db.query(KnowledgeEntry).filter(
        KnowledgeEntry.student_id == req.student_id, KnowledgeEntry.concept == concept
    ).first()
    if not entry:
        entry = KnowledgeEntry(student_id=req.student_id, concept=concept)
        db.add(entry)
    entry.attempts += 1
    if result["score"] >= 1.0:
        entry.correct += 1
    elif result["score"] >= 0.5:
        entry.correct += 0.5
    entry.mastery_level = entry.correct / max(entry.attempts, 1)
    if result.get("misconception"):
        struggles = entry.struggles or []
        struggles.append(result["misconception"])
        entry.struggles = struggles[-10:]

    session = db.query(TutoringSession).filter(TutoringSession.id == req.session_id).first()
    if session:
        session.exercises_given = (session.exercises_given or 0) + 1
        if result["score"] >= 1.0:
            session.exercises_correct = (session.exercises_correct or 0) + 1
    db.commit()
    return result


# ──────────────────────────────────────────
# Prerequisites
# ──────────────────────────────────────────

class PrereqRequest(BaseModel):
    student_id: int
    concept: str

@router.post("/prerequisites/check")
def check_prereqs(req: PrereqRequest, db: DBSession = Depends(get_db)):
    student = db.query(Student).filter(Student.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    knowledge = db.query(KnowledgeEntry).filter(KnowledgeEntry.student_id == req.student_id).all()
    km = [{"concept": k.concept, "mastery_level": k.mastery_level, "struggles": k.struggles or []} for k in knowledge]
    sl = []
    for k in knowledge:
        if k.struggles:
            for s in k.struggles:
                sl.append({"concept": k.concept, "misconception": s, "score": k.mastery_level})
    current_course = db.query(Course).filter(Course.is_current == True).first()
    chunks = retrieve(query=req.concept, n_results=3, course_filter=current_course.title if current_course else None)
    context = "\n".join(c["text"] for c in chunks) if chunks else ""
    result = check_prerequisites(concept=req.concept, knowledge_map=km, struggle_log=sl, course_context=context)
    if not result["ready"] and result["missing_prerequisites"]:
        gap = result["missing_prerequisites"][0]
        profile = {"name": student.name, "age": student.age, "interests": student.interests or [], "learning_style": student.learning_style}
        result["review_lesson"] = generate_review(student_profile=profile, concept=gap["concept"], reason=gap.get("reason", ""), course_context=context)
    return result


# ──────────────────────────────────────────
# Teacher dashboard
# ──────────────────────────────────────────

@router.get("/dashboard")
def teacher_dashboard(db: DBSession = Depends(get_db)):
    students = db.query(Student).all()
    week_start = datetime.now(timezone.utc) - timedelta(days=datetime.now(timezone.utc).weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)

    dashboard = []
    for s in students:
        sessions = db.query(TutoringSession).filter(
            TutoringSession.student_id == s.id,
            TutoringSession.started_at >= week_start
        ).all()
        weekly_mins = sum(se.duration_minutes or 0 for se in sessions)
        flags = []
        for se in sessions:
            if se.red_flags:
                flags.extend(se.red_flags)
        knowledge = db.query(KnowledgeEntry).filter(KnowledgeEntry.student_id == s.id).all()
        avg_mastery = sum(k.mastery_level for k in knowledge) / len(knowledge) if knowledge else 0

        dashboard.append({
            "id": s.id, "name": s.name, "age": s.age,
            "weekly_minutes": round(weekly_mins, 1),
            "weekly_goal": s.weekly_goal_minutes,
            "goal_pct": round(min(weekly_mins / max(s.weekly_goal_minutes, 1), 1.0) * 100),
            "sessions_this_week": len(sessions),
            "avg_mastery": round(avg_mastery * 100),
            "concepts_tracked": len(knowledge),
            "red_flags": flags,
            "onboarded": s.onboarded
        })
    return dashboard


# ──────────────────────────────────────────
# Sessions + Reports
# ──────────────────────────────────────────

@router.get("/students/{student_id}/sessions")
def get_sessions(student_id: int, limit: int = 10, db: DBSession = Depends(get_db)):
    sessions = db.query(TutoringSession).filter(
        TutoringSession.student_id == student_id
    ).order_by(TutoringSession.started_at.desc()).limit(limit).all()
    return [{"id": s.id, "mode": s.mode, "phase": s.phase,
             "started_at": s.started_at.isoformat() if s.started_at else None,
             "duration_minutes": s.duration_minutes, "topic": s.topic,
             "exercises_given": s.exercises_given, "exercises_correct": s.exercises_correct,
             "message_count": len(s.messages) if s.messages else 0,
             "red_flags": s.red_flags or []} for s in sessions]

@router.get("/students/{student_id}/report", response_model=WeeklyReport)
def get_report(student_id: int, weeks: int = 1, db: DBSession = Depends(get_db)):
    report = generate_weekly_report(db, student_id, weeks_back=weeks)
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    return WeeklyReport(**report)

@router.get("/search")
def search_courses(query: str, n: int = 5):
    return {"query": query, "results": retrieve(query=query, n_results=n)}