"""
Bias scanning service.

This module provides the ML integration point for bias detection.
Currently uses placeholder logic; replace the `scan_text` function body
with a real LLM / ML call when ready.
"""

import uuid
from datetime import datetime, timezone

from app.models.bias import BiasCategory, BiasSeverity


# ---------------------------------------------------------------------------
# Placeholder bias-detection patterns (replace with real ML model)
# ---------------------------------------------------------------------------
_PLACEHOLDER_PATTERNS: list[dict] = [
    {
        "pattern": "fireman",
        "category": BiasCategory.gender,
        "severity": BiasSeverity.medium,
        "explanation": 'The term "fireman" implies only men can be firefighters.',
        "suggestion": "firefighter",
    },
    {
        "pattern": "policeman",
        "category": BiasCategory.gender,
        "severity": BiasSeverity.medium,
        "explanation": 'The term "policeman" implies only men serve in law enforcement.',
        "suggestion": "police officer",
    },
    {
        "pattern": "exotic foods",
        "category": BiasCategory.culture,
        "severity": BiasSeverity.low,
        "explanation": 'Describing foods as "exotic" can otherize non-Western cuisines.',
        "suggestion": "diverse foods",
    },
    {
        "pattern": "fell on deaf ears",
        "category": BiasCategory.ableism,
        "severity": BiasSeverity.high,
        "explanation": "This idiom uses deafness negatively.",
        "suggestion": "was ignored",
    },
    {
        "pattern": "children from good families",
        "category": BiasCategory.socioeconomic,
        "severity": BiasSeverity.medium,
        "explanation": "Implies family worth is tied to socioeconomic status.",
        "suggestion": "children from supportive backgrounds",
    },
    {
        "pattern": "foreign lands",
        "category": BiasCategory.culture,
        "severity": BiasSeverity.low,
        "explanation": '"Foreign lands" creates an us-vs-them framing.',
        "suggestion": "other countries",
    },
    {
        "pattern": "mankind",
        "category": BiasCategory.gender,
        "severity": BiasSeverity.low,
        "explanation": '"Mankind" excludes non-male identities.',
        "suggestion": "humankind",
    },
]


async def scan_text(
    text: str,
    categories: list[BiasCategory] | None = None,
) -> dict:
    """
    Scan text for bias issues.

    Returns a dict matching the shape expected by BiasScanResultOut.

    *** ML EXTENSION POINT ***
    Replace the loop below with a call to your bias-detection model, e.g.:
        result = await call_openai_or_custom_model(text)
    """
    issues = []
    lower = text.lower()

    for pat in _PLACEHOLDER_PATTERNS:
        if categories and pat["category"] not in categories:
            continue
        idx = lower.find(pat["pattern"])
        if idx == -1:
            continue
        issues.append(
            {
                "id": str(uuid.uuid4()),
                "category": pat["category"],
                "severity": pat["severity"],
                "original_phrase": text[idx : idx + len(pat["pattern"])],
                "explanation": pat["explanation"],
                "suggestion": pat["suggestion"],
                "position_start": idx,
                "position_end": idx + len(pat["pattern"]),
                "resolved": False,
            }
        )

    by_cat: dict[str, int] = {}
    for issue in issues:
        cat = issue["category"].value if hasattr(issue["category"], "value") else issue["category"]
        by_cat[cat] = by_cat.get(cat, 0) + 1

    return {
        "id": str(uuid.uuid4()),
        "scanned_at": datetime.now(timezone.utc).isoformat(),
        "total_issues": len(issues),
        "issues_by_category": by_cat,
        "resolved_count": 0,
        "issues": issues,
    }
