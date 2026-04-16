"""
SQLAlchemy models for:
  - UserSession  → tracks per-user chatbot conversation state
  - Grievance    → stores finalised complaints
"""

from sqlalchemy import Column, String, DateTime, Text, Float, Integer
from sqlalchemy.dialects.postgresql import UUID, ARRAY
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

    # Optional geo-coordinates parsed from user's location message
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())


class DepartmentGrievance(Base):
    """Stores parent-level grouped grievances forwarded by admin to a department."""

    __tablename__ = "department_grievances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    parent_issue = Column(Text, nullable=False)
    category = Column(String, nullable=True)
    priority = Column(String, nullable=True, default="medium")
    status = Column(String, nullable=True, default="pending")
    dept_allocated = Column(String, nullable=False)
    child_grievance_ids = Column(ARRAY(String), nullable=False, default=[])

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
class Grievance(Base):
    """Stores a finalised, confirmed grievance complaint."""

    __tablename__ = "grievances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Unique human-readable complaint ID, e.g. GRV-<short-uuid>
    complaint_id = Column(String, unique=True, nullable=True, index=True)

    # identity: either a user_id (UUID string) when submitted via API/frontend,
    #           or a phone number (E.164) when submitted via WhatsApp chatbot.
    identity = Column(String, nullable=True, index=True)

    issue = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    location = Column(Text, nullable=True)

    # Geographic coordinates (optional)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Media attachments (Cloudinary URLs or similar)
    before_photo = Column(Text, nullable=True)
    after_photo = Column(Text, nullable=True)

    # Auto-classified fields
    category = Column(String, nullable=True, default="General")  # e.g. Water, Road, Electricity
    priority = Column(String, nullable=True, default="medium")   # high | medium

    status = Column(String, nullable=True, default="pending")    # pending | in-progress | resolved
    source = Column(String, nullable=True, default="whatsapp")   # whatsapp | api
    dept_allocated = Column(String, nullable=True, default="General Administration (BMC)")

    # Upvote tracking
    upvotes = Column(Integer, nullable=False, default=0)
    upvoted_by = Column(ARRAY(String), nullable=False, default=[])

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
