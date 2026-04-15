"""
Utility: keyword-based auto-classifier for grievance category and priority.
"""


# ── Category keyword map ───────────────────────────────────────────────────────
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "Water": ["water", "pipe", "leak", "flood", "drainage", "sewage", "tap", "supply"],
    "Road": ["road", "pothole", "street", "highway", "footpath", "pavement", "bridge"],
    "Electricity": ["electricity", "power", "light", "electric", "outage", "wire", "voltage", "transformer"],
    "Sanitation": ["garbage", "waste", "dustbin", "clean", "hygiene", "toilet", "sewage"],
    "Health": ["hospital", "health", "medicine", "doctor", "clinic", "ambulance"],
    "Education": ["school", "teacher", "college", "education", "student"],
}

# ── Priority keyword map ───────────────────────────────────────────────────────
HIGH_PRIORITY_KEYWORDS: list[str] = [
    "urgent", "emergency", "immediate", "critical", "danger",
    "serious", "asap", "help", "accident", "fire",
]


def classify_category(text: str) -> str:
    """
    Return the best-matching category for the given text using keyword matching.
    Falls back to 'General' if no keywords match.
    """
    lowered = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in lowered for kw in keywords):
            return category
    return "General"


def classify_priority(text: str) -> str:
    """
    Return 'high' if any urgency keyword is found, otherwise 'medium'.
    """
    lowered = text.lower()
    if any(kw in lowered for kw in HIGH_PRIORITY_KEYWORDS):
        return "high"
    return "medium"


def classify_grievance(issue: str, description: str) -> tuple[str, str]:
    """
    Classify both category and priority from the combined issue + description text.

    Returns:
        (category, priority)
    """
    combined = f"{issue} {description}"
    category = classify_category(combined)
    priority = classify_priority(combined)
    return category, priority
