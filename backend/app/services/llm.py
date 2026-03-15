"""
LLM service using Grok (xAI) API for lesson content generation.
The xAI API is OpenAI-compatible, so we use the openai Python client.
"""

import json
from openai import AsyncOpenAI

from app.core.config import settings

_client = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.grok_api_key,
            base_url="https://api.x.ai/v1",
        )
    return _client


SYSTEM_PROMPT = """You are an expert educational content creator for the EdCopilot platform.

CRITICAL RULES:
1. If the teacher has provided base material, you MUST generate content STRICTLY based on that material. Do NOT invent facts, dates, names, or concepts that are not in the provided material.
2. If no base material is provided, generate content based on the given topic, subject, and learning objective — but keep it factually accurate and age-appropriate.
3. Always respond with valid JSON only. No markdown fences, no explanations outside the JSON.
4. Keep language age-appropriate for the specified grade level.
5. Make content engaging, clear, and educational."""


def _build_reading_prompt(
    title: str, subject: str, topic: str,
    learning_objective: str, grade_str: str,
    base_material: str | None,
) -> str:
    material_section = ""
    if base_material:
        material_section = f"""

=== TEACHER'S SOURCE MATERIAL (use ONLY this content) ===
{base_material}
=== END SOURCE MATERIAL ===

IMPORTANT: Generate the reading lesson ONLY from the source material above. Extract key concepts, explain them clearly, and organize them into sections. Do NOT add information that is not in the source material."""
    else:
        material_section = "\n\nNo source material provided. Generate accurate educational content about the topic."

    return f"""Create a structured reading lesson for {grade_str} students.

Title: {title}
Subject: {subject}
Topic: {topic}
Learning Objective: {learning_objective}{material_section}

Generate a reading lesson in JSON format:
{{
  "title": "A clear, engaging title",
  "estimated_minutes": <integer>,
  "sections": [
    {{
      "heading": "Section heading",
      "body": "2-4 paragraphs of educational content",
      "key_terms": ["term1", "term2"]
    }}
  ]
}}

Create 3-5 sections. Each section should have 1-3 key terms that appear in the content."""


def _build_flashcard_prompt(
    title: str, subject: str, topic: str,
    learning_objective: str, grade_str: str,
    base_material: str | None,
) -> str:
    material_section = ""
    if base_material:
        material_section = f"""

=== TEACHER'S SOURCE MATERIAL (use ONLY this content) ===
{base_material}
=== END SOURCE MATERIAL ===

IMPORTANT: Generate flashcards ONLY from the source material above. Every question and answer must be derived from this material. Do NOT add external facts or information."""
    else:
        material_section = "\n\nNo source material provided. Generate accurate educational flashcards about the topic."

    return f"""Create a flashcard study set for {grade_str} students.

Title: {title}
Subject: {subject}
Topic: {topic}
Learning Objective: {learning_objective}{material_section}

Generate flashcards in JSON format:
{{
  "title": "Title for this flashcard set",
  "description": "One sentence about what students will learn",
  "cards": [
    {{
      "front": "Question or term (short and clear)",
      "back": "Answer or definition (concise but complete)",
      "hint": "One-line hint (optional)"
    }}
  ]
}}

Create 8-12 flashcards. Mix question types: definitions, conceptual questions, and application questions."""


async def generate_lesson_content(
    title: str,
    subject: str,
    topic: str,
    learning_objective: str,
    base_material: str | None = None,
    grade_level: int | None = None,
    content_type: str = "reading",
) -> dict:
    """
    Generate lesson content tailored to a specific content type.
    If base_material is provided, content is generated strictly from that material.
    """
    client = _get_client()
    grade_str = f"Grade {grade_level}" if grade_level else "secondary school"

    if content_type == "reading":
        prompt = _build_reading_prompt(
            title, subject, topic, learning_objective, grade_str, base_material
        )
    elif content_type == "flashcard":
        prompt = _build_flashcard_prompt(
            title, subject, topic, learning_objective, grade_str, base_material
        )
    else:
        raise ValueError(f"Unknown content_type: {content_type}")

    response = await client.chat.completions.create(
        model="grok-3-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4 if base_material else 0.7,
        max_tokens=3000,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        lines = raw.split("\n")
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        raw = "\n".join(lines)

    result = json.loads(raw)
    result["type"] = content_type
    return result
