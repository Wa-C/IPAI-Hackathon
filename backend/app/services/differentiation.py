"""
Differentiation / AI task generation service.

Generates differentiated tasks for struggling / on-track / advanced students.
Currently returns placeholder tasks; replace with a real LLM call.
"""

import uuid


async def generate_differentiated_tasks(
    title: str,
    subject: str,
    topic: str,
    learning_objective: str,
    base_material: str | None = None,
    grade_level: int | None = None,
) -> list[dict]:
    """
    Generate differentiated lesson content for three levels.

    *** ML EXTENSION POINT ***
    Replace the placeholder return with:
        result = await call_llm(prompt_built_from_params)
    """

    def _task(name: str, desc: str, mode: str, duration: int) -> dict:
        return {
            "id": str(uuid.uuid4()),
            "title": name,
            "description": desc,
            "mode": mode,
            "duration": duration,
            "generated_by_ai": True,
        }

    return [
        {
            "level": "struggling",
            "rationale": f"Visual and interactive approach helps struggling learners grasp {topic}",
            "tasks": [
                _task(
                    "Picture Vocabulary Cards",
                    f"Match key vocabulary words from {topic} with their picture representations.",
                    "play",
                    10,
                ),
                _task(
                    "Simplified Reading Passage",
                    f"A shortened version of the text about {topic} with highlighted key words.",
                    "read",
                    15,
                ),
                _task(
                    "Story Introduction Video",
                    f"Watch a 3-minute animated summary of {topic} before reading.",
                    "watch",
                    5,
                ),
            ],
        },
        {
            "level": "on-track",
            "rationale": f"Text-based analysis appropriate for grade-level understanding of {topic}",
            "tasks": [
                _task(
                    "Guided Reading Activity",
                    f"Read the full passage about {topic} with embedded comprehension questions.",
                    "read",
                    20,
                ),
                _task(
                    "Comprehension Quiz",
                    f"Interactive quiz with multiple choice and short answer questions about {topic}.",
                    "play",
                    15,
                ),
            ],
        },
        {
            "level": "advanced",
            "rationale": f"Extended activities challenge advanced learners to make deeper connections with {topic}",
            "tasks": [
                _task(
                    "Critical Analysis Essay",
                    f"Write a 400-word analysis comparing themes in {topic} to modern contexts.",
                    "read",
                    30,
                ),
                _task(
                    "Extended Research Project",
                    f"Research the historical background of {topic} and create a presentation.",
                    "mixed",
                    45,
                ),
            ],
        },
    ]
