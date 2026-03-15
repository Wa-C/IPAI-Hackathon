"""
Exercise Generator — creates varied exercise types adapted to the student.

Types: quiz (multiple choice), open (open-ended), game (fill-blank/match/order)
Picks type based on student's content_format preference.
"""

from __future__ import annotations

import json

from app.services.chatbot.llm_client import ask_llm


async def generate_exercise(
    student_name: str,
    content_format: str,
    concept: str,
    lesson_title: str,
    lesson_context: str = "",
    recent_types: list[str] | None = None,
) -> dict:
    """
    Generate an exercise adapted to the student.

    content_format mapping:
      - "reading" → open-ended questions
      - "flashcard" → quiz (multiple choice)
      - other → auto-pick
    """
    if recent_types is None:
        recent_types = []

    # Pick type based on preference
    if content_format == "flashcard":
        exercise_type = "quiz"
    elif content_format == "reading":
        exercise_type = "open"
    else:
        exercise_type = _auto_pick(recent_types)

    type_instructions = {
        "quiz": """Create a MULTIPLE CHOICE question with exactly 4 options (A, B, C, D).
Return JSON:
{
    "type": "quiz",
    "question": "the question text",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct_answer": "B",
    "explanation": "why B is correct",
    "hints": ["hint1", "hint2"],
    "concept": "concept_name",
    "difficulty": "medium"
}""",
        "open": """Create an OPEN-ENDED question that requires explanation.
Return JSON:
{
    "type": "open",
    "question": "the question text",
    "correct_answer": "the ideal answer or key points",
    "key_points": ["point1", "point2", "point3"],
    "hints": ["hint1", "hint2"],
    "concept": "concept_name",
    "difficulty": "medium"
}""",
        "game": """Create an INTERACTIVE exercise. Choose one format:
- fill_blank: A sentence with ___ blanks to fill
- match: Two columns to match together
- order: Items to put in correct order

Return JSON:
{
    "type": "game",
    "game_type": "fill_blank",
    "question": "instruction text",
    "items": "sentence with ___ blanks",
    "correct_answer": "the correct filled text",
    "hints": ["hint1"],
    "concept": "concept_name",
    "difficulty": "medium"
}""",
    }

    prompt = f"""Generate a {exercise_type} exercise for this student:
- Name: {student_name}

Topic/Concept: {concept}
Lesson: {lesson_title}

{f'Lesson context: {lesson_context[:1000]}' if lesson_context else ''}

Make it engaging and educational.

{type_instructions[exercise_type]}

Respond with ONLY the JSON, no markdown fences."""

    result_text = await ask_llm(
        system_prompt="You are an expert educational exercise designer. Create engaging, pedagogically sound exercises. Respond ONLY with valid JSON.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800,
    )

    try:
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        exercise = json.loads(result_text)
        exercise["type"] = exercise.get("type", exercise_type)
        exercise["concept"] = exercise.get("concept", concept)
        exercise["difficulty"] = exercise.get("difficulty", "medium")
        return exercise
    except json.JSONDecodeError:
        return {
            "type": "open",
            "question": f"In your own words, explain what {concept} means and give an example.",
            "correct_answer": f"A clear explanation of {concept} with a relevant example.",
            "key_points": [f"Definition of {concept}", "At least one example"],
            "hints": ["Think about what you learned in the lesson material."],
            "concept": concept,
            "difficulty": "medium",
        }


def _auto_pick(recent_types: list[str]) -> str:
    """Auto-pick exercise type, avoiding repeats."""
    weights = {"quiz": 3, "open": 2, "game": 2}
    if recent_types:
        last = recent_types[-1]
        if last in weights:
            weights[last] = max(1, weights[last] - 2)
    return max(weights, key=weights.get)
