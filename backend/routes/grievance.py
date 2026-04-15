"""
Router: /grievances

Endpoints:
  POST   /grievances          → Submit a new grievance (authenticated user, via API/frontend)
  GET    /grievances          → Retrieve all grievances (admin only)
  PATCH  /grievances/{id}     → Update a grievance (admin only)
"""

import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Header, UploadFile, File, Form
from sqlalchemy.orm import Session
from jose import JWTError

from database import get_db
from models.grievance import Grievance
from models.user import User, UserRole
from models.schemas import GrievanceUpdateRequest, GrievanceResponse
from utils.auth import decode_access_token
from utils.classifier import classify_grievance
from utils.cloudinary import upload_image
from classifier import analyze_and_compare
from cleaner import clean_text

router = APIRouter(prefix="/grievances", tags=["Grievances"])


# ─────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────

def _get_token_payload(authorization: str):
    """
    Parse 'Bearer <token>' header and return the decoded JWT payload dict.
    Raises HTTP 401 on any failure.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Expected: Bearer <token>",
        )
    token = authorization.split(" ", 1)[1]
    try:
        return decode_access_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )


def _require_admin(payload: dict):
    """Raise HTTP 403 if the token role is not 'admin'."""
    if payload.get("role") != UserRole.admin.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )


def _generate_complaint_id() -> str:
    short_id = str(uuid.uuid4()).split("-")[0].upper()
    return f"GRV-{short_id}"


# ─────────────────────────────────────────
#  POST /grievances  –  Create via frontend
# ─────────────────────────────────────────

@router.post(
    "",
    response_model=GrievanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a grievance (authenticated citizen)",
)
async def create_grievance(
    issue: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    category: Optional[str] = Form(None),
    before_photo: Optional[UploadFile] = File(None),
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    """
    Accepts grievance data from the frontend as multipart/form-data.

    - Requires a valid JWT in the `Authorization: Bearer <token>` header.
    - The `identity` column is set to the `user_id` extracted from the token.
    - If `before_photo` file is provided it is uploaded to Cloudinary and the
      resulting URL is stored in the grievances table.
    - `source` is set to `"api"`.
    """
    token_data = _get_token_payload(authorization)
    user_id: str = token_data.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing the user identifier (sub).",
        )

    # ── Upload before_photo to Cloudinary if provided ────────────────────────
    photo_url: Optional[str] = None
    if before_photo is not None:
        # Read bytes first (stream is consumed after first read)
        image_bytes = await before_photo.read()

        # ── AI validation: ensure image aligns with description ───────────────
        combined_text = f"{issue or ''} {description or ''}".strip()
        if combined_text:
            cleaned = clean_text(combined_text)
            ai_result = await analyze_and_compare(combined_text, cleaned, image_bytes)

            comparison = ai_result.get("comparison", {})
            match_status = comparison.get("match_status", "unclear")

            if match_status == "mismatched":
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=(
                        "Our AI isn't able to find similarities between the image "
                        "you uploaded and the description provided. Please upload a "
                        "relevant image or update your description."
                    ),
                )

        # ── Upload validated image to Cloudinary ─────────────────────────────
        try:
            import io
            photo_url = upload_image(io.BytesIO(image_bytes), folder="grievances/before")
        except RuntimeError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=str(exc),
            )

    # ── Auto-classify if category not supplied ────────────────────────────────
    resolved_category = category
    priority = "medium"
    if not resolved_category:
        resolved_category, priority = classify_grievance(
            issue=issue or "",
            description=description or "",
        )

    grievance = Grievance(
        complaint_id=_generate_complaint_id(),
        identity=user_id,
        issue=issue,
        description=description,
        location=location,
        latitude=latitude,
        longitude=longitude,
        before_photo=photo_url,
        category=resolved_category,
        priority=priority,
        status="pending",
        source="api",
    )

    db.add(grievance)
    db.commit()
    db.refresh(grievance)

    return _to_response(grievance)


# ─────────────────────────────────────────
#  GET /grievances  –  List all (admin)
# ─────────────────────────────────────────

@router.get(
    "",
    response_model=List[GrievanceResponse],
    summary="Get all grievances (admin only)",
)
def get_all_grievances(
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    """
    Returns every row in the grievances table.

    - Requires a valid JWT with `role == "admin"`.
    """
    token_data = _get_token_payload(authorization)
    _require_admin(token_data)

    grievances = db.query(Grievance).order_by(Grievance.created_at.desc()).all()
    return [_to_response(g) for g in grievances]


# ─────────────────────────────────────────
#  PATCH /grievances/{id}  –  Update (admin)
# ─────────────────────────────────────────

@router.patch(
    "/{grievance_id}",
    response_model=GrievanceResponse,
    summary="Update a grievance (admin only)",
)
def update_grievance(
    grievance_id: str,
    payload: GrievanceUpdateRequest,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    """
    Partially update a grievance record.

    - Requires a valid JWT with `role == "admin"`.
    - Only fields explicitly provided in the request body are updated.
    - `grievance_id` may be either the UUID `id` or the human-readable `complaint_id`.
    """
    token_data = _get_token_payload(authorization)
    _require_admin(token_data)

    # Support lookup by either UUID id or complaint_id (e.g. "GRV-ABC123")
    grievance = (
        db.query(Grievance).filter(Grievance.complaint_id == grievance_id).first()
        or db.query(Grievance).filter(Grievance.id == grievance_id).first()
    )

    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grievance '{grievance_id}' not found.",
        )

    # Apply only the fields that were actually sent (exclude_unset)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(grievance, field, value)

    db.commit()
    db.refresh(grievance)

    return _to_response(grievance)


# ─────────────────────────────────────────
#  Internal serialiser
# ─────────────────────────────────────────

def _to_response(g: Grievance) -> GrievanceResponse:
    return GrievanceResponse(
        id=str(g.id),
        complaint_id=g.complaint_id,
        identity=g.identity,
        issue=g.issue,
        description=g.description,
        location=g.location,
        latitude=g.latitude,
        longitude=g.longitude,
        category=g.category,
        priority=g.priority,
        status=g.status,
        source=g.source,
        before_photo=g.before_photo,
        after_photo=g.after_photo,
        created_at=str(g.created_at) if g.created_at else None,
        updated_at=str(g.updated_at) if g.updated_at else None,
    )
