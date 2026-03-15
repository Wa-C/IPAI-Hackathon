from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel


class LearningMode(str, Enum):
    read = "read"
    play = "play"
    watch = "watch"
    mixed = "mixed"


class DiffLevel(str, Enum):
    struggling = "struggling"
    on_track = "on-track"
    advanced = "advanced"


class TaskOut(BaseModel):
    id: UUID
    title: str
    description: str
    mode: LearningMode
    duration: int
    generated_by_ai: bool = False


class DifferentiationLevelOut(BaseModel):
    level: DiffLevel
    rationale: str
    tasks: list[TaskOut] = []


class LessonCreate(BaseModel):
    class_id: UUID
    title: str
    subject: str = ""
    topic: str = ""
    learning_objective: str = ""
    base_material: str | None = None
    grade_level: int | None = None
    duration: int | None = None
    content_types: list[str] | None = None
    generate_differentiation: bool = True
    status: str | None = None  # "draft" or "published", defaults to "published"


class LessonOut(BaseModel):
    id: UUID
    class_id: UUID
    title: str
    subject: str
    topic: str
    learning_objective: str
    base_material: str | None = None
    status: str = "draft"
    grade_level: int | None = None
    duration: int | None = None
    differentiated_content: bool = False
    content_types: list[str] | None = None
    differentiation_levels: list[DifferentiationLevelOut] = []
    bias_scan_status: str | None = None
    created_at: datetime | None = None


class LessonUpdate(BaseModel):
    title: str | None = None
    topic: str | None = None
    learning_objective: str | None = None
    base_material: str | None = None
    status: str | None = None
    duration: int | None = None
