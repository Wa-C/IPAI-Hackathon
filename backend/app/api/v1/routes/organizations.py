import secrets
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import CurrentUser, get_current_user, assert_org_membership
from app.db.supabase_client import get_supabase_admin
from app.models.organizations import (
    OrganizationOut,
    OrganizationUpdate,
    ApiKeyOut,
    ApiKeyCreate,
    IntegrationOut,
)

router = APIRouter(prefix="/organizations")


@router.get("", response_model=list[OrganizationOut])
async def list_organizations(user: CurrentUser = Depends(get_current_user)):
    """List organisations the current user belongs to."""
    from app.core.config import settings as app_settings
    sb = get_supabase_admin()

    # In dev mode, return all orgs since the fake user has no memberships
    if app_settings.auth_disabled:
        result = sb.table("organizations").select("*").execute()
        return result.data

    memberships = (
        sb.table("org_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .execute()
    )
    org_ids = [m["organization_id"] for m in memberships.data]
    if not org_ids:
        return []
    result = (
        sb.table("organizations").select("*").in_("id", org_ids).execute()
    )
    return result.data


@router.get("/{org_id}", response_model=OrganizationOut)
async def get_organization(
    org_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    await assert_org_membership(user.id, str(org_id))
    sb = get_supabase_admin()
    result = (
        sb.table("organizations").select("*").eq("id", str(org_id)).single().execute()
    )
    return result.data


@router.patch("/{org_id}", response_model=OrganizationOut)
async def update_organization(
    org_id: UUID,
    body: OrganizationUpdate,
    user: CurrentUser = Depends(get_current_user),
):
    await assert_org_membership(user.id, str(org_id))
    sb = get_supabase_admin()
    update_data = body.model_dump(exclude_unset=True)
    result = (
        sb.table("organizations")
        .update(update_data)
        .eq("id", str(org_id))
        .single()
        .execute()
    )
    return result.data


# ---- API Keys ----

@router.post("/{org_id}/api-keys", response_model=ApiKeyOut)
async def create_api_key(
    org_id: UUID,
    body: ApiKeyCreate,
    user: CurrentUser = Depends(get_current_user),
):
    """Generate a new API key for the organisation (org_admin only)."""
    await assert_org_membership(user.id, str(org_id))
    # Check admin role
    sb = get_supabase_admin()
    member = (
        sb.table("org_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", str(org_id))
        .single()
        .execute()
    )
    if member.data["role"] not in ("org_admin", "it_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")

    from app.core.config import settings as app_settings
    raw_key = f"ecdp_live_{secrets.token_hex(24)}"
    insert_data = {
        "organization_id": str(org_id),
        "key_hash": raw_key,  # In production, store a hash
        "key_prefix": raw_key[:16],
        "label": body.label,
    }
    if not app_settings.auth_disabled:
        insert_data["created_by"] = user.id
    result = (
        sb.table("api_keys")
        .insert(insert_data)
        .execute()
    )
    row = result.data[0]
    return ApiKeyOut(
        id=row["id"],
        key_prefix=raw_key[:16],
        created_at=row["created_at"],
    )


# ---- Integrations ----

@router.get("/{org_id}/integrations", response_model=list[IntegrationOut])
async def list_integrations(
    org_id: UUID,
    user: CurrentUser = Depends(get_current_user),
):
    await assert_org_membership(user.id, str(org_id))
    sb = get_supabase_admin()
    result = (
        sb.table("integrations")
        .select("*")
        .eq("organization_id", str(org_id))
        .execute()
    )
    return result.data
