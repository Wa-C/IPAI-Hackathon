from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.core.auth import CurrentUser, get_current_user, assert_org_membership
from app.db.supabase_client import get_supabase_admin
from app.models.students import (
    StudentOut,
    LearningPreferenceOut,
    LearningPreferenceUpdate,
    AssessmentCreate,
    AssessmentOut,
    RecommendationOut,
)
from app.services.recommendations import compute_recommendation

router = APIRouter(prefix="/students")


@router.get("", response_model=list[StudentOut])
async def list_students(
    org_id: UUID | None = Query(None),
    class_id: UUID | None = Query(None),
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    q = sb.table("student_profiles").select("*")
    if org_id:
        await assert_org_membership(user.id, str(org_id))
        q = q.eq("organization_id", str(org_id))
    if class_id:
        q = q.eq("class_id", str(class_id))
    result = q.execute()
    return result.data


@router.get("/{student_id}", response_model=StudentOut)
async def get_student(
    student_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    result = (
        sb.table("student_profiles")
        .select("*")
        .eq("id", str(student_id))
        .single()
        .execute()
    )
    await assert_org_membership(user.id, result.data["organization_id"])
    return result.data


# ---- Learning Preferences ----

@router.get("/{student_id}/preferences", response_model=LearningPreferenceOut)
async def get_preferences(
    student_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    result = (
        sb.table("learning_preferences")
        .select("*")
        .eq("student_id", str(student_id))
        .single()
        .execute()
    )
    return result.data


@router.patch("/{student_id}/preferences", response_model=LearningPreferenceOut)
async def update_preferences(
    student_id: UUID,
    body: LearningPreferenceUpdate,
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    update_data = body.model_dump(exclude_unset=True)
    result = (
        sb.table("learning_preferences")
        .update(update_data)
        .eq("student_id", str(student_id))
        .single()
        .execute()
    )
    return result.data


# ---- Assessments ----

@router.post("/{student_id}/assessments", response_model=AssessmentOut, status_code=201)
async def record_assessment(
    student_id: UUID,
    body: AssessmentCreate,
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    row = (
        sb.table("assessments")
        .insert(
            {
                "student_id": str(student_id),
                "assessment_type": body.assessment_type,
                "score": body.score,
                "max_score": body.max_score,
                "mode_used": body.mode_used.value if body.mode_used else None,
                "metadata": body.metadata,
            }
        )
        .execute()
    )
    return row.data[0]


# ---- Recommendation ----

@router.get("/{student_id}/recommendation", response_model=RecommendationOut)
async def get_recommendation(
    student_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    """Return recommended learning mode based on student profile & assessments."""
    sb = get_supabase_admin()

    # Get current scores
    prefs = (
        sb.table("learning_preferences")
        .select("scores")
        .eq("student_id", str(student_id))
        .single()
        .execute()
    )
    scores = prefs.data.get("scores", {})

    # Get recent assessments for context
    assessments = (
        sb.table("assessments")
        .select("*")
        .eq("student_id", str(student_id))
        .order("created_at", desc=True)
        .limit(10)
        .execute()
    )

    result = await compute_recommendation(scores, assessments.data)
    return result
