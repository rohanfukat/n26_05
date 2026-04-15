import os
import json
import asyncio
import io
import time
from PIL import Image
import google.generativeai as genai

genai.configure(api_key="AIzaSyDCJJqv2q_-YZrMvyffeZFxmURt73l5mn8")

# ================= TIMEOUTS =================
# Adjusted for Gemini 2.5 Flash Lite (2/10 RPM, 354/250K TPM)
API_TIMEOUT = 25  # seconds - higher due to potential queuing at 2 RPM
IMAGE_TIMEOUT = 30  # seconds

# ================= MODELS =================
# Gemini 2.5 Flash Lite - Better rate limits: 2/10 RPM, 354/250K TPM
MODEL_NAME = "gemini-2.5-flash-lite"

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

# ================= HELPERS =================

EMERGENCY_KEYWORDS = [
    "blast", "explosion", "fire", "gas leak",
    "accident", "injured", "collapse"
]


def detect_emergency(text: str):
    return any(word in text.lower() for word in EMERGENCY_KEYWORDS)


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

    Complaint: "{cleaned_text}"
    """

    try:
        raw = await call_model(prompt)
        print("TEXT RAW:", raw)

        data = extract_json(raw)

        if not data:
            raise Exception("Parse failed")

        data["processed_by"] = "gemini-text"
        return data

    except:
        return {
            "category": "other",
            "severity": "medium",
            "priority_score": 5,
            "tags": [],
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

    # CATEGORY (80)
    if text_result.get("category") == image_result.get("category"):
        score += 80
        aligned_fields.append("category")
    else:
        conflicts.append("category mismatch")

    # SEVERITY (10)
    if text_result.get("severity") == image_result.get("severity"):
        score += 10
        aligned_fields.append("severity")

    # TAGS (10)
    text_tags = set(text_result.get("tags", []))
    image_tags = set(image_result.get("tags", []))

    if text_tags & image_tags:
        score += 10
        aligned_fields.append("tags")

    if score >= 70:
        status = "matched"
    elif score >= 50:
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