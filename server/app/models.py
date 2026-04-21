import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

def new_uuid():
    return str(uuid.uuid4())

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=new_uuid)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    plan = Column(String, nullable=False, default="free")
    timezone = Column(String, nullable=False, default="UTC")
    email_reminders_enabled = Column(Boolean, nullable=False, default=True)
    reminder_time = Column(String, nullable=False, default="09:00")
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    sessions = relationship("Session", back_populates="user")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    label = Column(String, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    focus_rating = Column(Integer, nullable=False)
    distraction_type = Column(String, nullable=False)
    distraction_note = Column(String, nullable=True)
    what_went_well = Column(String, nullable=True)
    what_to_do_better = Column(String, nullable=True)
    could_be_python = Column(Boolean, nullable=False, default=True)  # always True now
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    user = relationship("User", back_populates="sessions")
