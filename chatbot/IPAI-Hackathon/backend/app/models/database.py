from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Text,
    DateTime, ForeignKey, JSON, Boolean
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime, timezone
from app.config import settings

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    interests = Column(JSON, default=list)
    learning_style = Column(String, default="visual")
    issues = Column(JSON, default=list)
    notes = Column(Text, default="")
    onboarded = Column(Boolean, default=False)         # has AI completed first-contact?
    weekly_goal_minutes = Column(Integer, default=120)  # teacher-set weekly target (minutes)
    weekly_max_minutes = Column(Integer, default=0)     # 0 = no max
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    knowledge = relationship("KnowledgeEntry", back_populates="student")
    sessions = relationship("TutoringSession", back_populates="student")
    course_progress = relationship("CourseProgress", back_populates="student")
    badges = relationship("Badge", back_populates="student")


class KnowledgeEntry(Base):
    __tablename__ = "knowledge_entries"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)  # link to course
    concept = Column(String, nullable=False)
    mastery_level = Column(Float, default=0.0)
    attempts = Column(Integer, default=0)
    correct = Column(Float, default=0)
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    struggles = Column(JSON, default=list)

    student = relationship("Student", back_populates="knowledge")


class TutoringSession(Base):
    __tablename__ = "tutoring_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    mode = Column(String, default="text")
    phase = Column(String, default="warmup")  # warmup | lesson | practice | wrapup
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Float, default=0.0)
    topic = Column(String, default="")
    summary = Column(Text, default="")
    messages = Column(JSON, default=list)
    exercises_given = Column(Integer, default=0)
    exercises_correct = Column(Integer, default=0)
    red_flags = Column(JSON, default=list)
    tasks_state = Column(Text, nullable=True)

    student = relationship("Student", back_populates="sessions")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subject = Column(String, default="")
    filename = Column(String, nullable=False)
    chunk_count = Column(Integer, default=0)
    week_number = Column(Integer, default=0)           # which week this course belongs to
    is_current = Column(Boolean, default=True)         # is this the active week's course?
    exercise_prompt = Column(Text, nullable=True)
    concepts = Column(JSON, default=list)              # extracted concept list
    vocabulary = Column(JSON, default=list)            # mandatory vocab for this course
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    progress = relationship("CourseProgress", back_populates="course")


class CourseProgress(Base):
    """Per-student progress on each course."""
    __tablename__ = "course_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    completion_pct = Column(Float, default=0.0)        # 0.0 to 1.0
    concepts_total = Column(Integer, default=0)
    concepts_mastered = Column(Integer, default=0)
    vocab_total = Column(Integer, default=0)
    vocab_mastered = Column(Integer, default=0)
    status = Column(String, default="not_started")     # not_started | in_progress | completed
    last_activity = Column(DateTime, nullable=True)

    student = relationship("Student", back_populates="course_progress")
    course = relationship("Course", back_populates="progress")


class Badge(Base):
    """Gamification badges earned by students."""
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    badge_type = Column(String, nullable=False)        # "streak_3", "vocab_50", "first_chat", etc.
    title = Column(String, nullable=False)
    description = Column(String, default="")
    earned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="badges")


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
