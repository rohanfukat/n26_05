"""
Seed script: Insert 100_rows_data.json entries into the grievances table.
Usage:  python seed_100_rows.py
"""

import json
import uuid
from pathlib import Path
from datetime import datetime
from database import SessionLocal
from models.grievance import Grievance

DATA_FILE = Path(__file__).parent / "100_rows_data.json"


def load_and_seed():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        rows = json.load(f)

    db = SessionLocal()
    try:
        for row in rows:
            grievance = Grievance(
                id=uuid.UUID(row["id"]),
                complaint_id=row.get("complaint_id"),
                identity=row.get("identity"),
                issue=row.get("issue"),
                description=row.get("description"),
                location=row.get("location"),
                latitude=row.get("latitude"),
                longitude=row.get("longitude"),
                before_photo=row.get("before_photo"),
                after_photo=row.get("after_photo"),
                category=row.get("category"),
                priority=row.get("priority"),
                status=row.get("status"),
                source=row.get("source"),
                upvotes=row.get("upvotes", 0),
                upvoted_by=row.get("upvoted_by", []),
                dept_allocated=row.get("dept_allocated"),
            )
            db.merge(grievance)  # merge = insert or update if id exists

        db.commit()
        print(f"✅ Successfully seeded {len(rows)} grievances.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    load_and_seed()