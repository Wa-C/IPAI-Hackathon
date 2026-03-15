from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel


class BiasCategory(str, Enum):
    gender = "gender"
    culture = "culture"
    socioeconomic = "socioeconomic"
    ableism = "ableism"


class BiasSeverity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class BiasScanRequest(BaseModel):
    text: str
    material_id: UUID | None = None
    categories: list[BiasCategory] | None = None


class BiasIssueOut(BaseModel):
    id: UUID
    category: BiasCategory
    severity: BiasSeverity
    original_phrase: str
    explanation: str
    suggestion: str
    position_start: int
    position_end: int
    resolved: bool = False


class BiasScanResultOut(BaseModel):
    id: UUID
    material_id: UUID | None = None
    scanned_at: datetime
    total_issues: int
    issues_by_category: dict[str, int] = {}
    resolved_count: int = 0
    issues: list[BiasIssueOut] = []


class BiasIssueUpdate(BaseModel):
    resolved: bool | None = None
    applied_suggestion: str | None = None
