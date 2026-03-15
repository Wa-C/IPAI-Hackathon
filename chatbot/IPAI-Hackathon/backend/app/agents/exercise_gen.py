"""
Exercise Generator Agent — creates varied exercise types adapted to the student.

Exercise types:
  - quiz: Multiple choice questions (good for quick checks)
  - open: Open-ended questions (good for deeper understanding)
  - game: Interactive challenges like fill-in-the-blank, matching, ordering
           (good for engagement, especially younger students)

The agent picks the best type based on:
  1. Student's explicit preference (if set)
  2. Student's age (younger → more games)
  3. Concept difficulty (harder → open questions)
  4. Recent exercise history (varies types to avoid boredom)
"""

import json
from app.agents.llm_client import llm


def generate_exercise(
    student_profile: dict,
    concept: str,
    difficulty: str,
    course_context: str = "",
    preferred_type: str = "auto",
    recent_types: list[str] = []
) -> dict:
    """
    Generate an exercise adapted to the student.

    Returns: {
        type: "quiz" | "open" | "game",
        question: str,
        options: [...] (for quiz only),
        correct_answer: str,
        hints: [...],
        concept: str,
        difficulty: str,
        game_type: str (for game only — "fill_blank" | "match" | "order")
    }
    """
    # Decide exercise type
    if preferred_type != "auto":
        exercise_type = preferred_type
    else:
        exercise_type = _pick_type(student_profile, concept, recent_types)

    type_instructions = {
        "quiz": """Create a MULTIPLE CHOICE question with exactly 4 options (A, B, C, D).
Return JSON:
{
    "type": "quiz",
    "question": "the question text",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct_answer": "B",
    "explanation": "why B is correct and common mistakes",
    "hints": ["hint1", "hint2"],
    "concept": "concept_name",
    "difficulty": "easy|medium|hard"
}""",
        "open": """Create an OPEN-ENDED question that requires explanation or calculation.
Return JSON:
{
    "type": "open",
    "question": "the question text",
    "correct_answer": "the ideal answer or key points that should be mentioned",
    "key_points": ["point1", "point2", "point3"],
    "hints": ["hint1", "hint2"],
    "concept": "concept_name",
    "difficulty": "easy|medium|hard"
}""",
        "game": """Create an INTERACTIVE GAME exercise. Choose one format:
- fill_blank: A sentence with blanks to fill (use ___ for blanks)
- match: Two columns to match together
- order: Steps/items to put in the correct order

Return JSON:
{
    "type": "game",
    "game_type": "fill_blank" | "match" | "order",
    "question": "instruction text",
    "items": [...],  (for match: [{"left": "...", "right": "..."}], for order: ["step1", "step2"], for fill_blank: "sentence with ___ blanks")
    "correct_answer": "the correct arrangement or filled text",
    "hints": ["hint1"],
    "concept": "concept_name",
    "difficulty": "easy|medium|hard"
}"""
    }

    interests = ", ".join(student_profile.get("interests", [])) or "general topics"

    prompt = f"""Generate a {exercise_type} exercise for this student:
- Name: {student_profile.get('name', 'Student')}
- Age: {student_profile.get('age', 16)}
- Interests: {interests}
- Learning style: {student_profile.get('learning_style', 'visual')}

Topic: {concept}
Difficulty: {difficulty}

{f'Course context: {course_context[:1000]}' if course_context else ''}

Use analogies from their interests when possible.
Make it engaging and age-appropriate.

{type_instructions[exercise_type]}

Respond with ONLY the JSON, no markdown fences."""

    result_text = llm.generate(
        system_prompt="You are an expert educational exercise designer. Create engaging, pedagogically sound exercises. Respond ONLY with valid JSON.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800
    )

    try:
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        exercise = json.loads(result_text)
        exercise["type"] = exercise.get("type", exercise_type)
        exercise["concept"] = exercise.get("concept", concept)
        exercise["difficulty"] = exercise.get("difficulty", difficulty)
        return exercise
    except json.JSONDecodeError:
        # Fallback exercise
        return {
            "type": "open",
            "question": f"In your own words, explain what {concept} means and give an example.",
            "correct_answer": f"A clear explanation of {concept} with a relevant example.",
            "key_points": [f"Definition of {concept}", "At least one example"],
            "hints": ["Think about what you learned in the course material."],
            "concept": concept,
            "difficulty": difficulty
        }


def _pick_type(student_profile: dict, concept: str, recent_types: list[str]) -> str:
    """Auto-pick the best exercise type."""
    age = student_profile.get("age", 16)

    # Younger students get more games
    if age <= 12:
        weights = {"game": 3, "quiz": 2, "open": 1}
    elif age <= 16:
        weights = {"quiz": 3, "game": 2, "open": 2}
    else:
        weights = {"open": 3, "quiz": 2, "game": 1}

    # Avoid repeating the last type
    if recent_types:
        last = recent_types[-1]
        if last in weights:
            weights[last] = max(1, weights[last] - 2)

    # Pick highest weight
    return max(weights, key=weights.get)
