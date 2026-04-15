"""
SQLAlchemy models for:
  - UserSession  → tracks per-user chatbot conversation state
  - Grievance    → stores finalised complaints
"""

from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base
import uuid


class UserSession(Base):
    """Tracks the multi-step WhatsApp chatbot state for each user."""

    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    phone = Column(String, unique=True, nullable=False, index=True)

    # Current step in the conversation flow
    # Possible values: "start" | "ask_issue" | "ask_location"
    #                  | "ask_description" | "confirm" | "completed"
    step = Column(String, nullable=False, default="start")

    # Collected grievance fields (filled incrementally)
    issue = Column(Text, nullable=True)
    location = Column(Text, nullable=True)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())


class Grievance(Base):
    """Stores a finalised, confirmed grievance complaint."""

    __tablename__ = "grievances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Unique human-readable complaint ID, e.g. GRV-<short-uuid>
    complaint_id = Column(String, unique=True, nullable=False, index=True)

    user_phone = Column(String, nullable=False, index=True)
    issue = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(Text, nullable=False)

    # Auto-classified fields
    category = Column(String, nullable=False, default="General")  # e.g. Water, Road, Electricity
    priority = Column(String, nullable=False, default="medium")   # high | medium

    status = Column(String, nullable=False, default="pending")    # pending | in-progress | resolved
    source = Column(String, nullable=False, default="whatsapp")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
