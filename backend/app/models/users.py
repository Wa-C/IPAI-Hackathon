from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserRole(str, Enum):
    teacher = "teacher"
    student = "student"
    org_admin = "org_admin"
    it_admin = "it_admin"


class UserProfile(BaseModel):
    id: UUID
    email: str
    name: str
    role: UserRole
    avatar_url: str | None = None
    language: str = "en"
    timezone: str = "Europe/Berlin"
    created_at: datetime | None = None


class UserProfileUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None
    language: str | None = None
    timezone: str | None = None


class OrgMembership(BaseModel):
    organization_id: UUID
    organization_name: str
    role: UserRole
