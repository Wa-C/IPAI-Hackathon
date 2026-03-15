from fastapi import APIRouter, Depends

from app.core.auth import CurrentUser, get_current_user, get_user_org_ids
from app.db.supabase_client import get_supabase_admin
from app.models.users import UserProfile, UserProfileUpdate, OrgMembership

router = APIRouter()


@router.get("/me", response_model=UserProfile)
async def get_my_profile(user: CurrentUser = Depends(get_current_user)):
    """Return the current user's profile from the profiles table."""
    sb = get_supabase_admin()
    result = sb.table("profiles").select("*").eq("id", user.id).single().execute()
    return result.data


@router.patch("/me", response_model=UserProfile)
async def update_my_profile(
    body: UserProfileUpdate,
    user: CurrentUser = Depends(get_current_user),
):
    """Update editable profile fields."""
    sb = get_supabase_admin()
    update_data = body.model_dump(exclude_unset=True)
    result = (
        sb.table("profiles")
        .update(update_data)
        .eq("id", user.id)
        .single()
        .execute()
    )
    return result.data


@router.get("/me/organizations", response_model=list[OrgMembership])
async def get_my_organizations(user: CurrentUser = Depends(get_current_user)):
    """List organisations the current user belongs to."""
    sb = get_supabase_admin()
    result = (
        sb.table("org_members")
        .select("organization_id, role, organizations(name)")
        .eq("user_id", user.id)
        .execute()
    )
    return [
        OrgMembership(
            organization_id=row["organization_id"],
            organization_name=row["organizations"]["name"],
            role=row["role"],
        )
        for row in result.data
    ]
