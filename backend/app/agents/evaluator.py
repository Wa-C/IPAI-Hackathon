"""
Evaluator Agent — assesses student answers with nuanced grading.

Grading scale:
  - correct (1.0): Student fully understands the concept
  - partial (0.5): Student has some understanding but gaps or imprecision
  - wrong (0.0): Student has fundamental misconception

The evaluator also:
  - Identifies specific misconceptions (not just "wrong")
  - Provides encouraging, constructive feedback
  - Returns what the student should review
"""

import json
from app.agents.llm_client import llm


def evaluate_answer(
    student_profile: dict,
    exercise: dict,
    student_answer: str
) -> dict:
    """
    Evaluate a student's answer.

    Returns: {
        score: 1.0 | 0.5 | 0.0,
        grade: "correct" | "partial" | "wrong",
        feedback: str,
        misconception: str | None,
        should_review: [concept names that need review],
        correct_answer: str
    }
    """
    exercise_type = exercise.get("type", "open")

    # For quizzes, we can do a quick exact match first
    if exercise_type == "quiz":
        correct = exercise.get("correct_answer", "").strip().upper()
        given = student_answer.strip().upper()
        # Extract just the letter if they wrote "B) something"
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
                "correct_answer": exercise.get("correct_answer", "")
            }

    # For open questions, games, or wrong quiz answers → use LLM
    prompt = f"""Evaluate this student's answer to an exercise.

STUDENT: {student_profile.get('name', 'Student')}, age {student_profile.get('age', 16)}

EXERCISE TYPE: {exercise_type}
QUESTION: {exercise.get('question', '')}
CORRECT ANSWER: {exercise.get('correct_answer', '')}
{f"KEY POINTS EXPECTED: {json.dumps(exercise.get('key_points', []))}" if exercise.get('key_points') else ''}
STUDENT'S ANSWER: {student_answer}

Grade the answer and respond with ONLY this JSON:
{{
    "score": 1.0 or 0.5 or 0.0,
    "grade": "correct" or "partial" or "wrong",
    "feedback": "Encouraging, specific feedback. If partial: explain what was good AND what's missing. If wrong: explain the misconception kindly. Use the student's name.",
    "misconception": null or "a specific description of what the student misunderstands",
    "should_review": ["list of concept names the student should review based on their answer"]
}}

GRADING RULES:
- correct (1.0): All key points addressed, reasoning is sound
- partial (0.5): Some understanding shown but missing key elements, or imprecise
- wrong (0.0): Fundamental misunderstanding or completely off-topic
- Be generous with partial — if they show ANY understanding, it's at least partial
- Always be encouraging, even when the answer is wrong"""

    result_text = llm.generate(
        system_prompt="You are a kind, encouraging teacher evaluating a student's work. Grade fairly but generously. Respond ONLY with valid JSON.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500
    )

    try:
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        result = json.loads(result_text)
        # Ensure required fields
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
            "feedback": "I had trouble evaluating your answer precisely. Let's discuss it — can you explain your reasoning?",
            "misconception": None,
            "should_review": [exercise.get("concept", "")],
            "correct_answer": exercise.get("correct_answer", "")
        }


def evaluate_mastery_batch(
    student_profile: dict,
    answers: list[dict]  # [{question, answer, question_index}, ...]
) -> dict:
    """
    Evaluate a student's answers to a full mastery check.

    Returns: {
        score_pct: int (0-100),
        correct: int,
        total: int,
        evaluations: [{grade, score, feedback, correct_answer}, ...]
    }
    """
    evaluations = []
    total_score = 0.0

    for item in answers:
        q = item.get("question", {})
        answer = item.get("answer", "")

        result = evaluate_answer(
            student_profile=student_profile,
            exercise=q,
            student_answer=answer
        )
        evaluations.append(result)
        total_score += result["score"]

    total = len(answers)
    correct_count = sum(1 for e in evaluations if e["grade"] == "correct")
    score_pct = round((total_score / total) * 100) if total > 0 else 0

    return {
        "score_pct": score_pct,
        "correct": correct_count,
        "total": total,
        "evaluations": evaluations
    }