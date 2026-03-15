"""
Prerequisite Checker Agent — ensures students have the basics before advancing.

This agent:
  1. Checks the knowledge map for weak prerequisites
  2. Analyzes the struggle log for recurring patterns
  3. Decides whether to proceed or review
  4. If review needed: generates a quick mini-lesson with examples + exercise
"""

import json
from app.agents.llm_client import llm


def check_prerequisites(
    concept: str,
    knowledge_map: list[dict],
    struggle_log: list[dict],
    course_context: str = ""
) -> dict:
    """
    Check if the student is ready for this concept.

    Returns: {
        ready: bool,
        missing_prerequisites: [{concept, mastery, reason}],
        review_plan: str | None  (mini-lesson if not ready)
    }
    """
    # Build knowledge summary
    knowledge_summary = ""
    if knowledge_map:
        for k in knowledge_map:
            level = f"{k.get('mastery_level', 0):.0%}"
            struggles = k.get("struggles", [])
            struggle_text = f" (struggles: {', '.join(struggles[-2:])})" if struggles else ""
            knowledge_summary += f"  - {k['concept']}: {level} mastery{struggle_text}\n"
    else:
        knowledge_summary = "  No concepts tracked yet.\n"

    # Build struggle summary
    recent_struggles = struggle_log[-10:] if struggle_log else []
    struggle_summary = ""
    if recent_struggles:
        for s in recent_struggles:
            struggle_summary += f"  - {s.get('concept', '?')}: {s.get('misconception', 'unknown issue')} (score: {s.get('score', '?')})\n"

    prompt = f"""Analyze whether this student is ready to learn "{concept}".

KNOWLEDGE MAP (what they know):
{knowledge_summary}

RECENT STRUGGLES:
{struggle_summary or '  None recorded.'}

{f'COURSE CONTEXT: {course_context[:800]}' if course_context else ''}

Respond with ONLY this JSON:
{{
    "ready": true or false,
    "missing_prerequisites": [
        {{"concept": "name", "mastery": 0.3, "reason": "why this is needed first"}}
    ],
    "review_summary": "If not ready: a brief explanation of what needs review and why. If ready: null"
}}

RULES:
- A student is "ready" if they have >40% mastery on all prerequisite concepts
- If a concept has never been seen, that's NOT automatically a blocker — only if it's truly prerequisite
- Be practical: don't block on tangential prerequisites
- List at most 2-3 missing prerequisites, prioritized"""

    result_text = llm.generate(
        system_prompt="You are an education curriculum expert. Analyze prerequisites and knowledge gaps. Respond ONLY with valid JSON.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500
    )

    try:
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        result = json.loads(result_text)
        return {
            "ready": result.get("ready", True),
            "missing_prerequisites": result.get("missing_prerequisites", []),
            "review_summary": result.get("review_summary")
        }
    except json.JSONDecodeError:
        return {"ready": True, "missing_prerequisites": [], "review_summary": None}


def generate_review(
    student_profile: dict,
    concept: str,
    reason: str,
    course_context: str = ""
) -> str:
    """
    Generate a quick mini-lesson to review a prerequisite concept.
    Includes a brief explanation + example + one practice question.
    """
    interests = ", ".join(student_profile.get("interests", [])) or "general topics"

    prompt = f"""The student needs a quick review of "{concept}" before they can continue.
Reason: {reason}

Student: {student_profile.get('name', 'Student')}, age {student_profile.get('age', 16)}
Interests: {interests}
Learning style: {student_profile.get('learning_style', 'visual')}

{f'Course context: {course_context[:500]}' if course_context else ''}

Create a SHORT review (max 150 words) that:
1. Explains the concept simply with an analogy from their interests
2. Gives one clear example
3. Ends with one quick check question

Be warm and encouraging — frame it as a "quick refresher" not a failure."""

    return llm.generate(
        system_prompt="You are a friendly tutor giving a quick concept refresher. Be concise, warm, and use the student's interests for analogies.",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400
    )
