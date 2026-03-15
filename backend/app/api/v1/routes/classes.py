from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.auth import CurrentUser, get_current_user, assert_org_membership
from app.db.supabase_client import get_supabase_admin
from app.models.classes import ClassCreate, ClassUpdate, ClassOut, EnrolmentAction

router = APIRouter(prefix="/classes")


@router.post("", response_model=ClassOut, status_code=status.HTTP_201_CREATED)
async def create_class(
    body: ClassCreate,
    user: CurrentUser = Depends(get_current_user),
):
    await assert_org_membership(user.id, str(body.organization_id))
    from app.core.config import settings
    sb = get_supabase_admin()
    insert_data = {
        "name": body.name,
        "grade": body.grade,
        "subject": body.subject,
        "organization_id": str(body.organization_id),
        "next_lesson_time": body.next_lesson_time.isoformat() if body.next_lesson_time else None,
    }
    if not settings.auth_disabled:
        insert_data["teacher_id"] = user.id
    row = (
        sb.table("classes")
        .insert(insert_data)
        .execute()
    )
    return {**row.data[0], "student_count": 0}


@router.get("", response_model=list[ClassOut])
async def list_classes(
    org_id: UUID | None = Query(None),
    teacher_id: UUID | None = Query(None),
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    q = sb.table("classes").select("*").eq("archived", False)
    if org_id:
        await assert_org_membership(user.id, str(org_id))
        q = q.eq("organization_id", str(org_id))
    if teacher_id:
        q = q.eq("teacher_id", str(teacher_id))
    result = q.execute()
    return result.data


@router.get("/{class_id}", response_model=ClassOut)
async def get_class(
    class_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    result = (
        sb.table("classes").select("*").eq("id", str(class_id)).single().execute()
    )
    await assert_org_membership(user.id, result.data["organization_id"])
    return result.data


@router.patch("/{class_id}", response_model=ClassOut)
async def update_class(
    class_id: UUID,
    body: ClassUpdate,
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    existing = (
        sb.table("classes").select("organization_id").eq("id", str(class_id)).single().execute()
    )
    await assert_org_membership(user.id, existing.data["organization_id"])
    update_data = body.model_dump(exclude_unset=True)
    result = (
        sb.table("classes")
        .update(update_data)
        .eq("id", str(class_id))
        .single()
        .execute()
    )
    return result.data


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_class(
    class_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    """Soft-delete (archive) a class."""
    sb = get_supabase_admin()
    existing = (
        sb.table("classes").select("organization_id").eq("id", str(class_id)).single().execute()
    )
    await assert_org_membership(user.id, existing.data["organization_id"])
    sb.table("classes").update({"archived": True}).eq("id", str(class_id)).execute()


# ---- Enrolments ----

@router.post("/{class_id}/enrol", status_code=status.HTTP_201_CREATED)
async def enrol_user(
    class_id: UUID,
    body: EnrolmentAction,
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    existing = (
        sb.table("classes").select("organization_id").eq("id", str(class_id)).single().execute()
    )
    await assert_org_membership(user.id, existing.data["organization_id"])
    sb.table("class_enrolments").insert(
        {
            "class_id": str(class_id),
            "user_id": str(body.user_id),
            "role": body.role,
        }
    ).execute()
    return {"status": "enrolled"}


@router.delete("/{class_id}/enrol/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_enrolment(
    class_id: UUID,
    user_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    existing = (
        sb.table("classes").select("organization_id").eq("id", str(class_id)).single().execute()
    )
    await assert_org_membership(user.id, existing.data["organization_id"])
    sb.table("class_enrolments").delete().eq("class_id", str(class_id)).eq(
        "user_id", str(user_id)
    ).execute()
