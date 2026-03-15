from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.core.auth import CurrentUser, get_current_user
from app.db.supabase_client import get_supabase_admin

router = APIRouter(prefix="/materials")


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_material(
    title: str,
    content: str,
    class_id: UUID | None = None,
    student_id: UUID | None = None,
    user: CurrentUser = Depends(get_current_user),
):
    from app.core.config import settings
    sb = get_supabase_admin()
    insert_data = {
        "title": title,
        "content": content,
        "class_id": str(class_id) if class_id else None,
        "student_id": str(student_id) if student_id else None,
    }
    if not settings.auth_disabled:
        insert_data["created_by"] = user.id
    row = (
        sb.table("materials")
        .insert(insert_data)
        .execute()
    )
    return row.data[0]


@router.get("/{material_id}")
async def get_material(
    material_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    sb = get_supabase_admin()
    result = (
        sb.table("materials")
        .select("*")
        .eq("id", str(material_id))
        .single()
        .execute()
    )
    return result.data


@router.get("/{material_id}/bias-issues")
async def get_material_bias_issues(
    material_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    """List bias issues for a piece of material."""
    sb = get_supabase_admin()
    # Get scan results linked to this material
    scans = (
        sb.table("bias_scans")
        .select("*, bias_issues(*)")
        .eq("material_id", str(material_id))
        .order("scanned_at", desc=True)
        .limit(1)
        .execute()
    )
    if not scans.data:
        return {"issues": [], "total_issues": 0}
    scan = scans.data[0]
    return {
        "scan_id": scan["id"],
        "scanned_at": scan["scanned_at"],
        "issues": scan.get("bias_issues", []),
        "total_issues": len(scan.get("bias_issues", [])),
    }
