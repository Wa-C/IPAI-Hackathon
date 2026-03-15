"""
Report Agent — generates weekly teacher reports from session data.
"""

import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.config import settings
from app.models.database import Student, KnowledgeEntry, TutoringSession
from app.agents.llm_client import llm


def generate_weekly_report(db: Session, student_id: int, weeks_back: int = 1) -> dict:
    """
    Generate a weekly report for a student.
    Aggregates session data and uses Claude to synthesize insights.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {"error": "Student not found"}

    # Get sessions from the past week(s)
    cutoff = datetime.now(timezone.utc) - timedelta(weeks=weeks_back)
    sessions = db.query(TutoringSession).filter(
        TutoringSession.student_id == student_id,
        TutoringSession.started_at >= cutoff
    ).order_by(TutoringSession.started_at).all()

    # Get knowledge entries
    knowledge = db.query(KnowledgeEntry).filter(
        KnowledgeEntry.student_id == student_id
    ).all()

    # Aggregate stats
    total_time = sum(s.duration_minutes or 0 for s in sessions)
    text_time = sum(s.duration_minutes or 0 for s in sessions if s.mode == "text")
    voice_time = sum(s.duration_minutes or 0 for s in sessions if s.mode == "voice")
    total_exercises = sum(s.exercises_given or 0 for s in sessions)
    correct_exercises = sum(s.exercises_correct or 0 for s in sessions)

    # Collect all red flags
    all_flags = []
    for s in sessions:
        if s.red_flags:
            all_flags.extend(s.red_flags)

    # Build session summaries for Claude
    session_details = []
    for s in sessions:
        session_details.append({
            "date": s.started_at.strftime("%Y-%m-%d"),
            "mode": s.mode,
            "duration": f"{s.duration_minutes:.0f} min" if s.duration_minutes else "unknown",
            "topic": s.topic or "General",
            "exercises": f"{s.exercises_correct or 0}/{s.exercises_given or 0}",
            "summary": s.summary or "No summary"
        })

    knowledge_data = []
    for k in knowledge:
        knowledge_data.append({
            "concept": k.concept,
            "mastery": f"{k.mastery_level:.0%}",
            "attempts": k.attempts,
            "correct": k.correct,
            "struggles": k.struggles or []
        })

    # Ask Claude to synthesize
    report_prompt = f"""Analyze this student's weekly tutoring data and generate a teacher report.

STUDENT: {student.name}, age {student.age}
Issues: {', '.join(student.issues) if student.issues else 'None reported'}
Learning style: {student.learning_style}

SESSIONS THIS WEEK:
{json.dumps(session_details, indent=2)}

KNOWLEDGE MAP:
{json.dumps(knowledge_data, indent=2)}

STATS:
- Total sessions: {len(sessions)}
- Total time: {total_time:.0f} minutes (text: {text_time:.0f}m, voice: {voice_time:.0f}m)
- Exercises: {correct_exercises}/{total_exercises} correct

RED FLAGS DETECTED: {json.dumps(all_flags) if all_flags else 'None'}

Generate a JSON report with these fields:
{{
    "strengths": ["list of concepts or behaviors showing progress"],
    "weaknesses": ["list of concepts or areas needing work"],
    "achievements": ["notable accomplishments this week"],
    "red_flags": ["any concerning patterns or behaviors — be specific"],
    "recommendations": ["specific suggestions for the teacher"]
}}

Be specific and actionable. Reference actual concepts and session data."""

    result_text = llm.generate(
        system_prompt="You are an education analytics assistant. Respond ONLY with valid JSON, no markdown fences.",
        messages=[{"role": "user", "content": report_prompt}],
        max_tokens=1000
    )

    try:
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        insights = json.loads(result_text)
    except (json.JSONDecodeError, IndexError):
        insights = {
            "strengths": [],
            "weaknesses": [],
            "achievements": [],
            "red_flags": all_flags,
            "recommendations": ["Unable to generate detailed insights — please review session logs manually."]
        }

    return {
        "student_id": student.id,
        "student_name": student.name,
        "period": f"Last {weeks_back} week(s)",
        "total_sessions": len(sessions),
        "total_time_minutes": round(total_time, 1),
        "text_time_minutes": round(text_time, 1),
        "voice_time_minutes": round(voice_time, 1),
        "exercises_attempted": total_exercises,
        "exercises_correct": correct_exercises,
        **insights
    }
