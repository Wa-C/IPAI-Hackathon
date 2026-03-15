from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.auth import CurrentUser, get_current_user, assert_org_membership
from app.db.supabase_client import get_supabase_admin
from app.models.analytics import LearningModesDistribution, BiasOverview, BiasCategoryStats

router = APIRouter(prefix="/analytics")


@router.get("/classes/{class_id}/learning-modes", response_model=LearningModesDistribution)
async def class_learning_modes(
    class_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    """Distribution of learning modes within a class."""
    sb = get_supabase_admin()

    # Get class org for membership check
    cls = sb.table("classes").select("organization_id").eq("id", str(class_id)).single().execute()
    await assert_org_membership(user.id, cls.data["organization_id"])

    # Get enrolled students' preferences
    enrolments = (
        sb.table("class_enrolments")
        .select("user_id")
        .eq("class_id", str(class_id))
        .eq("role", "student")
        .execute()
    )
    student_ids = [e["user_id"] for e in enrolments.data]
    if not student_ids:
        return LearningModesDistribution()

    prefs = (
        sb.table("learning_preferences")
        .select("recommended")
        .in_("student_id", student_ids)
        .execute()
    )

    counts = {"read": 0, "play": 0, "watch": 0, "mixed": 0}
    for p in prefs.data:
        mode = p.get("recommended", "mixed")
        if mode in counts:
            counts[mode] += 1
        else:
            counts["mixed"] += 1

    return LearningModesDistribution(
        readers=counts["read"],
        players=counts["play"],
        watchers=counts["watch"],
        mixed=counts["mixed"],
    )


@router.get("/organizations/{org_id}/bias-overview", response_model=BiasOverview)
async def org_bias_overview(
    org_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    """Bias issues by category and resolution status for an organisation."""
    await assert_org_membership(user.id, str(org_id))
    sb = get_supabase_admin()

    # Get all bias scans for materials in this org's classes
    scans = (
        sb.table("bias_scans")
        .select("issues_by_category, resolved_count, total_issues")
        .execute()
    )

    overview = {
        "gender": {"flagged": 0, "resolved": 0},
        "culture": {"flagged": 0, "resolved": 0},
        "socioeconomic": {"flagged": 0, "resolved": 0},
        "ableism": {"flagged": 0, "resolved": 0},
    }
    total_flagged = 0
    total_resolved = 0

    for scan in scans.data:
        by_cat = scan.get("issues_by_category", {})
        for cat, count in by_cat.items():
            if cat in overview:
                overview[cat]["flagged"] += count
        total_flagged += scan.get("total_issues", 0)
        total_resolved += scan.get("resolved_count", 0)

    return BiasOverview(
        gender=BiasCategoryStats(**overview["gender"]),
        culture=BiasCategoryStats(**overview["culture"]),
        socioeconomic=BiasCategoryStats(**overview["socioeconomic"]),
        ableism=BiasCategoryStats(**overview["ableism"]),
        total_flagged=total_flagged,
        total_resolved=total_resolved,
    )
