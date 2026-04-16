"""
Router: /grievances

Endpoints:
  POST   /grievances              → Submit a new grievance (authenticated user, via API/frontend)
  GET    /grievances              → Retrieve all grievances (admin only)
  PATCH  /grievances/{id}         → Update a grievance (admin only)
  GET    /grievances/map-points   → All grievances with lat/lng for map rendering (admin)
  POST   /grievances/cluster      → AI-cluster nearby grievances using DBSCAN (admin)
"""

import uuid
import math
from typing import List, Optional, Dict
from collections import Counter, defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Header, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, func as sa_func, extract
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
#  Pydantic models for clustering
# ─────────────────────────────────────────

class MapPointResponse(BaseModel):
    id: str
    complaint_id: Optional[str] = None
    issue: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    latitude: float
    longitude: float
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    source: Optional[str] = None
    before_photo: Optional[str] = None
    created_at: Optional[str] = None


class ClusterRequest(BaseModel):
    eps_km: float = 1.5   # radius in km for DBSCAN neighbourhood
    min_samples: int = 2  # minimum points to form a cluster


class ClusterItem(BaseModel):
    cluster_id: int
    center_lat: float
    center_lng: float
    radius_m: float          # radius of the cluster circle in metres
    count: int
    complaints: List[MapPointResponse]


class ClusterResponse(BaseModel):
    clusters: List[ClusterItem]
    noise: List[MapPointResponse]   # points that don't belong to any cluster


# ─────────────────────────────────────────
#  GET /grievances/map-points (admin)
# ─────────────────────────────────────────

@router.get(
    "/map-points",
    response_model=List[MapPointResponse],
    summary="Get all grievances that have lat/lng for map rendering",
)
def get_map_points(
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    token_data = _get_token_payload(authorization)
    _require_admin(token_data)

    rows = (
        db.query(Grievance)
        .filter(Grievance.latitude.isnot(None), Grievance.longitude.isnot(None))
        .order_by(Grievance.created_at.desc())
        .all()
    )

    return [
        MapPointResponse(
            id=str(g.id),
            complaint_id=g.complaint_id,
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
            created_at=str(g.created_at) if g.created_at else None,
        )
        for g in rows
    ]


# ─────────────────────────────────────────
#  GET /grievances/logs (admin)
# ─────────────────────────────────────────

@router.get(
    "/logs",
    response_model=List[GrievanceResponse],
    summary="Get grievances submitted via API or WhatsApp (admin only)",
)
def get_grievance_logs(
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    """
    Returns all grievances where `source` is 'api' or 'whatsapp'.
    These are the AI-categorised complaint logs for the admin dashboard.
    """
    token_data = _get_token_payload(authorization)
    _require_admin(token_data)

    rows = (
        db.query(Grievance)
        .filter(
            or_(
                Grievance.source == "api",
                Grievance.source == "whatsapp",
            )
        )
        .order_by(Grievance.created_at.desc())
        .all()
    )

    return [_to_response(g) for g in rows]


# ─────────────────────────────────────────
#  GET /grievances/stats (admin)
# ─────────────────────────────────────────

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@router.get(
    "/stats",
    summary="Dashboard analytics computed from real grievance data (admin only)",
)
def get_dashboard_stats(
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    """
    Returns a rich analytics payload built from the grievances table:
      - totalComplaints, resolvedComplaints, inProgressComplaints, pendingComplaints, criticalComplaints
      - byStatus  { resolved, in_progress, pending }
      - monthlyData  [{ month, complaints, resolved }]   (last 12 calendar months)
      - categoryData [{ category, count }]                (top categories)
      - avgResolutionDays                                 (avg time to resolve)
      - sourceBreakdown { api, whatsapp }
    """
    token_data = _get_token_payload(authorization)
    _require_admin(token_data)

    all_grievances = db.query(Grievance).all()

    total = len(all_grievances)
    resolved = sum(1 for g in all_grievances if g.status == "resolved")
    in_progress = sum(1 for g in all_grievances if g.status == "in_progress")
    pending = sum(1 for g in all_grievances if g.status == "pending")
    critical = sum(1 for g in all_grievances if g.priority == "critical")

    # ── Monthly data (group by year-month) ────────────────────────────────────
    now = datetime.utcnow()
    monthly_map: Dict[str, Dict] = {}
    for i in range(11, -1, -1):
        # walk back 11 months to current month
        m = now.month - i
        y = now.year
        while m <= 0:
            m += 12
            y -= 1
        key = f"{y}-{m:02d}"
        monthly_map[key] = {"month": MONTH_NAMES[m - 1], "complaints": 0, "resolved": 0}

    for g in all_grievances:
        if g.created_at:
            key = f"{g.created_at.year}-{g.created_at.month:02d}"
            if key in monthly_map:
                monthly_map[key]["complaints"] += 1
                if g.status == "resolved":
                    monthly_map[key]["resolved"] += 1

    monthly_data = list(monthly_map.values())

    # ── Category breakdown ────────────────────────────────────────────────────
    cat_counter: Counter = Counter()
    for g in all_grievances:
        cat_counter[g.category or "General"] += 1
    category_data = [
        {"category": cat, "count": cnt}
        for cat, cnt in cat_counter.most_common(10)
    ]

    # ── Avg resolution time (days) ────────────────────────────────────────────
    resolution_days = []
    for g in all_grievances:
        if g.status == "resolved" and g.created_at and g.updated_at:
            delta = (g.updated_at - g.created_at).total_seconds() / 86400
            if delta >= 0:
                resolution_days.append(delta)
    avg_resolution = round(sum(resolution_days) / len(resolution_days), 1) if resolution_days else 0

    # ── Source breakdown ──────────────────────────────────────────────────────
    src_counter: Counter = Counter()
    for g in all_grievances:
        src_counter[g.source or "unknown"] += 1

    # ── Priority breakdown ────────────────────────────────────────────────────
    pri_counter: Counter = Counter()
    for g in all_grievances:
        pri_counter[g.priority or "medium"] += 1

    return {
        "totalComplaints": total,
        "resolvedComplaints": resolved,
        "inProgressComplaints": in_progress,
        "pendingComplaints": pending,
        "criticalComplaints": critical,
        "byStatus": {
            "resolved": resolved,
            "in_progress": in_progress,
            "pending": pending,
        },
        "monthlyData": monthly_data,
        "categoryData": category_data,
        "avgResolutionDays": avg_resolution,
        "sourceBreakdown": dict(src_counter),
        "priorityBreakdown": dict(pri_counter),
    }


# ─────────────────────────────────────────
#  POST /grievances/cluster (admin)
# ─────────────────────────────────────────

def _haversine(lat1, lon1, lat2, lon2):
    """Return distance in km between two lat/lng points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.post(
    "/cluster",
    response_model=ClusterResponse,
    summary="AI-cluster nearby grievances using DBSCAN",
)
def cluster_grievances(
    body: ClusterRequest,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    """
    Runs DBSCAN clustering on all grievances that have coordinates.
    - `eps_km`: neighbourhood radius in kilometres (default 1.5 km).
    - `min_samples`: minimum points to form a cluster (default 2).

    Returns clusters (with centre, radius, and contained complaints) and
    noise points that don't belong to any cluster.
    """
    token_data = _get_token_payload(authorization)
    _require_admin(token_data)

    rows = (
        db.query(Grievance)
        .filter(Grievance.latitude.isnot(None), Grievance.longitude.isnot(None))
        .all()
    )

    if not rows:
        return ClusterResponse(clusters=[], noise=[])

    # ── Build coordinate array & run DBSCAN ──────────────────────────────────
    import numpy as np
    from sklearn.cluster import DBSCAN

    coords = np.array([[g.latitude, g.longitude] for g in rows])

    # DBSCAN with haversine metric expects radians
    coords_rad = np.radians(coords)
    eps_rad = body.eps_km / 6371.0  # convert km → radians

    db_scan = DBSCAN(
        eps=eps_rad,
        min_samples=body.min_samples,
        metric="haversine",
    )
    labels = db_scan.fit_predict(coords_rad)

    # ── Organise results ─────────────────────────────────────────────────────
    def _to_map_point(g: Grievance) -> MapPointResponse:
        return MapPointResponse(
            id=str(g.id),
            complaint_id=g.complaint_id,
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
            created_at=str(g.created_at) if g.created_at else None,
        )

    cluster_map: dict = {}   # label → list of (grievance, idx)
    noise_points: list = []

    for idx, label in enumerate(labels):
        if label == -1:
            noise_points.append(_to_map_point(rows[idx]))
        else:
            cluster_map.setdefault(int(label), []).append((rows[idx], idx))

    clusters: list = []
    for label, members in cluster_map.items():
        member_coords = [(g.latitude, g.longitude) for g, _ in members]
        center_lat = sum(c[0] for c in member_coords) / len(member_coords)
        center_lng = sum(c[1] for c in member_coords) / len(member_coords)

        # radius = max distance from centre to any member (in metres) + 200m buffer
        radius_m = max(
            _haversine(center_lat, center_lng, c[0], c[1]) * 1000
            for c in member_coords
        )
        radius_m = max(radius_m + 200, 400)  # at least 400m so the circle is visible

        clusters.append(
            ClusterItem(
                cluster_id=label,
                center_lat=center_lat,
                center_lng=center_lng,
                radius_m=radius_m,
                count=len(members),
                complaints=[_to_map_point(g) for g, _ in members],
            )
        )

    return ClusterResponse(clusters=clusters, noise=noise_points)


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
    latitude: Optional[str] = Form(None),
    longitude: Optional[str] = Form(None),
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

    # ── Convert string coordinates to float ────────────────────────────────────
    latitude_float: Optional[float] = None
    longitude_float: Optional[float] = None
    
    if latitude:
        try:
            latitude_float = float(latitude)
        except (ValueError, TypeError):
            pass
    
    if longitude:
        try:
            longitude_float = float(longitude)
        except (ValueError, TypeError):
            pass

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
        latitude=latitude_float,
        longitude=longitude_float,
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
#  GET /grievances/user/stats  –  User stats
# ─────────────────────────────────────────

@router.get(
    "/user/stats",
    summary="Get user complaint statistics",
)
def get_user_stats(
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    """
    Returns complaint statistics for the authenticated user.

    - Requires a valid JWT in the Authorization header.
    - Returns: {
        "total_complaints": int,
        "resolved": int,
        "in_progress": int,
        "pending": int,
        "complaints": [GrievanceResponse]
      }
    """
    token_data = _get_token_payload(authorization)
    user_id: str = token_data.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing the user identifier (sub).",
        )

    # Get all grievances for this user
    user_grievances = (
        db.query(Grievance)
        .filter(Grievance.identity == user_id)
        .order_by(Grievance.created_at.desc())
        .all()
    )

    # Calculate statistics
    total = len(user_grievances)
    resolved_count = sum(1 for g in user_grievances if g.status == "resolved")
    in_progress_count = sum(1 for g in user_grievances if g.status == "in_progress")
    pending_count = sum(1 for g in user_grievances if g.status == "pending")

    return {
        "total_complaints": total,
        "resolved": resolved_count,
        "in_progress": in_progress_count,
        "pending": pending_count,
        "complaints": [_to_response(g) for g in user_grievances],
    }


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
