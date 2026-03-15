from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.auth import CurrentUser, get_current_user, assert_org_membership
from app.db.supabase_client import get_supabase_admin
from app.models.lessons import LessonCreate, LessonOut, LessonUpdate
from app.services.differentiation import generate_differentiated_tasks

router = APIRouter(prefix="/lessons")


class GenerateContentRequest(BaseModel):
    title: str
    subject: str
    topic: str
    learning_objective: str
    base_material: str | None = None
    grade_level: int | None = None
    content_type: str = "reading"  # "reading" or "flashcard"


@router.post("", response_model=LessonOut, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    body: LessonCreate,
    user: CurrentUser = Depends(get_current_user),
):
    """Create a lesson from the Lesson Builder."""
    from app.core.config import settings
    sb = get_supabase_admin()

    # Verify teacher has access to this class's org
    cls = sb.table("classes").select("organization_id").eq("id", str(body.class_id)).single().execute()
    await assert_org_membership(user.id, cls.data["organization_id"])

    insert_data = {
        "class_id": str(body.class_id),
        "title": body.title,
        "subject": body.subject,
        "topic": body.topic,
        "learning_objective": body.learning_objective,
        "base_material": body.base_material,
        "grade_level": body.grade_level,
        "duration": body.duration,
        "content_types": body.content_types,
        "status": body.status or "published",
    }
    if not settings.auth_disabled:
        insert_data["created_by"] = user.id

    lesson_row = (
        sb.table("lessons")
        .insert(insert_data)
        .execute()
    )
    lesson = lesson_row.data[0]

    # Generate differentiated tasks if requested
    diff_levels = []
    if body.generate_differentiation:
        diff_levels = await generate_differentiated_tasks(
            title=body.title,
            subject=body.subject,
            topic=body.topic,
            learning_objective=body.learning_objective,
            base_material=body.base_material,
            grade_level=body.grade_level,
        )
        # Store differentiation levels and tasks
        for level_data in diff_levels:
            level_row = (
                sb.table("differentiation_levels")
                .insert(
                    {
                        "lesson_id": lesson["id"],
                        "level": level_data["level"],
                        "rationale": level_data["rationale"],
                    }
                )
                .execute()
            )
            level_id = level_row.data[0]["id"]
            for task in level_data["tasks"]:
                sb.table("tasks").insert(
                    {
                        "differentiation_level_id": level_id,
                        "title": task["title"],
                        "description": task["description"],
                        "mode": task["mode"],
                        "duration": task["duration"],
                        "generated_by_ai": task["generated_by_ai"],
                    }
                ).execute()

        sb.table("lessons").update({"differentiated_content": True}).eq(
            "id", lesson["id"]
        ).execute()
        lesson["differentiated_content"] = True

    lesson["differentiation_levels"] = diff_levels
    return lesson


@router.get("/by-class/{class_id}", response_model=list[LessonOut])
async def list_lessons_for_class(
    class_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    cls = sb.table("classes").select("organization_id").eq("id", str(class_id)).single().execute()
    await assert_org_membership(user.id, cls.data["organization_id"])

    result = (
        sb.table("lessons")
        .select("*, differentiation_levels(*, tasks(*))")
        .eq("class_id", str(class_id))
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/{lesson_id}", response_model=LessonOut)
async def get_lesson(
    lesson_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    result = (
        sb.table("lessons")
        .select("*, differentiation_levels(*, tasks(*))")
        .eq("id", str(lesson_id))
        .single()
        .execute()
    )
    # Verify org membership via the class
    cls = (
        sb.table("classes")
        .select("organization_id")
        .eq("id", result.data["class_id"])
        .single()
        .execute()
    )
    await assert_org_membership(user.id, cls.data["organization_id"])
    return result.data


@router.patch("/{lesson_id}", response_model=LessonOut)
async def update_lesson(
    lesson_id: UUID,
    body: LessonUpdate,
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    existing = sb.table("lessons").select("class_id").eq("id", str(lesson_id)).single().execute()
    cls = (
        sb.table("classes")
        .select("organization_id")
        .eq("id", existing.data["class_id"])
        .single()
        .execute()
    )
    await assert_org_membership(user.id, cls.data["organization_id"])

    update_data = body.model_dump(exclude_unset=True)
    result = (
        sb.table("lessons")
        .update(update_data)
        .eq("id", str(lesson_id))
        .single()
        .execute()
    )
    return result.data


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    """Delete a lesson and all related data (cascades via FK)."""
    sb = get_supabase_admin()
    existing = sb.table("lessons").select("class_id").eq("id", str(lesson_id)).single().execute()
    cls = (
        sb.table("classes")
        .select("organization_id")
        .eq("id", existing.data["class_id"])
        .single()
        .execute()
    )
    await assert_org_membership(user.id, cls.data["organization_id"])
    sb.table("lessons").delete().eq("id", str(lesson_id)).execute()


@router.post("/generate-content")
async def generate_content(
    body: GenerateContentRequest,
    user: CurrentUser = Depends(get_current_user),
):
    """Generate AI lesson content (reading or flashcard) using Grok LLM."""
    from app.services.llm import generate_lesson_content

    try:
        result = await generate_lesson_content(
            title=body.title,
            subject=body.subject,
            topic=body.topic,
            learning_objective=body.learning_objective,
            base_material=body.base_material,
            grade_level=body.grade_level,
            content_type=body.content_type,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content generation failed: {str(e)}",
        )


@router.get("", response_model=list[LessonOut])
async def list_all_lessons(
    user: CurrentUser = Depends(get_current_user),
):
    """List all lessons (dev mode returns all, prod filters by user's orgs)."""
    sb = get_supabase_admin()
    result = (
        sb.table("lessons")
        .select("*, differentiation_levels(*, tasks(*))")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data
