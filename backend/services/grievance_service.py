"""
Service: Grievance persistence.

Provides:
  - save_grievance(session, db)  → Grievance
"""

import uuid
from sqlalchemy.orm import Session as DBSession
from models.grievance import UserSession, Grievance
from utils.classifier import classify_grievance


def save_grievance(user_session: UserSession, db: DBSession) -> Grievance:
    """
    Create and persist a Grievance record from a completed UserSession.

    The category and priority are auto-classified from the issue + description text.

    Args:
        user_session: The completed UserSession containing collected grievance data.
        db:           Active SQLAlchemy database session.

    Returns:
        The newly created Grievance ORM object.
    """
    # Auto-classify category and priority
    category, priority, dept_allocated = classify_grievance(
        issue=user_session.issue or "",
        description=user_session.description or "",
    )

    # Generate a short human-readable complaint ID
    short_id = str(uuid.uuid4()).split("-")[0].upper()
    complaint_id = f"GRV-{short_id}"

    grievance = Grievance(
        complaint_id=complaint_id,
        identity=user_session.phone,   # WhatsApp source → phone number as identity
        issue=user_session.issue or "",
        description=user_session.description or "",
        location=user_session.location or "",
        latitude=user_session.latitude,
        longitude=user_session.longitude,
        category=category,
        priority=priority,
        status="pending",
        source="whatsapp",
        dept_allocated=dept_allocated,
    )

    db.add(grievance)
    db.commit()
    db.refresh(grievance)

    return grievance
