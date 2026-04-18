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
from models.grievance import Grievance, DepartmentGrievance
from models.user import User, UserRole
from models.schemas import GrievanceUpdateRequest, GrievanceResponse
from utils.auth import decode_access_token
from services.grievance_service import classify_grievance
from utils.cloudinary import upload_image
from utils.whatsapp import send_whatsapp_message
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

    return [_to_response(g, db) for g in rows]


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
#  POST /grievances/segregate (admin)
#  AI-powered deduplication & grouping
# ─────────────────────────────────────────

class SegregateRequest(BaseModel):
    grievance_ids: List[str]  # list of grievance UUID strings


class ChildGrievance(BaseModel):
    id: str
    complaint_id: Optional[str] = None
    issue: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    source: Optional[str] = None
    created_at: Optional[str] = None
    identity: Optional[str] = None


class ParentGrievance(BaseModel):
    parent_issue: str              # AI-generated representative title
    category: str
    priority: str                  # highest priority among children
    status: str                    # current status
    children: List[ChildGrievance]
    child_ids: List[str]           # convenience list of child UUIDs


class SegregateResponse(BaseModel):
    groups: List[ParentGrievance]


def _priority_rank(p: str) -> int:
    return {"critical": 4, "high": 3, "medium": 2, "low": 1}.get(p or "medium", 0)


@router.post(
    "/segregate",
    response_model=SegregateResponse,
    summary="AI-segregate grievances: deduplicate & group by similarity",
)
def segregate_grievances(
    body: SegregateRequest,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    """
    Takes a list of grievance IDs (e.g. from a cluster), uses Gemini LLM
    to intelligently group similar/duplicate grievances together.
    """
    token_data = _get_token_payload(authorization)
    _require_admin(token_data)

    if not body.grievance_ids:
        return SegregateResponse(groups=[])

    # Get IDs already forwarded to departments — exclude them
    dept_rows = db.query(DepartmentGrievance.child_grievance_ids).all()
    allocated_ids = set()
    for (ids,) in dept_rows:
        if ids:
            allocated_ids.update(ids)

    # Filter out already-allocated IDs
    eligible_ids = [gid for gid in body.grievance_ids if gid not in allocated_ids]
    if not eligible_ids:
        return SegregateResponse(groups=[])

    # Fetch grievances
    rows = (
        db.query(Grievance)
        .filter(Grievance.id.in_(eligible_ids))
        .all()
    )
    if not rows:
        return SegregateResponse(groups=[])

    import json as _json
    import google.generativeai as genai

    # Build a concise list for Gemini
    grievance_list = []
    for idx, g in enumerate(rows):
        grievance_list.append({
            "idx": idx,
            "issue": g.issue or "",
            "description": (g.description or "")[:200],
            "category": g.category or "",
            "location": g.location or "",
        })

    prompt = f"""You are a grievance deduplication AI for a municipal corporation.
Given the following list of citizen grievances, group them by ACTUAL SIMILARITY of the problem described.

RULES:
1. Two grievances should be in the same group ONLY if they describe the SAME type of problem (e.g. two reports of potholes on roads, two reports of garbage overflow).
2. Do NOT group different problems together. "Water Leakage" and "Garbage Overflow" are DIFFERENT groups even if in the same area.
3. "Power Outage" and "Road Damage" are DIFFERENT groups.
4. Within the same problem type (e.g. "Garbage"), if descriptions suggest genuinely different sub-issues (e.g. "garbage not collected for a week" vs "illegal garbage dumping in river"), put them in SEPARATE groups.
5. Each group needs a short representative title (parent_issue) that summarizes the common problem.

Grievances:
{_json.dumps(grievance_list, indent=2)}

Respond with ONLY a JSON array where each element is:
{{"parent_issue": "Short descriptive title", "category": "category name", "member_indices": [list of idx values]}}

Example response:
[
  {{"parent_issue": "Pothole on main road", "category": "Road", "member_indices": [0, 3, 7]}},
  {{"parent_issue": "Garbage overflow near residential area", "category": "Garbage", "member_indices": [1, 4]}},
  {{"parent_issue": "Illegal garbage dumping in drain", "category": "Garbage", "member_indices": [5]}}
]

Return ONLY valid JSON, no markdown, no explanation."""

    try:
        model = genai.GenerativeModel(
            model_name="models/gemini-3.1-flash-lite-preview",
            generation_config={"temperature": 0.1, "max_output_tokens": 2000},
        )
        response = model.generate_content(prompt)
        raw_text = response.text.strip()
        # Strip markdown code fences if present
        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[1] if "\n" in raw_text else raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3].strip()
        ai_groups = _json.loads(raw_text)
    except Exception as e:
        print(f"[Segregate] Gemini call failed: {e}, falling back to category-based grouping")
        # Fallback: group by category
        cat_map = defaultdict(list)
        for idx, g in enumerate(rows):
            cat_map[g.category or "General"].append(idx)
        ai_groups = [
            {"parent_issue": cat, "category": cat, "member_indices": indices}
            for cat, indices in cat_map.items()
        ]

    # Validate and build response
    all_assigned = set()
    result_groups = []

    for grp in ai_groups:
        member_indices = grp.get("member_indices", [])
        # Filter valid indices not already assigned
        valid_indices = [i for i in member_indices if 0 <= i < len(rows) and i not in all_assigned]
        if not valid_indices:
            continue
        all_assigned.update(valid_indices)

        members = [rows[idx] for idx in valid_indices]
        parent_issue = grp.get("parent_issue", members[0].issue or "Untitled")
        category = grp.get("category", members[0].category or "General")

        highest_priority = max(members, key=lambda g: _priority_rank(g.priority))
        priority = highest_priority.priority or "medium"

        statuses = [g.status or "pending" for g in members]
        if "pending" in statuses:
            parent_status = "pending"
        elif "in_progress" in statuses:
            parent_status = "in_progress"
        else:
            parent_status = "resolved"

        children = []
        child_ids = []
        for g in members:
            children.append(ChildGrievance(
                id=str(g.id),
                complaint_id=g.complaint_id,
                issue=g.issue,
                description=g.description,
                location=g.location,
                category=g.category,
                priority=g.priority,
                status=g.status,
                source=g.source,
                created_at=str(g.created_at) if g.created_at else None,
                identity=g.identity,
            ))
            child_ids.append(str(g.id))

        result_groups.append(ParentGrievance(
            parent_issue=parent_issue,
            category=category,
            priority=priority,
            status=parent_status,
            children=children,
            child_ids=child_ids,
        ))

    # Add any unassigned grievances as individual groups
    for idx in range(len(rows)):
        if idx not in all_assigned:
            g = rows[idx]
            result_groups.append(ParentGrievance(
                parent_issue=g.issue or "Untitled Grievance",
                category=g.category or "General",
                priority=g.priority or "medium",
                status=g.status or "pending",
                children=[ChildGrievance(
                    id=str(g.id),
                    complaint_id=g.complaint_id,
                    issue=g.issue,
                    description=g.description,
                    location=g.location,
                    category=g.category,
                    priority=g.priority,
                    status=g.status,
                    source=g.source,
                    created_at=str(g.created_at) if g.created_at else None,
                    identity=g.identity,
                )],
                child_ids=[str(g.id)],
            ))

    return SegregateResponse(groups=result_groups)


# ─────────────────────────────────────────
#  PATCH /grievances/segregate/update-status
#  Bulk-update status for a parent group
# ─────────────────────────────────────────

class BulkStatusUpdateRequest(BaseModel):
    grievance_ids: List[str]   # all child IDs in the parent group
    status: str                # new status: pending | in_progress | resolved


@router.patch(
    "/segregate/update-status",
    summary="Update status for a parent group — cascades to all children",
)
def bulk_update_status(
    body: BulkStatusUpdateRequest,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    token_data = _get_token_payload(authorization)
    _require_admin(token_data)

    if body.status not in ("pending", "in_progress", "resolved"):
        raise HTTPException(status_code=400, detail="Invalid status value")

    grievances = db.query(Grievance).filter(Grievance.id.in_(body.grievance_ids)).all()

    if not grievances:
        raise HTTPException(status_code=404, detail="No grievances found")

    updated_ids = []
    for g in grievances:
        g.status = body.status
        updated_ids.append(str(g.id))

        # Send WhatsApp notification to each user
        status_labels = {
            "pending": "moved to Pending",
            "in_progress": "now In Progress",
            "resolved": "Resolved",
        }
        status_text = status_labels.get(body.status, body.status)
        complaint_label = g.complaint_id or str(g.id)
        message = (
            f"Hello! Your complaint ({complaint_label}) has been {status_text}. "
            f"Thank you for your patience."
        )

        phone_number = None
        if g.source == "whatsapp" and g.identity:
            phone_number = g.identity
        elif g.identity:
            user = db.query(User).filter(User.id == g.identity).first()
            if user and user.mobile_number:
                phone_number = user.mobile_number

        if phone_number:
            phone_number = phone_number.lstrip("+").strip()
            if not phone_number.startswith("91"):
                phone_number = f"91{phone_number}"
            try:
                send_whatsapp_message(phone_number, message)
            except Exception as exc:
                print(f"[WhatsApp] Failed to notify {phone_number}: {exc}")

    db.commit()

    return {
        "success": True,
        "updated_count": len(updated_ids),
        "updated_ids": updated_ids,
        "new_status": body.status,
    }


# ─────────────────────────────────────────
#  POST /grievances/segregate/unlink
#  Remove a child grievance from a group
# ─────────────────────────────────────────

class UnlinkRequest(BaseModel):
    grievance_id: str   # the child to unlink (just returns success, grouping is frontend-managed)


@router.post(
    "/segregate/unlink",
    summary="Unlink a child grievance from its parent group",
)
def unlink_grievance(
    body: UnlinkRequest,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    token_data = _get_token_payload(authorization)
    _require_admin(token_data)

    grievance = db.query(Grievance).filter(Grievance.id == body.grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    return {"success": True, "unlinked_id": str(grievance.id)}


# ─────────────────────────────────────────
#  POST /grievances/forward-to-department
#  Forward a segregated parent group to a department
# ─────────────────────────────────────────

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
    "General Administration (BMC)",
]


class ForwardToDeptRequest(BaseModel):
    parent_issue: str
    category: str
    priority: str
    dept_allocated: str
    child_grievance_ids: List[str]


@router.post(
    "/forward-to-department",
    summary="Forward a segregated parent group to a department",
)
def forward_to_department(
    body: ForwardToDeptRequest,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    token_data = _get_token_payload(authorization)
    _require_admin(token_data)

    if body.dept_allocated not in DEPARTMENTS:
        raise HTTPException(status_code=400, detail="Invalid department")

    if not body.child_grievance_ids:
        raise HTTPException(status_code=400, detail="No child grievances provided")

    # Check if any child is already forwarded
    existing = (
        db.query(DepartmentGrievance)
        .filter(
            DepartmentGrievance.child_grievance_ids.overlap(body.child_grievance_ids)
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Some grievances are already forwarded to a department.",
        )

    dept_grievance = DepartmentGrievance(
        parent_issue=body.parent_issue,
        category=body.category,
        priority=body.priority,
        status="pending",
        dept_allocated=body.dept_allocated,
        child_grievance_ids=body.child_grievance_ids,
    )
    db.add(dept_grievance)

    # Update all child grievances status to pending and set dept_allocated
    children = db.query(Grievance).filter(Grievance.id.in_(body.child_grievance_ids)).all()
    for g in children:
        g.status = "pending"
        g.dept_allocated = body.dept_allocated

    db.commit()
    db.refresh(dept_grievance)

    return {
        "success": True,
        "department_grievance_id": str(dept_grievance.id),
        "parent_issue": dept_grievance.parent_issue,
        "dept_allocated": dept_grievance.dept_allocated,
        "child_count": len(body.child_grievance_ids),
    }


# ─────────────────────────────────────────
#  GET /grievances/department-grievances
#  Get grievances assigned to officer's department
# ─────────────────────────────────────────

@router.get(
    "/department-grievances",
    summary="Get department grievances for the logged-in officer",
)
def get_department_grievances(
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    token_data = _get_token_payload(authorization)
    if token_data.get("role") not in ("officer", "admin"):
        raise HTTPException(status_code=403, detail="Officer or admin access required.")

    query = db.query(DepartmentGrievance)

    # Officers see only their department's grievances
    if token_data.get("role") == "officer":
        dept = token_data.get("department")
        if not dept:
            raise HTTPException(status_code=403, detail="No department assigned to this officer.")
        query = query.filter(DepartmentGrievance.dept_allocated == dept)

    rows = query.order_by(DepartmentGrievance.created_at.desc()).all()

    # Collect all child IDs across all rows to fetch in one query
    all_child_ids = set()
    for r in rows:
        if r.child_grievance_ids:
            all_child_ids.update(r.child_grievance_ids)

    # Fetch all child grievances in one go
    child_map = {}
    if all_child_ids:
        children = db.query(Grievance).filter(Grievance.id.in_(all_child_ids)).all()
        # Pre-fetch user info for API-source children
        user_ids = [str(c.identity) for c in children if c.source != "whatsapp" and c.identity]
        user_lookup = {}
        if user_ids:
            users = db.query(User).filter(User.id.in_(user_ids)).all()
            for u in users:
                user_lookup[str(u.id)] = u
        for c in children:
            u_name = None
            u_phone = None
            if c.identity:
                if c.source == "whatsapp":
                    u_phone = c.identity
                else:
                    matched_user = user_lookup.get(str(c.identity))
                    if matched_user:
                        u_name = matched_user.full_name
                        u_phone = matched_user.mobile_number
            child_map[str(c.id)] = {
                "id": str(c.id),
                "complaint_id": c.complaint_id,
                "issue": c.issue,
                "description": c.description,
                "location": c.location,
                "latitude": c.latitude,
                "longitude": c.longitude,
                "category": c.category,
                "priority": c.priority,
                "status": c.status,
                "source": c.source,
                "before_photo": c.before_photo,
                "after_photo": c.after_photo,
                "user_name": u_name,
                "user_phone": u_phone,
                "created_at": str(c.created_at) if c.created_at else None,
            }

    return [
        {
            "id": str(r.id),
            "parent_issue": r.parent_issue,
            "category": r.category,
            "priority": r.priority,
            "status": r.status,
            "dept_allocated": r.dept_allocated,
            "child_grievance_ids": r.child_grievance_ids,
            "children": [child_map.get(cid, {"id": cid}) for cid in (r.child_grievance_ids or [])],
            "created_at": str(r.created_at) if r.created_at else None,
            "updated_at": str(r.updated_at) if r.updated_at else None,
        }
        for r in rows
    ]


# ─────────────────────────────────────────
#  PATCH /grievances/department-grievances/{id}/resolve
#  Officer resolves a department grievance + all child grievances
# ─────────────────────────────────────────

@router.patch(
    "/department-grievances/{dept_grievance_id}/resolve",
    summary="Resolve a department grievance and all its child grievances",
)
def resolve_department_grievance(
    dept_grievance_id: str,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    token_data = _get_token_payload(authorization)
    if token_data.get("role") not in ("officer", "admin"):
        raise HTTPException(status_code=403, detail="Officer or admin access required.")

    dept_g = db.query(DepartmentGrievance).filter(
        DepartmentGrievance.id == dept_grievance_id
    ).first()

    if not dept_g:
        raise HTTPException(status_code=404, detail="Department grievance not found.")

    # Officers can only resolve their own department's grievances
    if token_data.get("role") == "officer":
        officer_dept = token_data.get("department")
        if dept_g.dept_allocated != officer_dept:
            raise HTTPException(status_code=403, detail="You can only resolve your department's grievances.")

    # Update department grievance status
    dept_g.status = "resolved"

    # Update all child grievances in the grievances table
    if dept_g.child_grievance_ids:
        children = db.query(Grievance).filter(
            Grievance.id.in_(dept_g.child_grievance_ids)
        ).all()
        for g in children:
            g.status = "resolved"

    db.commit()

    return {
        "success": True,
        "department_grievance_id": str(dept_g.id),
        "resolved_children": len(dept_g.child_grievance_ids or []),
    }


# ─────────────────────────────────────────
#  GET /grievances/allocated-ids
#  Returns all child grievance IDs already forwarded
# ─────────────────────────────────────────

@router.get(
    "/allocated-ids",
    summary="Get all grievance IDs already forwarded to departments",
)
def get_allocated_ids(
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    token_data = _get_token_payload(authorization)
    _require_admin(token_data)

    rows = db.query(DepartmentGrievance.child_grievance_ids).all()
    all_ids = set()
    for (ids,) in rows:
        if ids:
            all_ids.update(ids)

    return {"allocated_ids": list(all_ids)}


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
    cached_text_result = None  # Reuse text classification from image comparison
    if before_photo is not None:
        # Read bytes first (stream is consumed after first read)
        image_bytes = await before_photo.read()

        # ── AI validation: ensure image aligns with description ───────────────
        combined_text = f"{issue or ''} {description or ''}".strip()
        if combined_text:
            cleaned = clean_text(combined_text)
            ai_result = await analyze_and_compare(combined_text, cleaned, image_bytes)

            # Cache the text classification to avoid a redundant Gemini call later
            cached_text_result = ai_result.get("text_analysis")

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

    # ── Auto-classify using Gemini AI (reuse cached result if available) ─────
    if cached_text_result and cached_text_result.get("processed_by") != "fallback":
        # Reuse classification from image comparison — no extra Gemini call
        from classifier import assign_department
        ALLOWED_CATEGORIES = ['Water', 'Road', 'Garbage', 'Electricity', 'Traffic', 'Drainage', 'Infrastructure', 'Environment', 'General']
        raw_text = f"{issue or ''} {description or ''}"
        resolved_category = cached_text_result.get("category", "General")
        if resolved_category not in ALLOWED_CATEGORIES:
            cat_lower = resolved_category.lower()
            resolved_category = next((c for c in ALLOWED_CATEGORIES if c.lower() == cat_lower), "General")
        priority = cached_text_result.get("severity", "medium")
        dept_allocated = cached_text_result.get("department") or assign_department(raw_text, resolved_category)
    else:
        resolved_category, priority, dept_allocated = classify_grievance(
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
        dept_allocated=dept_allocated,
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
#  GET /grievances/nearby  –  Location-based neighborhood
# ─────────────────────────────────────────

class NearbyRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 5.0   # default 5 km radius


def _haversine_km(lat1, lon1, lat2, lon2):
    """Return distance in km between two lat/lng points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get(
    "/nearby",
    response_model=List[GrievanceResponse],
    summary="Get grievances near a lat/lng within a radius (authenticated user)",
)
def get_nearby_grievances(
    latitude: float = 0.0,
    longitude: float = 0.0,
    radius_km: float = 5.0,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    """
    Returns grievances within `radius_km` of the given latitude/longitude.
    Requires a valid JWT (any authenticated user).
    """
    _get_token_payload(authorization)

    # Rough bounding-box filter first (for DB performance)
    delta_lat = radius_km / 111.0
    delta_lng = radius_km / (111.0 * max(math.cos(math.radians(latitude)), 0.01))

    rows = (
        db.query(Grievance)
        .filter(
            Grievance.latitude.isnot(None),
            Grievance.longitude.isnot(None),
            Grievance.latitude.between(latitude - delta_lat, latitude + delta_lat),
            Grievance.longitude.between(longitude - delta_lng, longitude + delta_lng),
        )
        .order_by(Grievance.created_at.desc())
        .all()
    )

    # Fine filter with haversine
    nearby = [
        g for g in rows
        if _haversine_km(latitude, longitude, g.latitude, g.longitude) <= radius_km
    ]

    return [_to_response(g) for g in nearby]


# ─────────────────────────────────────────
#  POST /grievances/{id}/upvote  –  Upvote a grievance
# ─────────────────────────────────────────

@router.post(
    "/{grievance_id}/upvote",
    response_model=GrievanceResponse,
    summary="Upvote a grievance (authenticated user)",
)
def upvote_grievance(
    grievance_id: str,
    authorization: str = Header(..., alias="Authorization"),
    db: Session = Depends(get_db),
):
    """
    Toggle upvote on a grievance. If user already upvoted, remove the upvote.
    Upvotes increase the priority weight of the grievance.
    """
    token_data = _get_token_payload(authorization)
    user_id: str = token_data.get("sub")

    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing user identifier.")

    grievance = db.query(Grievance).filter(
        or_(
            Grievance.id == grievance_id,
            Grievance.complaint_id == grievance_id,
        )
    ).first()

    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found.")

    upvoted_by = list(grievance.upvoted_by or [])

    if user_id in upvoted_by:
        upvoted_by.remove(user_id)
    else:
        upvoted_by.append(user_id)

    grievance.upvoted_by = upvoted_by
    grievance.upvotes = len(upvoted_by)

    # Auto-escalate priority based on upvote count
    if grievance.upvotes >= 20 and grievance.priority not in ("critical",):
        grievance.priority = "critical"
    elif grievance.upvotes >= 10 and grievance.priority not in ("critical", "high"):
        grievance.priority = "high"

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

    - Requires a valid JWT with `role == "admin"` or `role == "officer"`.
    - Officers can only update the `status` field.
    - Only fields explicitly provided in the request body are updated.
    - `grievance_id` may be either the UUID `id` or the human-readable `complaint_id`.
    """
    token_data = _get_token_payload(authorization)
    role = token_data.get("role")
    if role not in (UserRole.admin.value, UserRole.officer.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or officer access required.",
        )

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

    # Officers can only update status
    if role == UserRole.officer.value:
        update_data = {k: v for k, v in update_data.items() if k == "status"}
        if not update_data:
            raise HTTPException(status_code=403, detail="Officers can only update the status field.")

    for field, value in update_data.items():
        setattr(grievance, field, value)

    db.commit()
    db.refresh(grievance)

    # ── Send WhatsApp notification if status changed ─────────────────────────
    if "status" in update_data:
        new_status = update_data["status"]
        status_labels = {
            "pending": "moved to Pending",
            "in_progress": "now In Progress",
            "resolved": "Resolved",
        }
        status_text = status_labels.get(new_status, new_status)
        complaint_label = grievance.complaint_id or str(grievance.id)
        message = (
            f"Hello! Your complaint ({complaint_label}) has been {status_text}. "
            f"Thank you for your patience."
        )

        phone_number: Optional[str] = None

        if grievance.source == "whatsapp" and grievance.identity:
            # identity is the phone number itself
            phone_number = grievance.identity
        elif grievance.identity:
            # identity is a user_id — look up mobile_number from users table
            user = db.query(User).filter(User.id == grievance.identity).first()
            if user and user.mobile_number:
                phone_number = user.mobile_number

        if phone_number:
            # Ensure E.164 format: prepend country code 91 if missing
            phone_number = phone_number.lstrip("+").strip()
            if not phone_number.startswith("91"):
                phone_number = f"91{phone_number}"
            try:
                send_whatsapp_message(phone_number, message)
            except Exception as exc:
                print(f"[WhatsApp] Failed to notify {phone_number}: {exc}")

    return _to_response(grievance, db)


# ─────────────────────────────────────────
#  Internal serialiser
# ─────────────────────────────────────────

def _to_response(g: Grievance, db: Session = None) -> GrievanceResponse:
    user_name = None
    user_phone = None
    if db and g.identity:
        if g.source == "whatsapp":
            user_phone = g.identity
        else:
            user = db.query(User).filter(User.id == g.identity).first()
            if user:
                user_name = user.full_name
                user_phone = user.mobile_number
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
        upvotes=g.upvotes or 0,
        upvoted_by=g.upvoted_by or [],
        dept_allocated=g.dept_allocated,
        user_name=user_name,
        user_phone=user_phone,
        created_at=str(g.created_at) if g.created_at else None,
        updated_at=str(g.updated_at) if g.updated_at else None,
    )
