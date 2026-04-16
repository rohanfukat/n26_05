from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from classifier import analyze_image, classify_text_only, compare_analyses
import asyncio

router = APIRouter(prefix="/examine_image", tags=["Image Examination"])


@router.post("/")
async def examine_image(
    title: str = Form(...),
    description: str = Form(...),
    image: UploadFile = File(...),
):
    """
    Check whether the uploaded image matches the given title and description.
    """
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file")

    combined_text = f"{title}. {description}"

    # Run text classification
    text_result = await classify_text_only(combined_text, combined_text)

    # Run image analysis in executor
    loop = asyncio.get_event_loop()
    image_result = await loop.run_in_executor(None, analyze_image, image_bytes)

    if image_result is None:
        raise HTTPException(status_code=422, detail="Image analysis failed")

    comparison = compare_analyses(text_result, image_result)

    return {
        "title": title,
        "description": description,
        "text_analysis": text_result,
        "image_analysis": image_result,
        "comparison": comparison,
        "is_matching": comparison["match_status"] == "matched",
    }
