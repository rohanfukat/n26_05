from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import uvicorn
import time
import asyncio

from classifier import classify_text_only, analyze_image, analyze_and_compare, batch_classify_text, batch_analyze_and_compare_images
from cleaner import clean_text

app = FastAPI()

# Request timeout in seconds
# Adjusted for Gemini 2.5 Flash Lite (2/10 RPM limit)
REQUEST_TIMEOUT = 120  # 2 min for individual requests


@app.post("/classify-text")
async def classify_text(text: str = Form(...)):
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    start = time.time()

    try:
        cleaned = clean_text(text)
        result = await asyncio.wait_for(
            classify_text_only(cleaned, text),
            timeout=REQUEST_TIMEOUT
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Request timeout - API took too long")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    result["processing_time_ms"] = round((time.time() - start) * 1000, 2)
    result["status"] = "classified"

    return result


@app.post("/compare-image-text")
async def compare_image_text(
    text: str = Form(...),
    image: UploadFile = File(...)
):
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    image_bytes = await image.read()

    if len(image_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large")

    start = time.time()

    try:
        cleaned = clean_text(text)
        loop = asyncio.get_event_loop()
        
        # Run both in parallel with timeout
        result = await asyncio.wait_for(
            analyze_and_compare(text, cleaned, image_bytes),
            timeout=REQUEST_TIMEOUT
        )
        
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Request timeout - processing took too long")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    result["processing_time_ms"] = round((time.time() - start) * 1000, 2)

    return result


@app.post("/batch-classify-text")
async def batch_classify_endpoint(data: dict):
    """
    Batch process multiple text items efficiently.
    Expected: {"complaints": [{"text": "...", "id": "..."}, ...]}
    
    Benefits: Saves API calls (10/15 RPM quota), stays within rate limits.
    """
    if "complaints" not in data or not isinstance(data["complaints"], list):
        raise HTTPException(status_code=400, detail="Expected 'complaints' list")
    
    complaints = data["complaints"]
    if len(complaints) > 20:
        raise HTTPException(status_code=400, detail="Max 20 items per batch (2/10 RPM limit)")
    
    if len(complaints) == 0:
        raise HTTPException(status_code=400, detail="At least 1 complaint required")
    
    start = time.time()
    
    try:
        # Clean texts first
        for complaint in complaints:
            complaint["text"] = clean_text(complaint.get("text", ""))
        
        results = await asyncio.wait_for(
            batch_classify_text(complaints),
            timeout=REQUEST_TIMEOUT * 3  # Longer for batch
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Batch processing timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
    return {
        "total_items": len(complaints),
        "successful": len([r for r in results if r.get("status") == "success"]),
        "failed": len([r for r in results if r.get("status") == "error"]),
        "results": results,
        "processing_time_ms": round((time.time() - start) * 1000, 2)
    }


@app.post("/batch-compare-image-text")
async def batch_compare_endpoint(data: dict):
    """
    Batch process multiple text+image pairs efficiently.
    Expected: {"items": [{"text": "...", "image_base64": "...", "id": "..."}, ...]}
    
    Benefits: Saves API calls, efficiently uses 10/15 RPM quota.
    """
    import base64
    
    if "items" not in data or not isinstance(data["items"], list):
        raise HTTPException(status_code=400, detail="Expected 'items' list")
    
    items = data["items"]
    if len(items) > 15:
        raise HTTPException(status_code=400, detail="Max 15 items per batch (2/10 RPM limit)")
    
    if len(items) == 0:
        raise HTTPException(status_code=400, detail="At least 1 item required")
    
    # Convert base64 images to bytes
    for item in items:
        try:
            image_b64 = item.get("image_base64", "")
            if image_b64:
                item["image_bytes"] = base64.b64decode(image_b64)
            else:
                item["image_bytes"] = None
        except Exception as e:
            item["image_bytes"] = None
    
    start = time.time()
    
    try:
        for item in items:
            item["text"] = clean_text(item.get("text", ""))
        
        results = await asyncio.wait_for(
            batch_analyze_and_compare_images(items),
            timeout=REQUEST_TIMEOUT * 4  # Longer for batch with images
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Batch processing timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
    return {
        "total_items": len(items),
        "successful": len([r for r in results if r.get("status") == "success"]),
        "failed": len([r for r in results if r.get("status") == "error"]),
        "results": results,
        "processing_time_ms": round((time.time() - start) * 1000, 2)
    }


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)