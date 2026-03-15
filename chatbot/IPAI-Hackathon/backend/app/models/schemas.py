from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StudentCreate(BaseModel):
    name: str
    age: int
    interests: list[str] = []
    learning_style: str = "visual"
    issues: list[str] = []
    notes: str = ""
    weekly_goal_minutes: int = 120


class StudentResponse(BaseModel):
    id: int
    name: str
    age: int
    interests: list[str]
    learning_style: str
    issues: list[str]
    notes: str
    onboarded: bool = False
    weekly_goal_minutes: int = 120
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    student_id: int
    message: str
    session_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str
    session_id: int
    exercise: Optional[dict] = None
    concepts_touched: list[str] = []
    phase: str = "warmup"
    new_badges: list[dict] = []


class CourseResponse(BaseModel):
    id: int
    title: str
    subject: str
    filename: str
    chunk_count: int
    week_number: int = 0
    is_current: bool = True
    vocabulary: list[str] = []
    uploaded_at: datetime

    class Config:
        from_attributes = True


class WeeklyReport(BaseModel):
    student_id: int
    student_name: str
    period: str
    total_sessions: int
    total_time_minutes: float
    text_time_minutes: float
    voice_time_minutes: float
    exercises_attempted: int
    exercises_correct: int
    strengths: list[str]
    weaknesses: list[str]
    achievements: list[str]
    red_flags: list[str]
    recommendations: list[str]
