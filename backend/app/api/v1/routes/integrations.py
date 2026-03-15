"""
External integrations / third-party API endpoint.

External systems use org-level API keys to call these endpoints
for bias scans, differentiated task generation, or learning plans.
"""

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.db.supabase_client import get_supabase_admin
from app.models.bias import BiasScanRequest, BiasScanResultOut
from app.models.analytics import MlTaskOut
from app.services.bias_scanner import scan_text
from app.services.differentiation import generate_differentiated_tasks

router = APIRouter(prefix="/integrations")


async def _validate_api_key(x_api_key: str = Header(...)) -> str:
    """Validate an org-level API key and return the organization_id."""
    sb = get_supabase_admin()
    result = (
        sb.table("api_keys")
        .select("organization_id")
        .eq("key_hash", x_api_key)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key"
        )
    return result.data[0]["organization_id"]


@router.post("/bias-scan", response_model=BiasScanResultOut)
async def external_bias_scan(
    body: BiasScanRequest,
    org_id: str = Depends(_validate_api_key),
):
    """External endpoint: run a bias scan using an org API key."""
    result = await scan_text(body.text, categories=body.categories)

    sb = get_supabase_admin()
    scan_row = (
        sb.table("bias_scans")
        .insert(
            {
                "material_id": str(body.material_id) if body.material_id else None,
                "scanned_at": result["scanned_at"],
                "total_issues": result["total_issues"],
                "issues_by_category": result["issues_by_category"],
                "resolved_count": 0,
                "created_by": None,
            }
        )
        .execute()
    )
    scan_id = scan_row.data[0]["id"]
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

    result["id"] = scan_id
    return result


@router.post("/generate-tasks")
async def external_generate_tasks(
    title: str,
    subject: str,
    topic: str,
    learning_objective: str,
    base_material: str | None = None,
    grade_level: int | None = None,
    org_id: str = Depends(_validate_api_key),
):
    """External endpoint: generate differentiated tasks using an org API key."""
    levels = await generate_differentiated_tasks(
        title=title,
        subject=subject,
        topic=topic,
        learning_objective=learning_objective,
        base_material=base_material,
        grade_level=grade_level,
    )
    return {"differentiation_levels": levels}
