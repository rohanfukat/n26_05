import os
import json
import asyncio
import io
import time
import uuid
import numpy as np
from datetime import datetime, timedelta
from PIL import Image
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ================= TIMEOUTS =================
# Adjusted for Gemini 2.5 Flash Lite (2/10 RPM, 354/250K TPM)
API_TIMEOUT = 25  # seconds - higher due to potential queuing at 2 RPM
IMAGE_TIMEOUT = 30  # seconds

# ================= MODELS =================
# Gemini 2.5 Flash Lite - Better rate limits: 2/10 RPM, 354/250K TPM
MODEL_NAME = "models/gemini-3.1-flash-lite-preview"
EMBED_MODEL = "models/gemini-embedding-001"

TEXT_MODEL = genai.GenerativeModel(
    model_name=MODEL_NAME,
    generation_config={
        "temperature": 0.1,
        "max_output_tokens": 600
    }
)

VISION_MODEL = genai.GenerativeModel(
    model_name=MODEL_NAME,
    generation_config={
        "temperature": 0.1,
        "max_output_tokens": 800
    }
)

# ================= MEMORY =================

complaint_memory = []
MAX_MEMORY = 300
TIME_WINDOW_HOURS = 24

# Duplicate detection threshold (0-1 scale)
DUPLICATE_THRESHOLD = 0.8
DUPLICATE_WARNING_THRESHOLD = 0.65

# ================= CONSTANTS =================

DEPARTMENTS = [
    "BMC - Water Supply Department",
    "BMC - Roads & Infrastructure (PWD)",
    "BMC - Solid Waste Management",
    "BMC - Storm Water Drains",
    "BMC - Public Health Department",
    "Mumbai Police",
    "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "Mumbai Fire Brigade",
    "Mumbai Metropolitan Region Development Authority (MMRDA)",
    "Slum Rehabilitation Authority (SRA)",
    "Maharashtra Pollution Control Board (MPCB)",
    "General Administration (BMC)"
]

DEPARTMENT_MAP = {
    "water": "BMC - Water Supply Department",
    "pani": "BMC - Water Supply Department",
    "pipeline": "BMC - Water Supply Department",
    "leakage": "BMC - Water Supply Department",
    "shortage": "BMC - Water Supply Department",
    "road": "BMC - Roads & Infrastructure (PWD)",
    "pothole": "BMC - Roads & Infrastructure (PWD)",
    "path": "BMC - Roads & Infrastructure (PWD)",
    "footpath": "BMC - Roads & Infrastructure (PWD)",
    "broken": "BMC - Roads & Infrastructure (PWD)",
    "garbage": "BMC - Solid Waste Management",
    "waste": "BMC - Solid Waste Management",
    "kachra": "BMC - Solid Waste Management",
    "dumping": "BMC - Solid Waste Management",
    "sewage": "BMC - Storm Water Drains",
    "drainage": "BMC - Storm Water Drains",
    "drain": "BMC - Storm Water Drains",
    "flooding": "BMC - Storm Water Drains",
    "water logging": "BMC - Storm Water Drains",
    "hygiene": "BMC - Public Health Department",
    "sanitation": "BMC - Public Health Department",
    "mosquito": "BMC - Public Health Department",
    "toilet": "BMC - Public Health Department",
    "noise": "Mumbai Police",
    "honking": "Mumbai Police",
    "crime": "Mumbai Police",
    "accident": "Mumbai Police",
    "traffic": "Mumbai Police",
    "illegal": "Mumbai Police",
    "stray": "Mumbai Police",
    "electricity": "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "light": "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "streetlight": "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "wire": "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "power": "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "fire": "Mumbai Fire Brigade",
    "blast": "Mumbai Fire Brigade",
    "explosion": "Mumbai Fire Brigade",
    "gas leak": "Mumbai Fire Brigade",
    "smoke": "Mumbai Fire Brigade",
    "emergency": "Mumbai Fire Brigade",
    "construction": "MMRDA",
    "debris": "MMRDA",
    "metro": "MMRDA",
    "slum": "Slum Rehabilitation Authority (SRA)",
    "pollution": "Maharashtra Pollution Control Board (MPCB)",
}

# ================= HELPERS =================

EMERGENCY_KEYWORDS = [
    "blast", "explosion", "fire", "gas leak",
    "accident", "injured", "collapse"
]


def detect_emergency(text: str):
    return any(word in text.lower() for word in EMERGENCY_KEYWORDS)


def assign_department(raw_text: str, category: str = "") -> str:
    """Assign department based on keyword matching against text and category."""
    department = "General Administration (BMC)"
    text_lower = raw_text.lower()
    keywords_sorted = sorted(DEPARTMENT_MAP.keys(), key=len, reverse=True)
    for keyword in keywords_sorted:
        if keyword in text_lower:
            return DEPARTMENT_MAP[keyword]
    if category:
        category_lower = category.lower()
        for keyword in keywords_sorted:
            if keyword in category_lower:
                return DEPARTMENT_MAP[keyword]
    return department


def cosine_similarity(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def get_embedding(text: str):
    res = genai.embed_content(model=EMBED_MODEL, content=text)
    return np.array(res["embedding"])


def check_duplicate(new_embedding, category, location, threshold=DUPLICATE_THRESHOLD):
    """Check if complaint is duplicate using embedding similarity."""
    best_score = 0
    best_id = None
    for c in complaint_memory:
        if c["category"] != category:
            continue
        if location and c["location"] and location != c["location"]:
            continue
        score = cosine_similarity(new_embedding, c["embedding"])
        if score > best_score:
            best_score = score
            best_id = c["id"]
    return best_score >= threshold, best_score, best_id


def extract_location(text: str):
    """Extract Mumbai location from text."""
    locations = {
        "colaba", "fort", "worli", "parel", "lower parel", "byculla",
        "dadar", "dadar west", "dadar east", "matunga", "matunga west",
        "mahim", "bandra", "bandra west", "bandra east",
        "andheri", "andheri east", "andheri west", "vile parle", "vile parle east",
        "malad", "malad west", "malad east", "borivali", "borivali west", "borivali east",
        "kandivali", "kandivali west", "kandivali east",
        "chembur", "ghatkopar", "ghatkopar east", "ghatkopar west",
        "powai", "vikhroli", "kanjurmarg",
        "kurla", "kurla west", "kurla east", "sion", "govandi",
        "juhu", "jogeshwari", "jogeshwari east",
        "dahisar", "airoli", "thane",
        "nerul", "vashi", "panvel", "kalamboli", "ulhasnagar",
        "virar", "virar east", "virar west",
        "mira", "mira road", "mira bhayandar",
        "kalyan", "kalyan east", "bhiwandi", "ambernath",
        "santacruz", "santacruz east"
    }
    text_lower = text.lower()
    for loc in sorted(locations, key=len, reverse=True):
        if loc in text_lower:
            return loc
    return ""


def cleanup_memory():
    global complaint_memory
    now = datetime.utcnow()
    complaint_memory = [
        c for c in complaint_memory
        if now - c["timestamp"] < timedelta(hours=TIME_WINDOW_HOURS)
    ][-MAX_MEMORY:]


# 🔥 SUPER ROBUST JSON PARSER
def extract_json(text: str):
    if not text:
        return None

    text = text.replace("```json", "").replace("```", "").strip()

    start = text.find("{")
    if start == -1:
        return None

    text = text[start:]

    # Try closing braces from end backwards (max 5 attempts)
    for i in range(len(text), max(len(text) - 100, 0), -1):
        try:
            return json.loads(text[:i])
        except:
            continue

    return None


async def call_model(prompt):
    try:
        loop = asyncio.get_event_loop()
        response = await asyncio.wait_for(
            loop.run_in_executor(None, TEXT_MODEL.generate_content, prompt),
            timeout=API_TIMEOUT
        )
        return response.text
    except asyncio.TimeoutError:
        raise Exception(f"API timeout after {API_TIMEOUT}s")
    except Exception as e:
        raise Exception(f"API error: {str(e)}")


# ================= TEXT =================

async def classify_text_only(cleaned_text: str, raw_text: str):

    if detect_emergency(raw_text):
        return {
            "category": "emergency",
            "severity": "critical",
            "priority_score": 10,
            "tags": ["emergency"],
            "department": "Mumbai Fire Brigade",
            "processed_by": "emergency_override"
        }

    prompt = f"""
    Return ONLY JSON:

    {{
      "category": "",
      "severity": "",
      "priority_score": 0,
      "tags": []
    }}

    IMPORTANT: "category" MUST be exactly one of these values: Water, Road, Garbage, Electricity, Traffic, Drainage, Infrastructure, Environment, General.
    Do NOT use any other category. Pick the closest match from the list above.

    Complaint: "{cleaned_text}"
    """

    try:
        raw = await call_model(prompt)
        print("TEXT RAW:", raw)

        data = extract_json(raw)

        if not data:
            raise Exception("Parse failed")

        category = data.get("category", "other")

        # Department assignment via keyword matching
        department = assign_department(raw_text, category)

        # Duplicate detection
        embedding = get_embedding(cleaned_text)
        location = extract_location(raw_text)

        is_dup, score, match_id = check_duplicate(embedding, category, location)

        if not is_dup:
            complaint_memory.append({
                "id": str(uuid.uuid4()),
                "embedding": embedding,
                "category": category,
                "location": location,
                "timestamp": datetime.utcnow()
            })

        cleanup_memory()

        data.update({
            "department": department,
            "is_duplicate_likely": is_dup,
            "duplicate_confidence": round(score, 2),
            "matched_complaint_id": match_id,
            "processed_by": "gemini-text"
        })

        return data

    except:
        return {
            "category": "other",
            "severity": "medium",
            "priority_score": 5,
            "tags": [],
            "department": "General Administration (BMC)",
            "processed_by": "fallback"
        }


# ================= IMAGE =================

def preprocess_image(file_bytes: bytes):
    try:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        img.thumbnail((1024, 1024))

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        return buf.getvalue()
    except:
        return None


def analyze_image(file_bytes: bytes):
    try:
        processed = preprocess_image(file_bytes)
        if not processed:
            return None

        response = VISION_MODEL.generate_content([
            {"mime_type": "image/jpeg", "data": processed},
            """
            Return ONLY JSON:

            {
              "category": "",
              "severity": "",
              "tags": [],
              "is_emergency": false
            }
            """
        ])

        print("IMAGE RAW:", response.text)

        return extract_json(response.text)

    except Exception as e:
        print("IMAGE ERROR:", str(e))
        return None


# ================= COMPARISON =================

def compare_analyses(text_result, image_result):

    score = 0
    aligned_fields = []
    conflicts = []

    # CATEGORY (80) — fuzzy match: exact, substring, or keyword overlap
    text_cat = (text_result.get("category") or "").strip().lower()
    image_cat = (image_result.get("category") or "").strip().lower()

    # Collect tag sets early (needed for cross-check below)
    text_tags = set(t.lower() for t in text_result.get("tags", []))
    image_tags = set(t.lower() for t in image_result.get("tags", []))

    if text_cat and image_cat:
        if text_cat == image_cat:
            score += 80
            aligned_fields.append("category")
        elif text_cat in image_cat or image_cat in text_cat:
            # substring match (e.g. "tree" in "tree cutting")
            score += 70
            aligned_fields.append("category (partial)")
        else:
            # keyword overlap between category words
            text_words = set(text_cat.replace("-", " ").replace("_", " ").split())
            image_words = set(image_cat.replace("-", " ").replace("_", " ").split())
            common = text_words & image_words
            if common:
                score += 60
                aligned_fields.append("category (keyword overlap)")
            else:
                # Cross-check: does the image category appear in text tags or vice versa?
                image_cat_words = image_words
                text_cat_words = text_words
                # Check if image category (or its words) overlap with text tags
                image_cat_in_text_tags = any(
                    w in tag for w in image_cat_words for tag in text_tags
                ) or any(
                    image_cat in tag or tag in image_cat for tag in text_tags
                )
                # Check if text category (or its words) overlap with image tags
                text_cat_in_image_tags = any(
                    w in tag for w in text_cat_words for tag in image_tags
                ) or any(
                    text_cat in tag or tag in text_cat for tag in image_tags
                )
                if image_cat_in_text_tags or text_cat_in_image_tags:
                    score += 50
                    aligned_fields.append("category (cross-tag match)")
                else:
                    conflicts.append("category mismatch")
    else:
        conflicts.append("category mismatch")

    # SEVERITY (10)
    if text_result.get("severity") == image_result.get("severity"):
        score += 10
        aligned_fields.append("severity")

    # TAGS (10) — already computed above, reuse text_tags & image_tags
    if text_tags & image_tags:
        score += 10
        aligned_fields.append("tags")

    if score >= 50:
        status = "matched"
    elif score >= 30:
        status = "unclear"
    else:
        status = "mismatched"

    return {
        "match_status": status,
        "match_confidence": score,
        "matching_reason": f"{len(aligned_fields)} fields aligned",
        "aligned_fields": aligned_fields,
        "conflict_details": conflicts
    }


# ================= PIPELINE =================

async def analyze_and_compare(raw_text, cleaned_text, image_bytes):

    text_result = await classify_text_only(cleaned_text, raw_text)
    
    # Run image analysis in thread executor
    loop = asyncio.get_event_loop()
    image_result = await loop.run_in_executor(None, analyze_image, image_bytes)

    if image_result is None:
        return {
            "error": "Image analysis failed",
            "debug": "Check IMAGE RAW logs",
            "text_result": text_result
        }

    comparison = compare_analyses(text_result, image_result)

    return {
        "text_analysis": text_result,
        "image_analysis": image_result,
        "comparison": comparison
    }


# ================= BATCH PROCESSING =================

async def batch_classify_text(complaints: list):
    """
    Process multiple complaints efficiently.
    complaints: list of {"text": "...", "id": "..."} objects
    """
    results = []
    
    for complaint in complaints:
        try:
            text = complaint.get("text", "").strip()
            complaint_id = complaint.get("id", None)
            
            if not text:
                results.append({
                    "id": complaint_id,
                    "status": "error",
                    "detail": "Text is empty"
                })
                continue
            
            result = await classify_text_only(text, text)
            result["id"] = complaint_id
            result["status"] = "success"
            results.append(result)
            
        except Exception as e:
            results.append({
                "id": complaint.get("id"),
                "status": "error",
                "detail": str(e)
            })
    
    return results


async def batch_analyze_and_compare_images(items: list):
    """
    Process multiple text+image pairs efficiently.
    items: list of {"text": "...", "image_bytes": b"...", "id": "..."} objects
    """
    results = []
    
    for item in items:
        try:
            text = item.get("text", "").strip()
            image_bytes = item.get("image_bytes")
            item_id = item.get("id", None)
            
            if not text:
                results.append({
                    "id": item_id,
                    "status": "error",
                    "detail": "Text is empty"
                })
                continue
            
            if not image_bytes:
                results.append({
                    "id": item_id,
                    "status": "error",
                    "detail": "Image is empty"
                })
                continue
            
            result = await analyze_and_compare(text, text, image_bytes)
            result["id"] = item_id
            result["status"] = "success"
            results.append(result)
            
        except Exception as e:
            results.append({
                "id": item.get("id"),
                "status": "error",
                "detail": str(e)
            })
    
    return results


# ================= BACKWARD =================

async def classify_complaint(cleaned_text, raw_text, image_bytes=None):
    return await classify_text_only(cleaned_text, raw_text)