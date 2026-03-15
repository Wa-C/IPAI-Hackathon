from fastapi import APIRouter, Depends

from app.core.auth import CurrentUser, get_current_user
from app.db.supabase_client import get_supabase_admin

router = APIRouter(prefix="/dashboard")


@router.get("/summary")
async def dashboard_summary(user: CurrentUser = Depends(get_current_user)):
    """
    Aggregated dashboard data for the teacher view.
    Returns stats, today's classes, learning mode distribution, and bias overview.
    """
    sb = get_supabase_admin()

    # Total students
    students_result = sb.table("student_profiles").select("id", count="exact").execute()
    total_students = students_result.count or 0

    # Total lessons
    lessons_result = sb.table("lessons").select("id", count="exact").execute()
    total_lessons = lessons_result.count or 0

    # Classes (non-archived)
    classes_result = (
        sb.table("classes")
        .select("id, name, grade, subject, student_count, next_lesson_time")
        .eq("archived", False)
        .order("next_lesson_time", desc=False)
        .execute()
    )
    classes = classes_result.data

    # Learning mode distribution (across all students)
    prefs_result = sb.table("learning_preferences").select("recommended").execute()
    modes = {"read": 0, "play": 0, "watch": 0, "mixed": 0}
    for p in prefs_result.data:
        m = p.get("recommended", "mixed")
        modes[m] = modes.get(m, 0) + 1

    # Bias overview
    scans_result = (
        sb.table("bias_scans")
        .select("issues_by_category, resolved_count, total_issues")
        .execute()
    )
    bias_overview = {
        "gender": {"flagged": 0, "resolved": 0},
        "culture": {"flagged": 0, "resolved": 0},
        "socioeconomic": {"flagged": 0, "resolved": 0},
        "ableism": {"flagged": 0, "resolved": 0},
    }
    total_flagged = 0
    total_resolved = 0
    for scan in scans_result.data:
        by_cat = scan.get("issues_by_category", {})
        for cat, count in by_cat.items():
            if cat in bias_overview:
                bias_overview[cat]["flagged"] += count
        total_flagged += scan.get("total_issues", 0)
        total_resolved += scan.get("resolved_count", 0)

    # Resolve counts per bias category from individual issues
    issues_result = sb.table("bias_issues").select("category, resolved").execute()
    for issue in issues_result.data:
        cat = issue.get("category")
        if cat in bias_overview and issue.get("resolved"):
            bias_overview[cat]["resolved"] += 1

    # Total AI-generated tasks
    ai_tasks_result = (
        sb.table("tasks")
        .select("id", count="exact")
        .eq("generated_by_ai", True)
        .execute()
    )
    ai_generations = ai_tasks_result.count or 0

    # Assessments for avg engagement
    assessments_result = sb.table("assessments").select("score, max_score").execute()
    if assessments_result.data:
        total_pct = sum(
            (a["score"] / a["max_score"] * 100) for a in assessments_result.data if a["max_score"] > 0
        )
        avg_engagement = round(total_pct / len(assessments_result.data), 1)
    else:
        avg_engagement = 0

    return {
        "stats": {
            "total_students": total_students,
            "total_lessons": total_lessons,
            "ai_generations": ai_generations,
            "avg_engagement": avg_engagement,
        },
        "classes": classes,
        "learning_modes": {
            "readers": modes["read"],
            "players": modes["play"],
            "watchers": modes["watch"],
            "mixed": modes["mixed"],
        },
        "bias_overview": {
            **bias_overview,
            "total_flagged": total_flagged,
            "total_resolved": total_resolved,
        },
    }
