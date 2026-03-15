"""
Student content-format preference endpoints.
Stores/loads the student's preferred content format (reading or flashcard) from the DB.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.core.auth import CurrentUser, get_current_user
from app.db.supabase_client import get_supabase_admin
from pydantic import BaseModel

router = APIRouter(prefix="/student-prefs")


class ContentFormatBody(BaseModel):
    student_id: str
    content_format: str  # "reading" or "flashcard"


class AboutMeBody(BaseModel):
    student_id: str
    about_me: dict  # { hobbies, age, native_language, interests, learning_challenges, fun_fact }


@router.get("/content-format")
async def get_content_format(
    student_id: str = Query(...),
    user: CurrentUser = Depends(get_current_user),
):
    """Get a student's preferred content format."""
    sb = get_supabase_admin()
    result = (
        sb.table("learning_preferences")
        .select("content_format")
        .eq("student_id", student_id)
        .single()
        .execute()
    )
    return {"content_format": result.data.get("content_format", "reading")}


@router.put("/content-format")
async def set_content_format(
    body: ContentFormatBody,
    user: CurrentUser = Depends(get_current_user),
):
    """Update a student's preferred content format."""
    sb = get_supabase_admin()
    result = (
        sb.table("learning_preferences")
        .update({"content_format": body.content_format})
        .eq("student_id", body.student_id)
        .execute()
    )
    if not result.data:
        return {"error": "Student preference not found"}
    return {"content_format": body.content_format, "status": "saved"}


@router.get("/about-me")
async def get_about_me(
    student_id: str = Query(...),
    user: CurrentUser = Depends(get_current_user),
):
    """Get a student's about-me profile."""
    sb = get_supabase_admin()
    result = (
        sb.table("learning_preferences")
        .select("about_me")
        .eq("student_id", student_id)
        .maybe_single()
        .execute()
    )
    return {"about_me": (result.data or {}).get("about_me") or {}}


@router.put("/about-me")
async def set_about_me(
    body: AboutMeBody,
    user: CurrentUser = Depends(get_current_user),
):
    """Update a student's about-me profile."""
    sb = get_supabase_admin()
    result = (
        sb.table("learning_preferences")
        .update({"about_me": body.about_me})
        .eq("student_id", body.student_id)
        .execute()
    )
    if not result.data:
        return {"error": "Student preference not found"}
    return {"about_me": body.about_me, "status": "saved"}


@router.get("/students-list")
async def list_students_simple(
    user: CurrentUser = Depends(get_current_user),
):
    """List all students with their content format preference (for dev/demo)."""
    sb = get_supabase_admin()
    result = (
        sb.table("student_profiles")
        .select("id, name, email, class_id, performance_status")
        .order("name")
        .limit(50)
        .execute()
    )
    # Get their content format preferences
    student_ids = [s["id"] for s in result.data]
    if student_ids:
        prefs = (
            sb.table("learning_preferences")
            .select("student_id, content_format, recommended")
            .in_("student_id", student_ids)
            .execute()
        )
        pref_map = {p["student_id"]: p for p in prefs.data}
    else:
        pref_map = {}

    students = []
    for s in result.data:
        pref = pref_map.get(s["id"], {})
        students.append({
            **s,
            "content_format": pref.get("content_format", "reading"),
            "recommended_mode": pref.get("recommended", "mixed"),
        })
    return students
