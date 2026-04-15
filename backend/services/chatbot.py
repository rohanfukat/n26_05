"""
Service: Core chatbot conversation logic.

handle_message(phone, text, db) is the single entry point called by the
webhook route. It:
  1. Loads / creates the user's session
  2. Determines the correct response based on the current step
  3. Updates the session
  4. Saves the grievance when confirmed
  5. Returns the reply string to send back via WhatsApp
"""

from sqlalchemy.orm import Session as DBSession
from services.session_service import get_or_create_session, update_session, reset_session
from services.grievance_service import save_grievance


# ── Greeting triggers ─────────────────────────────────────────────────────────
GREETINGS = {"hi", "hello", "hey", "helo", "hii", "namaste", "start"}


def handle_message(phone: str, text: str, db: DBSession) -> str:
    """
    Process an incoming WhatsApp message and return the appropriate reply.

    Args:
        phone: Sender's phone number (E.164, e.g. "919876543210").
        text:  Raw message text from the user.
        db:    Active SQLAlchemy database session.

    Returns:
        Reply string to send back to the user.
    """
    text_clean = text.strip()
    text_lower = text_clean.lower()

    # ── Hard-reset command ────────────────────────────────────────────────────
    if text_lower == "restart":
        reset_session(phone, db)
        return (
            "🔄 Your session has been reset.\n\n"
            "Welcome to Government Grievance Portal 🇮🇳\n"
            "Please tell your issue"
        )

    # ── Load (or create) user session ─────────────────────────────────────────
    session = get_or_create_session(phone, db)
    step = session.step

    # ── Greeting / fresh start ────────────────────────────────────────────────
    if text_lower in GREETINGS or step == "start":
        update_session(phone, db, step="ask_issue")
        return (
            "Welcome to Government Grievance Portal 🇮🇳\n\n"
            "We are here to help you resolve civic issues quickly.\n\n"
            "Please tell your issue"
        )

    # ── Step: ask_issue  →  user is providing the issue ──────────────────────
    if step == "ask_issue":
        update_session(phone, db, issue=text_clean, step="ask_location")
        return "📍 Please share your location (area / city / pincode)"

    # ── Step: ask_location  →  user is providing the location ────────────────
    if step == "ask_location":
        update_session(phone, db, location=text_clean, step="ask_description")
        return "📝 Please describe your issue briefly"

    # ── Step: ask_description  →  user is providing the description ──────────
    if step == "ask_description":
        # Reload session to get previously saved issue & location
        session = update_session(phone, db, description=text_clean, step="confirm")
        summary = (
            "📋 *Summary of your complaint:*\n\n"
            f"🔹 Issue     : {session.issue}\n"
            f"📍 Location  : {session.location}\n"
            f"📝 Description: {text_clean}\n\n"
            "Is this correct? Reply *yes* to submit or *no* to start over."
        )
        return summary

    # ── Step: confirm  →  user is confirming or rejecting ────────────────────
    if step == "confirm":
        if text_lower in {"yes", "y", "haan", "ha", "correct", "ok", "okay"}:
            # Save grievance to DB
            grievance = save_grievance(session, db)
            update_session(phone, db, step="completed")
            return (
                "✅ Your complaint has been registered successfully!\n\n"
                f"🆔 Complaint ID : *{grievance.complaint_id}*\n"
                f"📂 Category      : {grievance.category}\n"
                f"⚡ Priority       : {grievance.priority.capitalize()}\n"
                f"📌 Status         : Pending\n\n"
                "We will resolve your issue soon. Thank you 🙏"
            )
        elif text_lower in {"no", "n", "nahi", "nope", "wrong"}:
            reset_session(phone, db)
            update_session(phone, db, step="ask_issue")
            return (
                "🔄 Let's start over.\n\n"
                "Please tell your issue again"
            )
        else:
            return "Please reply *yes* to confirm or *no* to restart."

    # ── Step: completed  →  session already done ─────────────────────────────
    if step == "completed":
        # Allow the user to file another grievance
        update_session(phone, db, step="ask_issue", issue=None, location=None, description=None)
        return (
            "Would you like to register another complaint?\n\n"
            "Please tell your issue"
        )

    # ── Fallback ──────────────────────────────────────────────────────────────
    return (
        "I didn't understand that. 😕\n\n"
        "Type *hi* to start registering a grievance or "
        "*restart* to reset the conversation."
    )
