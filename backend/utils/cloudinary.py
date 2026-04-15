"""
Cloudinary utility: configuration + image upload helper.

Usage:
    from utils.cloudinary import upload_image

    url = upload_image(file_obj, folder="grievances")
"""

import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "docjytgd5"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "129411373286887"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "bHIW9yCCSOM1tXU-N_i-69EZXeg"),
)


def upload_image(file, folder: str = "grievances") -> str:
    """
    Upload a file-like object to Cloudinary and return its secure URL.

    Args:
        file:   A file-like object (e.g. UploadFile.file from FastAPI).
        folder: Cloudinary folder to organise uploads.

    Returns:
        The secure HTTPS URL of the uploaded image.

    Raises:
        RuntimeError: if the upload fails.
    """
    try:
        result = cloudinary.uploader.upload(file, folder=folder)
        return result["secure_url"]
    except Exception as exc:
        raise RuntimeError(f"Cloudinary upload failed: {exc}") from exc
