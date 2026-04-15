"""
Seed script: loads dummy_data.json and inserts all records into the `grievances` table.

Usage (from the backend/ directory):
    python seed_grievances.py
"""

import json
import uuid
from pathlib import Path

from database import SessionLocal, engine, Base
from models.grievance import Grievance

# ── Ensure tables exist ────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Load JSON ──────────────────────────────────────────────────────────────────
DATA_FILE = Path(__file__).parent / "dummy_data.json"

with open(DATA_FILE, "r", encoding="utf-8") as f:
    records = json.load(f)

# ── Insert into DB ─────────────────────────────────────────────────────────────
db = SessionLocal()

try:
    inserted = 0
    skipped = 0

    for item in records:
        # Skip if complaint_id already exists (idempotent re-runs)
        existing = (
            db.query(Grievance)
            .filter(Grievance.complaint_id == item["complaint_id"])
            .first()
        )
        if existing:
            print(f"  [SKIP]   {item['complaint_id']} already in DB")
            skipped += 1
            continue

        grievance = Grievance(
            id=uuid.UUID(item["id"]),
            complaint_id=item["complaint_id"],
            identity=item.get("identity"),
            issue=item.get("issue"),
            description=item.get("description"),
            location=item.get("location"),
            latitude=item.get("latitude"),
            longitude=item.get("longitude"),
            before_photo=item.get("before_photo"),
            after_photo=item.get("after_photo"),
            category=item.get("category", "General"),
            priority=item.get("priority", "medium"),
            status=item.get("status", "pending"),
            source=item.get("source", "api"),
        )
        db.add(grievance)
        print(f"  [INSERT] {item['complaint_id']} — {item['issue']} ({item['location']})")
        inserted += 1

    db.commit()
    print(f"\n✅ Done — {inserted} inserted, {skipped} skipped.")

except Exception as e:
    db.rollback()
    print(f"\n❌ Error: {e}")
    raise

finally:
    db.close()
