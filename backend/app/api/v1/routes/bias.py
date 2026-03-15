from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.core.auth import CurrentUser, get_current_user
from app.db.supabase_client import get_supabase_admin
from app.models.bias import BiasScanRequest, BiasScanResultOut, BiasIssueUpdate
from app.services.bias_scanner import scan_text

router = APIRouter(prefix="/bias")


@router.post("/scan", response_model=BiasScanResultOut, status_code=status.HTTP_201_CREATED)
async def run_bias_scan(
    body: BiasScanRequest,
    user: CurrentUser = Depends(get_current_user),
):
    """
    Scan text for bias issues.
    Optionally link to a material_id. Returns detected issues.
    """
    result = await scan_text(body.text, categories=body.categories)

    # Persist to DB
    sb = get_supabase_admin()
    insert_data = {
        "material_id": str(body.material_id) if body.material_id else None,
        "scanned_at": result["scanned_at"],
        "total_issues": result["total_issues"],
        "issues_by_category": result["issues_by_category"],
        "resolved_count": 0,
    }
    # Only set created_by if it's a real auth user (skip in dev mode)
    from app.core.config import settings
    if not settings.auth_disabled:
        insert_data["created_by"] = user.id

    scan_row = (
        sb.table("bias_scans")
        .insert(insert_data)
        .execute()
    )
    scan_id = scan_row.data[0]["id"]

    # Store individual issues
    for issue in result["issues"]:
        sb.table("bias_issues").insert(
            {
                "scan_id": scan_id,
                "category": issue["category"].value if hasattr(issue["category"], "value") else issue["category"],
                "severity": issue["severity"].value if hasattr(issue["severity"], "value") else issue["severity"],
                "original_phrase": issue["original_phrase"],
                "explanation": issue["explanation"],
                "suggestion": issue["suggestion"],
                "position_start": issue["position_start"],
                "position_end": issue["position_end"],
                "resolved": False,
            }
        ).execute()

    # Re-fetch with issues
    full = (
        sb.table("bias_scans")
        .select("*, bias_issues(*)")
        .eq("id", scan_id)
        .single()
        .execute()
    )
    data = full.data
    data["issues"] = data.pop("bias_issues", [])
    data["id"] = scan_id
    return data


@router.patch("/issues/{issue_id}")
async def update_bias_issue(
    issue_id: UUID,
    body: BiasIssueUpdate,
    user: CurrentUser = Depends(get_current_user),
):
    """Mark a bias issue as resolved or apply a suggestion."""
    sb = get_supabase_admin()
    update_data = body.model_dump(exclude_unset=True)
    result = (
        sb.table("bias_issues")
        .update(update_data)
        .eq("id", str(issue_id))
        .single()
        .execute()
    )

    # Update resolved_count on the parent scan
    if body.resolved is True:
        issue = result.data
        sb.rpc(
            "increment_resolved_count",
            {"scan_id_param": issue["scan_id"]},
        ).execute()

    return result.data
