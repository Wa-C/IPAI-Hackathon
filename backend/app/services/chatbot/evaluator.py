"""
Evaluator Agent — assesses student answers with nuanced grading.

Grading scale: correct (1.0), partial (0.5), wrong (0.0)
Updates chat_knowledge mastery levels based on evaluation results.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone

from app.db.supabase_client import get_supabase_admin
from app.services.chatbot.llm_client import ask_llm


async def evaluate_answer(
    student_name: str,
    exercise: dict,
    student_answer: str,
) -> dict:
    """
    Evaluate a student's answer to an exercise.

    Returns: {score, grade, feedback, misconception, should_review, correct_answer}
    """
    exercise_type = exercise.get("type", "open")

    # Quick exact match for quiz
    if exercise_type == "quiz":
        correct = exercise.get("correct_answer", "").strip().upper()
        given = student_answer.strip().upper()
        if given and given[0] in "ABCD":
            given = given[0]
        if correct and correct[0] in "ABCD":
            correct = correct[0]

        if given == correct:
            return {
                "score": 1.0,
                "grade": "correct",
                "feedback": f"Excellent! That's right. {exercise.get('explanation', '')}",
                "misconception": None,
                "should_review": [],
                "correct_answer": exercise.get("correct_answer", ""),
            }

    # LLM evaluation for open/game/wrong quiz
    prompt = f"""Evaluate this student's answer to an exercise.

STUDENT: {student_name}

EXERCISE TYPE: {exercise_type}
QUESTION: {exercise.get('question', '')}
CORRECT ANSWER: {exercise.get('correct_answer', '')}
{f"KEY POINTS EXPECTED: {json.dumps(exercise.get('key_points', []))}" if exercise.get('key_points') else ''}
STUDENT'S ANSWER: {student_answer}

Grade the answer and respond with ONLY this JSON:
{{
    "score": 1.0 or 0.5 or 0.0,
    "grade": "correct" or "partial" or "wrong",
    "feedback": "Encouraging, specific feedback. Use the student's name.",
    "misconception": null or "description of misunderstanding",
    "should_review": ["concept names to review"]
}}

GRADING RULES:
- correct (1.0): All key points addressed, reasoning is sound
- partial (0.5): Some understanding but missing key elements
- wrong (0.0): Fundamental misunderstanding or completely off-topic
- Be generous with partial — if they show ANY understanding, it's at least partial
- Always be encouraging, even when the answer is wrong"""

    result_text = await ask_llm(
        system_prompt="You are a kind, encouraging teacher evaluating a student's work. Respond ONLY with valid JSON.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
    )

    try:
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        result = json.loads(result_text)
        result["score"] = float(result.get("score", 0.0))
        result["grade"] = result.get("grade", "wrong")
        result["feedback"] = result.get("feedback", "Let me review your answer.")
        result["misconception"] = result.get("misconception")
        result["should_review"] = result.get("should_review", [])
        result["correct_answer"] = exercise.get("correct_answer", "")
        return result
    except (json.JSONDecodeError, ValueError):
        return {
            "score": 0.5,
            "grade": "partial",
            "feedback": "I had trouble evaluating precisely. Can you explain your reasoning?",
            "misconception": None,
            "should_review": [exercise.get("concept", "")],
            "correct_answer": exercise.get("correct_answer", ""),
        }


async def evaluate_and_update_knowledge(
    student_id: str,
    lesson_id: str,
    session_id: str,
    exercise: dict,
    student_answer: str,
) -> dict:
    """
    Evaluate the answer AND update chat_knowledge + chat_sessions in Supabase.
    """
    sb = get_supabase_admin()

    # Get student name (defensive — don't crash if missing)
    student_name = "Student"
    try:
        student_resp = sb.table("student_profiles").select("name").eq(
            "id", student_id
        ).maybe_single().execute()
        student_name = (student_resp.data or {}).get("name", "Student")
    except Exception:
        pass

    # Evaluate
    result = await evaluate_answer(student_name, exercise, student_answer)

    # Update session exercise counts (defensive)
    session_data = {}
    try:
        session_resp = sb.table("chat_sessions").select(
            "exercises_given, exercises_correct"
        ).eq("id", session_id).maybe_single().execute()
        session_data = session_resp.data or {}
    except Exception:
        pass

    exercises_correct = (session_data.get("exercises_correct") or 0)
    if result["score"] >= 0.8:
        exercises_correct += 1

    sb.table("chat_sessions").update({
        "exercises_given": (session_data.get("exercises_given") or 0) + 1,
        "exercises_correct": exercises_correct,
    }).eq("id", session_id).execute()

    # Update knowledge mastery
    concept = exercise.get("concept", "")
    if concept:
        now = datetime.now(timezone.utc).isoformat()
        existing = sb.table("chat_knowledge").select("*").eq(
            "student_id", student_id
        ).eq("lesson_id", lesson_id).eq("concept", concept).maybe_single().execute()

        mastery_delta = {1.0: 0.15, 0.5: 0.05, 0.0: -0.05}.get(result["score"], 0)

        if existing.data:
            entry = existing.data
            new_mastery = max(0.0, min((entry.get("mastery") or 0) + mastery_delta, 1.0))
            new_correct = (entry.get("correct") or 0) + result["score"]
            struggles = entry.get("struggles") or []
            if result.get("misconception"):
                struggles.append(result["misconception"])
                struggles = struggles[-5:]  # Keep last 5

            sb.table("chat_knowledge").update({
                "mastery": new_mastery,
                "attempts": (entry.get("attempts") or 0) + 1,
                "correct": new_correct,
                "struggles": struggles,
                "last_seen": now,
            }).eq("id", entry["id"]).execute()
        else:
            initial_mastery = max(0.0, 0.1 + mastery_delta)
            sb.table("chat_knowledge").insert({
                "student_id": student_id,
                "lesson_id": lesson_id,
                "concept": concept,
                "mastery": initial_mastery,
                "attempts": 1,
                "correct": result["score"],
                "struggles": [result["misconception"]] if result.get("misconception") else [],
                "last_seen": now,
            }).execute()

    result["mastery_update"] = concept
    return result
