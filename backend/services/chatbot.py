"""
Service: Core chatbot conversation logic.

handle_message(phone, text, db) is the single entry point called by the
webhook route. It:
  1. Checks rate limiting (escalating cooldown per violation)
  2. Loads / creates the user's session
  3. Determines the correct response based on the current step
  4. Updates the session
  5. Saves the grievance when confirmed
  6. Returns the reply string to send back via WhatsApp
"""

import os
import re
from collections import deque
from datetime import datetime, timezone
import google.generativeai as genai
from sqlalchemy.orm import Session as DBSession
from services.session_service import get_or_create_session, update_session, reset_session
from services.grievance_service import save_grievance

# ── Gemini complaint validator ────────────────────────────────────────────────
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
_VALIDATOR_MODEL = genai.GenerativeModel(
    model_name="gemini-2.5-flash-lite",
    generation_config={"temperature": 0.0, "max_output_tokens": 50},
)

VALID_CATEGORIES = ['Water', 'Road', 'Garbage', 'Electricity', 'Traffic', 'Drainage', 'Infrastructure', 'Environment', 'General']

_VALIDATION_PROMPT = (
    "You are a complaint validator and categorizer for a Government Grievance Portal.\n\n"
    "Given the following text, do TWO things:\n"
    "1. Determine if it is a genuine civic complaint.\n"
    "2. If valid, assign it to exactly ONE of these categories: "
    "Water, Road, Garbage, Electricity, Traffic, Drainage, Infrastructure, Environment, General.\n\n"
    "Reply in this exact format (nothing else):\n"
    "VALID:<Category>   (e.g. VALID:Road)\n"
    "or\n"
    "INVALID\n\n"
    "Category guidelines:\n"
    "- Water: water supply, pipeline leak, contamination, bore well, water tanker\n"
    "- Road: pothole, broken road, road repair, speed bump, footpath\n"
    "- Garbage: waste collection, dumping, sanitation, cleanliness\n"
    "- Electricity: streetlight, power cut, transformer, electric pole, wiring\n"
    "- Traffic: signal, parking, congestion, road signs, zebra crossing\n"
    "- Drainage: sewage, gutter, flooding, waterlogging, manhole\n"
    "- Infrastructure: bridge, building, public toilet, bus stop, park, playground\n"
    "- Environment: pollution, noise, tree cutting, air quality, illegal construction\n"
    "- General: anything civic that doesn't fit above categories\n\n"
    "Text: \"{text}\"\n\n"
    "Answer:"
)


def _is_valid_complaint(text: str) -> tuple[bool, str]:
    """
    Use Gemini to check if the text is a genuine civic complaint and categorize it.
    Returns (is_valid, category). Category is 'General' by default.
    """
    try:
        response = _VALIDATOR_MODEL.generate_content(_VALIDATION_PROMPT.format(text=text))
        result = response.text.strip()
        upper = result.upper()

        if upper.startswith("VALID"):
            # Parse category from "VALID:Road" format
            parts = result.split(":", 1)
            if len(parts) == 2:
                cat = parts[1].strip().title()
                if cat in VALID_CATEGORIES:
                    return True, cat
            return True, "General"

        return False, "General"
    except Exception as e:
        print(f"[Chatbot] Gemini validation failed: {e}, allowing complaint through")
        return True, "General"  # fail-open


# ── Greeting triggers ─────────────────────────────────────────────────────────
GREETINGS = {"hi", "hello", "hey", "helo", "hii", "namaste", "start"}

# ── Lat/Lng pattern: matches "12.9716, 77.5946" or "12.9716 77.5946" ──────────
_LATLNG_RE = re.compile(
    r"(-?\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)"
)

# ── Input validation ──────────────────────────────────────────────────────────
# Detects strings that are pure random keyboard mashing:
#   • No vowels at all (real words almost always have vowels)
#   • OR a single repeated character e.g. "aaaaaaa"
#   • OR contains no spaces AND is a long consonant cluster (>= 6 consecutive
#     consonants) — a strong signal of random typing
_CONSONANT_RUN_RE = re.compile(r"[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}")

# Known valid location keywords — pincode digits, or common civic nouns
_LOCATION_WORD_RE = re.compile(
    r"\b(\d{6}|\d{5}|road|street|nagar|colony|ward|village|city|town|"
    r"district|area|sector|block|lane|marg|chowk|bazaar|bazar|"
    r"mumbai|delhi|pune|bangalore|bengaluru|hyderabad|chennai|kolkata|"
    r"ahmedabad|surat|jaipur|lucknow|kanpur|nagpur|indore|bhopal|"
    r"patna|vadodara|ghaziabad|ludhiana|agra|nashik|faridabad|meerut|"
    r"rajkot|varanasi|srinagar|aurangabad|dhanbad|amritsar|allahabad)\b",
    re.IGNORECASE,
)


def _is_gibberish(text: str) -> bool:
    """
    Return True if the text looks like random keyboard mashing.

    Heuristics (any one triggers gibberish detection):
      1. Fewer than 10 characters after stripping spaces — too short to be meaningful.
      2. No vowels at all in an alphabetic string (e.g. "hjksdfl").
      3. A single character repeated 4+ times (e.g. "aaaaaaa").
      4. A consonant run of 6+ consecutive consonants (e.g. "nfjcofkd").
    """
    stripped = text.strip()
    alpha_only = re.sub(r"[^a-zA-Z]", "", stripped)

    # Rule 1 — too short
    if len(stripped) < 10:
        return True

    # Rule 2 — no vowels in an alphabetic string
    if alpha_only and not re.search(r"[aeiouAEIOU]", alpha_only):
        return True

    # Rule 3 — single repeated character
    if re.fullmatch(r"(.)\1{3,}", stripped, re.IGNORECASE):
        return True

    # Rule 4 — long consonant cluster
    if _CONSONANT_RUN_RE.search(stripped):
        return True

    return False


def _is_valid_location(text: str) -> bool:
    """
    Return True if the text looks like a real location.

    Accepts:
      • Contains a 5-6 digit pincode
      • Contains a known city / civic keyword
      • Is at least 5 characters and NOT detected as gibberish
        (for location names not in our keyword list)
    """
    stripped = text.strip()

    # Accept if it contains a pincode or a known location keyword
    if _LOCATION_WORD_RE.search(stripped):
        return True

    # Reject if clearly gibberish
    if _is_gibberish(stripped):
        return False

    # Accept anything else that is at least 5 chars
    # (handles lesser-known town / area names)
    return len(stripped) >= 5

# ─────────────────────────────────────────────────────────────────────────────
# Rate limiter — escalating cooldown
#
# How it works:
#   • Each phone gets a sliding-window deque of message timestamps.
#   • Limit: 5 messages in the current cooldown window.
#   • On the 1st violation  → 2-min cooldown   (RATE_LIMIT_BASE_SECONDS)
#   • On the 2nd violation  → 7-min cooldown   (base + 1 × RATE_LIMIT_STEP_SECONDS)
#   • On the 3rd violation  → 12-min cooldown  (base + 2 × step)
#   • …capped at RATE_LIMIT_MAX_SECONDS (30 min)
#   • Once a cooldown expires naturally (deque empties), the violation count
#     resets to 0 — the user gets a clean slate.
#
# Warning policy:
#   • The warning message is sent ONCE per violation (first blocked message).
#   • All subsequent blocked messages inside the same violation are silent.
# ─────────────────────────────────────────────────────────────────────────────

RATE_LIMIT_MAX_MESSAGES   = 5          # messages allowed before triggering
RATE_LIMIT_BASE_SECONDS   = 120        # 1st violation: 2 min
RATE_LIMIT_STEP_SECONDS   = 300        # each extra violation adds 5 min
RATE_LIMIT_MAX_SECONDS    = 1800       # hard cap: 30 min

# { phone: deque([utc_timestamp, ...]) }
_rate_limit_store: dict[str, deque]  = {}
# { phone: violation_count }  — incremented every time a new ban is triggered
_violation_count:  dict[str, int]    = {}
# phones currently in the "already warned" state for this violation
_warned_phones:    set[str]          = set()


def _current_window(phone: str) -> int:
    """Return the cooldown window length (seconds) for the given phone."""
    violations = _violation_count.get(phone, 0)
    window = RATE_LIMIT_BASE_SECONDS + violations * RATE_LIMIT_STEP_SECONDS
    return min(window, RATE_LIMIT_MAX_SECONDS)


def _is_rate_limited(phone: str) -> tuple[bool, int, bool]:
    """
    Escalating sliding-window rate limiter.

    Returns a 3-tuple:
        (is_blocked, seconds_until_reset, should_warn)

        is_blocked          → True  = drop this message
        seconds_until_reset → seconds until the ban lifts (0 if not blocked)
        should_warn         → True only for the very first blocked message of
                              each violation; False = stay silent
    """
    now          = datetime.now(timezone.utc).timestamp()
    window_secs  = _current_window(phone)
    window_start = now - window_secs

    if phone not in _rate_limit_store:
        _rate_limit_store[phone] = deque()

    timestamps = _rate_limit_store[phone]

    # Evict timestamps that have slid outside the current window
    while timestamps and timestamps[0] < window_start:
        timestamps.popleft()

    # If the deque is now empty the cooldown has expired → full reset
    if not timestamps:
        _warned_phones.discard(phone)
        _violation_count.pop(phone, None)   # clean slate
        # Recalculate window_start after reset (violation count is now 0)
        window_secs  = _current_window(phone)
        window_start = now - window_secs

    # ── User has hit the cap ──────────────────────────────────────────────────
    if len(timestamps) >= RATE_LIMIT_MAX_MESSAGES:
        seconds_remaining = max(int(timestamps[0] - window_start), 1)

        if phone not in _warned_phones:
            # New violation — escalate counter and send the one-time warning
            _violation_count[phone] = _violation_count.get(phone, 0) + 1
            _warned_phones.add(phone)
            return True, seconds_remaining, True    # block + warn

        # Already warned this violation — stay silent
        return True, seconds_remaining, False       # block + silence

    # ── Message is allowed ────────────────────────────────────────────────────
    timestamps.append(now)
    return False, 0, False


def _parse_latlng(text: str):
    """
    Try to extract (latitude, longitude) floats from a free-text string.
    Returns (float, float) on success, or (None, None) if not found.
    """
    match = _LATLNG_RE.search(text)
    if match:
        lat, lng = float(match.group(1)), float(match.group(2))
        # Sanity-check valid coordinate ranges
        if -90 <= lat <= 90 and -180 <= lng <= 180:
            return lat, lng
    return None, None


def handle_message(phone: str, text: str, db: DBSession, location_data: dict = None) -> str | None:
    """
    Process an incoming WhatsApp message and return the appropriate reply.

    Args:
        phone: Sender's phone number (E.164, e.g. "919876543210").
        text:  Raw message text from the user.
        db:    Active SQLAlchemy database session.

    Returns:
        Reply string to send back to the user, or
        None if the message should be silently dropped (repeated spam).
    """
    # ── Rate limit check ──────────────────────────────────────────────────────
    limited, wait_seconds, should_warn = _is_rate_limited(phone)
    if limited:
        if not should_warn:
            # Already warned once — silently ignore all further spam messages
            return None
        minutes = wait_seconds // 60
        seconds = wait_seconds % 60
        if minutes > 0:
            time_str = f"{minutes} minute{'s' if minutes > 1 else ''} {seconds} second{'s' if seconds != 1 else ''}"
        else:
            time_str = f"{seconds} second{'s' if seconds != 1 else ''}"
        violation = _violation_count.get(phone, 1)
        escalation_note = (
            f"\n\n🔺 Repeated spamming detected (offence #{violation}). "
            f"Cooldown increased to *{minutes} min* this time."
            if violation > 1 else ""
        )
        return (
            f"⚠️ You're sending messages too fast!\n\n"
            f"Please wait *{time_str}* before sending another message. 🙏"
            f"{escalation_note}"
        )

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
        if step == "ask_issue":
            # User already greeted and we're waiting for their issue —
            # don't re-send the full welcome banner, just nudge them.
            return "😊 We're already waiting for your issue! Please describe it."
        update_session(phone, db, step="ask_issue")
        return (
            "Welcome to Government Grievance Portal 🇮🇳\n\n"
            "We are here to help you resolve civic issues quickly.\n\n"
            "Please tell your issue"
        )

    # ── Step: ask_issue  →  user is providing the issue ──────────────────────
    if step == "ask_issue":
        if _is_gibberish(text_clean):
            return (
                "❌ That doesn't look like a valid issue.\n\n"
                "Please describe your problem clearly in detail.\n"
                "_(Example: There is a broken streetlight near my house on MG Road. "
                "It has been off for 3 days and the area is very dark at night.)_"
            )
        # Validate with Gemini whether this is a real civic complaint
        is_valid, category = _is_valid_complaint(text_clean)
        if not is_valid:
            return (
                "🤖 Our AI could not recognise this as a valid civic complaint.\n\n"
                "Please describe a *government / civic issue* clearly, such as:\n"
                "• Broken road or pothole\n"
                "• Water supply problem\n"
                "• Garbage not collected\n"
                "• Streetlight not working\n\n"
                "Try again with more detail. 🙏"
            )
        update_session(phone, db, issue=text_clean, description=text_clean, step="ask_location", category=category)
        return (
            "📍 Please share your location.\n\n"
            "You need to send your *WhatsApp location* 📌\n"
            # "• Or type your *area / city / pincode*"
        )

    # ── Step: ask_location  →  user is providing the location ────────────────
    if step == "ask_location":
        # Handle WhatsApp shared location (lat/lng from location message)
        if location_data:
            lat = location_data.get("latitude")
            lng = location_data.get("longitude")
            addr = location_data.get("address", "")
            location_text = addr if addr else f"{lat}, {lng}"
            update_session(
                phone, db,
                location=location_text,
                latitude=lat,
                longitude=lng,
                step="completed",
            )
            # Auto-save grievance
            session = get_or_create_session(phone, db)
            grievance = save_grievance(session, db)
            return (
                "✅ Your complaint has been registered successfully!\n\n"
                f"🆔 Complaint ID : *{grievance.complaint_id}*\n"
                f"📂 Category      : {grievance.category}\n"
                f"📍 Location      : {location_text}\n"
                f"📌 Status         : Pending\n\n"
                "We will resolve your issue soon. Thank you 🙏"
            )

        if not _is_valid_location(text_clean):
            return (
                "❌ That doesn't look like a valid location.\n\n"
                "Please share a recognisable area, city name, or pincode.\n"
                "_(Example: Andheri West, Mumbai — or just your pincode like 400053)_"
            )
        lat, lng = _parse_latlng(text_clean)
        update_session(
            phone, db,
            location=text_clean,
            latitude=lat,
            longitude=lng,
            step="completed",
        )
        # Auto-save grievance
        session = get_or_create_session(phone, db)
        grievance = save_grievance(session, db)
        return (
            "✅ Your complaint has been registered successfully!\n\n"
            f"🆔 Complaint ID : *{grievance.complaint_id}*\n"
            f"📂 Category      : {grievance.category}\n"
            f"📍 Location      : {text_clean}\n"
            f"📌 Status         : Pending\n\n"
            "We will resolve your issue soon. Thank you 🙏"
        )

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
