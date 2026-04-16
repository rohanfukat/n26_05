"""
Utility: keyword-based auto-classifier for grievance category, priority, and department.
"""


# ── Department map ─────────────────────────────────────────────────────────────
DEPARTMENT_MAP: dict[str, str] = {
    "water": "BMC - Water Supply Department",
    "pani": "BMC - Water Supply Department",
    "pipeline": "BMC - Water Supply Department",
    "leakage": "BMC - Water Supply Department",
    "shortage": "BMC - Water Supply Department",
    "road": "BMC - Roads & Infrastructure (PWD)",
    "pothole": "BMC - Roads & Infrastructure (PWD)",
    "footpath": "BMC - Roads & Infrastructure (PWD)",
    "bridge": "BMC - Roads & Infrastructure (PWD)",
    "garbage": "BMC - Solid Waste Management",
    "waste": "BMC - Solid Waste Management",
    "dustbin": "BMC - Solid Waste Management",
    "sewage": "BMC - Storm Water Drains",
    "drainage": "BMC - Storm Water Drains",
    "drain": "BMC - Storm Water Drains",
    "flood": "BMC - Storm Water Drains",
    "hygiene": "BMC - Public Health Department",
    "sanitation": "BMC - Public Health Department",
    "toilet": "BMC - Public Health Department",
    "hospital": "BMC - Public Health Department",
    "health": "BMC - Public Health Department",
    "noise": "Mumbai Police",
    "crime": "Mumbai Police",
    "accident": "Mumbai Police",
    "traffic": "Mumbai Police",
    "illegal": "Mumbai Police",
    "electricity": "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "power": "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "light": "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "electric": "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "wire": "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "fire": "Mumbai Fire Brigade",
    "emergency": "Mumbai Fire Brigade",
    "gas leak": "Mumbai Fire Brigade",
    "explosion": "Mumbai Fire Brigade",
    "pollution": "Maharashtra Pollution Control Board (MPCB)",
    "construction": "Mumbai Metropolitan Region Development Authority (MMRDA)",
    "slum": "Slum Rehabilitation Authority (SRA)",
}


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


def classify_department(text: str, category: str = "") -> str:
    """
    Return the best-matching department using keyword matching.
    Falls back to 'General Administration (BMC)'.
    """
    lowered = text.lower()
    keywords_sorted = sorted(DEPARTMENT_MAP.keys(), key=len, reverse=True)
    for keyword in keywords_sorted:
        if keyword in lowered:
            return DEPARTMENT_MAP[keyword]
    if category:
        cat_lower = category.lower()
        for keyword in keywords_sorted:
            if keyword in cat_lower:
                return DEPARTMENT_MAP[keyword]
    return "General Administration (BMC)"


def classify_grievance(issue: str, description: str) -> tuple[str, str, str]:
    """
    Classify category, priority, and department from the combined issue + description text.

    Returns:
        (category, priority, dept_allocated)
    """
    combined = f"{issue} {description}"
    category = classify_category(combined)
    priority = classify_priority(combined)
    dept_allocated = classify_department(combined, category)
    return category, priority, dept_allocated
