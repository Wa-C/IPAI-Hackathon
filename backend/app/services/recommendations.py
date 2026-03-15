"""
Learning-mode recommendation service.

Computes a recommended learning mode for a student based on their
assessment history and usage patterns.
Currently uses a simple weighted-average placeholder.

*** ML EXTENSION POINT ***
Replace `compute_recommendation` with a call to a trained model.
"""


async def compute_recommendation(
    scores: dict[str, float],
    assessment_history: list[dict] | None = None,
) -> dict:
    """Return recommended mode, confidence, and explanation."""
    if not scores:
        return {
            "recommended_mode": "mixed",
            "confidence": 0.5,
            "explanation": "Not enough data yet. Defaulting to mixed mode.",
            "score_breakdown": {"read": 50, "play": 50, "watch": 50},
        }

    best_mode = max(scores, key=lambda k: scores[k])
    best_score = scores[best_mode]
    total = sum(scores.values()) or 1
    confidence = round(best_score / total, 2)

    return {
        "recommended_mode": best_mode,
        "confidence": confidence,
        "explanation": (
            f"Based on your learning profile, '{best_mode}' mode suits you best "
            f"(confidence {confidence:.0%}). "
            f"Score breakdown: read={scores.get('read', 0):.0f}, "
            f"play={scores.get('play', 0):.0f}, "
            f"watch={scores.get('watch', 0):.0f}."
        ),
        "score_breakdown": scores,
    }
