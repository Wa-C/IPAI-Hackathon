from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ClassCreate(BaseModel):
    name: str
    grade: str
    subject: str
    organization_id: UUID
    next_lesson_time: datetime | None = None


class ClassUpdate(BaseModel):
    name: str | None = None
    grade: str | None = None
    subject: str | None = None
    next_lesson_time: datetime | None = None
    archived: bool | None = None


class ClassOut(BaseModel):
    id: UUID
    name: str
    grade: str
    subject: str
    organization_id: UUID
    teacher_id: UUID
    next_lesson_time: datetime | None = None
    student_count: int = 0
    archived: bool = False
    created_at: datetime | None = None


class EnrolmentAction(BaseModel):
    user_id: UUID
    role: str = "student"  # student | teacher
