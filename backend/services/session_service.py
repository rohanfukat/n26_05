"""
Service: Session management for WhatsApp chatbot conversations.

Provides:
  - get_or_create_session(phone, db)  → UserSession
  - update_session(phone, db, **fields)
  - reset_session(phone, db)
"""

from sqlalchemy.orm import Session
from models.grievance import UserSession


def get_or_create_session(phone: str, db: Session) -> UserSession:
    """
    Retrieve the existing session for a phone number, or create a fresh one
    at step='start' if none exists.
    """
    session = db.query(UserSession).filter(UserSession.phone == phone).first()

    if not session:
        session = UserSession(phone=phone, step="start")
        db.add(session)
        db.commit()
        db.refresh(session)

    return session


def update_session(phone: str, db: Session, **fields) -> UserSession:
    """
    Update one or more fields of a user's session.

    Example:
        update_session(phone, db, step="ask_location", issue="broken road")
    """
    session = get_or_create_session(phone, db)

    for key, value in fields.items():
        if hasattr(session, key):
            setattr(session, key, value)

    db.commit()
    db.refresh(session)
    return session


def reset_session(phone: str, db: Session) -> UserSession:
    """
    Reset a user's session back to a clean 'start' state, clearing all
    previously collected grievance data.
    """
    return update_session(
        phone,
        db,
        step="start",
        issue=None,
        location=None,
        description=None,
        category=None,
    )
