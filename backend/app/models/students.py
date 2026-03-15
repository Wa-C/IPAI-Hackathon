from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.lessons import LearningMode


class LearningPreferenceOut(BaseModel):
    recommended: LearningMode
    manual: LearningMode | None = None
    scores: dict[str, float] = {}
    content_format: str = "reading"


class LearningPreferenceUpdate(BaseModel):
    manual: LearningMode | None = None
    scores: dict[str, float] | None = None
    content_format: str | None = None


class AssessmentCreate(BaseModel):
    assessment_type: str  # e.g. "mini-test", "quiz"
    score: float
    max_score: float
    mode_used: LearningMode | None = None
    metadata: dict | None = None


class AssessmentOut(BaseModel):
    id: UUID
    student_id: UUID
    assessment_type: str
    score: float
    max_score: float
    mode_used: LearningMode | None = None
    created_at: datetime | None = None


class RecommendationOut(BaseModel):
    recommended_mode: LearningMode
    confidence: float
    explanation: str
    score_breakdown: dict[str, float] = {}


class StudentOut(BaseModel):
    id: UUID
    name: str
    email: str
    class_id: UUID | None = None
    organization_id: UUID
    performance_status: str = "on-track"
    learning_preference: LearningPreferenceOut | None = None
    last_activity_date: datetime | None = None
