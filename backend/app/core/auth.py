from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, Header, status

from app.core.config import settings
from app.db.supabase_client import get_supabase_admin


class CurrentUser:
    """Lightweight representation of the authenticated user."""

    def __init__(self, user_id: str, email: str, role: str | None = None):
        self.id = user_id
        self.email = email
        self.role = role


# ---------------------------------------------------------------
# DEV MODE: Auth is disabled. A fake user is injected on every
# request. When you're ready to enable real Supabase JWT auth,
# set AUTH_DISABLED=false in .env and the real path will be used.
# ---------------------------------------------------------------

_DEV_USER = CurrentUser(
    user_id="00000000-0000-0000-0000-000000000001",
    email="dev@edcopilot.local",
    role="teacher",
)


async def _get_current_user_disabled() -> CurrentUser:
    """Return a hardcoded dev user (auth disabled)."""
    return _DEV_USER


async def _get_current_user_real(
    authorization: Annotated[str, Header()],
) -> CurrentUser:
    """Decode the Supabase JWT from the Authorization header."""
    import jwt as pyjwt

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )

    token = authorization[7:]
    try:
        payload = pyjwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired"
        )
    except pyjwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    user_id = payload.get("sub")
    email = payload.get("email", "")
    role = payload.get("user_metadata", {}).get("role")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
        )

    return CurrentUser(user_id=user_id, email=email, role=role)


# Pick which dependency to use based on config
if settings.auth_disabled:
    get_current_user = _get_current_user_disabled
else:
    get_current_user = _get_current_user_real


async def require_role(required: str, user: CurrentUser) -> CurrentUser:
    """Utility to assert a specific role."""
    if user.role != required:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{required}' required",
        )
    return user


async def get_user_org_ids(user_id: str) -> list[str]:
    """Fetch all organisation IDs this user belongs to."""
    sb = get_supabase_admin()
    result = (
        sb.table("org_members")
        .select("organization_id")
        .eq("user_id", user_id)
        .execute()
    )
    return [row["organization_id"] for row in result.data]


async def assert_org_membership(user_id: str, org_id: str) -> None:
    """Raise 403 if user is not a member of the given org."""
    if settings.auth_disabled:
        return  # Skip membership check in dev mode
    org_ids = await get_user_org_ids(user_id)
    if org_id not in org_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organisation",
        )
