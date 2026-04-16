"""
Service: Grievance persistence.

Provides:
  - save_grievance(session, db)  → Grievance
"""

import uuid
import asyncio
from sqlalchemy.orm import Session as DBSession
from models.grievance import UserSession, Grievance
from classifier import classify_complaint
from cleaner import clean_text


ALLOWED_CATEGORIES = ['Water', 'Road', 'Garbage', 'Electricity', 'Traffic', 'Drainage', 'Infrastructure', 'Environment', 'General']


def classify_grievance(issue: str, description: str):
    """Synchronous wrapper that calls classify_complaint and returns (category, priority, dept_allocated)."""
    combined = f"{issue} {description}".strip()
    cleaned = clean_text(combined)
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                result = pool.submit(asyncio.run, classify_complaint(cleaned, combined)).result()
        else:
            result = loop.run_until_complete(classify_complaint(cleaned, combined))
    except RuntimeError:
        result = asyncio.run(classify_complaint(cleaned, combined))

    category = result.get("category", "General")
    # Ensure category is from the allowed list
    if category not in ALLOWED_CATEGORIES:
        category_lower = category.lower()
        matched = next((c for c in ALLOWED_CATEGORIES if c.lower() == category_lower), None)
        category = matched if matched else "General"
    priority = result.get("severity", "medium")
    dept_allocated = result.get("department", "General Administration")
    return category, priority, dept_allocated


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
    # Use pre-classified category from session if available, otherwise auto-classify
    if user_session.category:
        category = user_session.category
        # Still classify for priority and department
        _, priority, dept_allocated = classify_grievance(
            issue=user_session.issue or "",
            description=user_session.description or "",
        )
    else:
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
